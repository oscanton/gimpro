import { areaLabel, CATALOG_VERSION, exercises, findExercise } from "../core/catalog.js";
import { buildSession } from "../core/sessionBuilder.js";
import {
  listSessions,
  listTrainingEvents,
  saveSession,
  saveTrainingEvent
} from "../storage/db.js";
import { loadPreferences, savePreferences } from "../storage/preferences.js";
import { currentRoute, navigate, watchRoute } from "./router.js";

const ACTIVE_SESSION_KEY = "gimpro.active-session.v1";

export class GimproApp {
  /** @param {HTMLElement} root */
  constructor(root) {
    this.root = root;
    this.preferences = loadPreferences();
    this.activeSession = restoreActiveSession();
    this.run = null;
    this.timerId = null;
    this.pendingEvent = null;
    this.notice = "";
    this.updateAction = null;
  }

  start() {
    watchRoute(() => this.render());
    window.addEventListener("gimpro:offline-ready", () => {
      this.notice = "Gimpro ya está disponible sin conexión.";
      this.render();
    });
    window.addEventListener("gimpro:update-available", (event) => {
      this.updateAction = event.detail.update;
      this.notice = "Hay una nueva versión disponible.";
      this.render();
    });

    if (!window.location.hash) navigate("/home");
    else this.render();
  }

  async render() {
    this.stopTimer();
    const route = currentRoute();
    const minimal = route.startsWith("/exercise/") || ["/evaluation", "/decision"].includes(route);

    this.root.innerHTML = `
      <div class="app-shell ${minimal ? "app-shell--focused" : ""}">
        ${minimal ? "" : headerTemplate(this.preferences.sound)}
        ${this.notice ? noticeTemplate(this.notice, Boolean(this.updateAction)) : ""}
        <main id="main" class="main-content" tabindex="-1">
          ${await this.routeTemplate(route)}
        </main>
        ${minimal ? "" : navigationTemplate(route)}
      </div>
    `;

    this.bindGlobalActions();
    this.bindRouteActions(route);
    if (this.run?.status === "running") this.resumeTimer();
  }

  async routeTemplate(route) {
    if (route === "/home") return this.homeTemplate();
    if (route === "/explore") return this.exploreTemplate();
    if (route === "/progress") return this.progressTemplate();
    if (route === "/session/setup") return this.setupTemplate();
    if (route === "/evaluation") return this.evaluationTemplate();
    if (route === "/decision") return this.decisionTemplate();
    if (route === "/summary") return this.summaryTemplate();
    if (route.startsWith("/exercise/")) return this.exerciseTemplate(route.split("/").at(-1));
    return notFoundTemplate();
  }

  async homeTemplate() {
    const events = await listTrainingEvents();
    const recent = events[0] ? findExercise(events[0].exercise_id) : null;
    return `
      <section class="hero stack-xl">
        <div class="eyebrow">Gimnasio de improvisación</div>
        <h1>¿Entrenamos?</h1>
        <p class="hero__lead">Elige cuánto tiempo tienes. Nosotros ordenamos el foco.</p>
        <div class="duration-picker" role="group" aria-label="Duración rápida">
          ${[5, 10, 20]
            .map(
              (minutes) => `
                <button class="chip ${this.preferences.durationMinutes === minutes ? "chip--selected" : ""}"
                  data-duration="${minutes}" aria-pressed="${this.preferences.durationMinutes === minutes}">
                  ${minutes} min
                </button>`
            )
            .join("")}
        </div>
        <button class="button button--primary button--large" data-action="train">Entréname</button>
      </section>

      <section class="section stack-lg" aria-labelledby="focus-title">
        <div class="section-heading">
          <div>
            <div class="eyebrow">Foco rápido</div>
            <h2 id="focus-title">¿Qué quieres entrenar?</h2>
          </div>
        </div>
        <div class="focus-grid">
          ${focusCards()}
        </div>
      </section>

      <section class="section continuity-card" aria-labelledby="continue-title">
        <div>
          <div class="eyebrow">Continuidad</div>
          <h2 id="continue-title">${recent ? "Repetir reciente" : "Tu primera sesión"}</h2>
          <p>${recent ? escapeHtml(recent.name) : "Empieza con una sesión breve y descubre tu perfil de práctica."}</p>
        </div>
        <button class="button button--secondary" data-action="${recent ? "repeat-recent" : "train"}" data-exercise-id="${recent?.id ?? ""}">
          ${recent ? "Repetir" : "Empezar"}
        </button>
      </section>
    `;
  }

  exploreTemplate() {
    return `
      <section class="page-header stack-md">
        <div class="eyebrow">Catálogo V0</div>
        <h1>Explorar ejercicios</h1>
        <p>Veinte prácticas breves, filtrables por foco y modalidad.</p>
      </section>
      <section class="filter-bar" aria-label="Filtros del catálogo">
        <label>Área
          <select id="area-filter">
            <option value="all">Todas</option>
            ${["BODY", "MIND", "ACTOR", "IMPRO", "SCENE", "STORY"]
              .map((area) => `<option value="${area}">${areaLabel(area)}</option>`)
              .join("")}
          </select>
        </label>
        <label>Modalidad
          <select id="mode-filter">
            <option value="all">Todas</option>
            <option value="solo">Solo</option>
            <option value="pair">Pareja</option>
            <option value="group">Grupo</option>
          </select>
        </label>
      </section>
      <section id="exercise-list" class="card-grid" aria-live="polite">
        ${exerciseCards(exercises)}
      </section>
    `;
  }

  async progressTemplate() {
    const [events, sessions] = await Promise.all([listTrainingEvents(), listSessions()]);
    const completedSessions = sessions.filter((session) => session.status === "completed");
    if (events.length === 0) {
      return `
        <section class="empty-state stack-lg">
          <div class="empty-state__mark">0</div>
          <h1>Aún no hay historial</h1>
          <p>Completa un ejercicio para empezar a ver tu distribución de práctica.</p>
          <button class="button button--primary" data-action="train">Iniciar sesión</button>
        </section>
      `;
    }

    const totals = new Map();
    let totalSeconds = 0;
    for (const event of events) {
      const exercise = findExercise(event.exercise_id);
      if (!exercise) continue;
      totalSeconds += event.completed_duration_seconds;
      totals.set(
        exercise.training_area,
        (totals.get(exercise.training_area) ?? 0) + event.completed_duration_seconds
      );
    }
    const maximum = Math.max(...totals.values());
    return `
      <section class="page-header stack-md">
        <div class="eyebrow">Actividad local</div>
        <h1>Tu práctica</h1>
        <p><strong>${Math.round(totalSeconds / 60)} min</strong> · ${completedSessions.length} sesiones completadas</p>
      </section>
      <section class="progress-card stack-lg" aria-labelledby="distribution-title">
        <h2 id="distribution-title">Distribución por área</h2>
        ${[...totals.entries()]
          .sort((left, right) => right[1] - left[1])
          .map(
            ([area, seconds]) => `
              <div class="progress-row">
                <div class="progress-row__labels"><span>${areaLabel(area)}</span><span>${Math.round(seconds / 60)} min</span></div>
                <div class="progress-track"><span style="width:${Math.max(8, (seconds / maximum) * 100)}%"></span></div>
              </div>`
          )
          .join("")}
      </section>
    `;
  }

  setupTemplate() {
    return `
      <section class="page-header stack-md">
        <button class="text-button" data-route="/home">← Volver</button>
        <div class="eyebrow">Sesión rápida</div>
        <h1>Preparar sesión</h1>
        <p>El motor reservará tiempo para observar y cambiar de ejercicio.</p>
      </section>
      <form id="session-form" class="form-card stack-xl">
        <fieldset>
          <legend>Duración</legend>
          <div class="segmented">
            ${[5, 10, 20]
              .map(
                (minutes) => `<label><input type="radio" name="duration" value="${minutes}" ${this.preferences.durationMinutes === minutes ? "checked" : ""}><span>${minutes} min</span></label>`
              )
              .join("")}
          </div>
        </fieldset>
        <label>Foco
          <select name="focus">
            ${[
              ["surprise", "Sorpréndeme"],
              ["body", "Cuerpo"],
              ["mind", "Mente"],
              ["character", "Personaje"],
              ["scene", "Escena"]
            ]
              .map(([value, label]) => `<option value="${value}" ${this.preferences.focus === value ? "selected" : ""}>${label}</option>`)
              .join("")}
          </select>
        </label>
        <label>Modalidad
          <select name="mode">
            ${[
              ["solo", "Solo"],
              ["pair", "Pareja"],
              ["group", "Grupo"]
            ]
              .map(([value, label]) => `<option value="${value}" ${this.preferences.mode === value ? "selected" : ""}>${label}</option>`)
              .join("")}
          </select>
        </label>
        <button class="button button--primary button--large" type="submit">Crear sesión</button>
      </form>
    `;
  }

  exerciseTemplate(exerciseId) {
    const exercise = findExercise(exerciseId);
    if (!exercise) return notFoundTemplate();
    const item = this.currentPlanItem(exerciseId);
    const step = exercise.progression_steps.find(
      (candidate) => candidate.id === item?.progression_step_id
    ) ?? exercise.progression_steps[0];

    if (this.run?.exerciseId === exerciseId && ["running", "paused"].includes(this.run.status)) {
      return runningTemplate(exercise, this.run.remainingSeconds);
    }

    const position = this.activeSession
      ? `${this.activeSession.current_index + 1} de ${this.activeSession.exercises.length}`
      : "Ejercicio libre";
    return `
      <section class="exercise-intro stack-xl">
        <div class="exercise-meta"><span>${position}</span><span>${Math.round(exercise.estimated_duration_seconds / 60)} min</span></div>
        <div>
          <div class="eyebrow">${areaLabel(exercise.training_area)} · ${escapeHtml(step.label)}</div>
          <h1>${escapeHtml(exercise.name)}</h1>
          <p class="hero__lead">${escapeHtml(exercise.objective)}</p>
        </div>
        <div class="challenge-card stack-md">
          <h2>Reto</h2>
          <p>${escapeHtml(exercise.focus)}</p>
          <ol>${exercise.instructions.map((instruction) => `<li>${escapeHtml(instruction)}</li>`).join("")}</ol>
        </div>
        <div class="rules"><strong>Reglas esenciales</strong><ul>${exercise.rules.map((rule) => `<li>${escapeHtml(rule)}</li>`).join("")}</ul></div>
        <button class="button button--primary button--large" data-action="start-exercise" data-exercise-id="${exercise.id}">Iniciar</button>
        <button class="text-button" data-route="${this.activeSession ? "/session/setup" : "/explore"}">Salir</button>
      </section>
    `;
  }

  evaluationTemplate() {
    const exercise = this.pendingEvent ? findExercise(this.pendingEvent.exercise_id) : null;
    if (!exercise) return missingSessionTemplate();
    return `
      <section class="evaluation stack-xl">
        <div class="eyebrow">Observa lo ocurrido</div>
        <h1>${escapeHtml(exercise.name)}</h1>
        <form id="evaluation-form" class="stack-lg">
          ${exercise.self_evaluation
            .map(
              (criterion) => `
                <fieldset class="question-card">
                  <legend>${escapeHtml(criterion.question)}</legend>
                  <div class="segmented segmented--three">
                    ${[
                      ["yes", "Sí"],
                      ["sometimes", "A veces"],
                      ["no", "No"]
                    ]
                      .map(([value, label]) => `<label><input type="radio" name="${criterion.id}" value="${value}"><span>${label}</span></label>`)
                      .join("")}
                  </div>
                </fieldset>`
            )
            .join("")}
          <button class="button button--primary" type="submit">Continuar</button>
          <button class="text-button" type="button" data-action="skip-evaluation">Saltar</button>
        </form>
      </section>
    `;
  }

  decisionTemplate() {
    const item = this.currentPlanItem();
    const exercise = item ? findExercise(item.exercise_id) : null;
    if (!exercise) return missingSessionTemplate();
    const stepIndex = exercise.progression_steps.findIndex(
      (step) => step.id === item.progression_step_id
    );
    const nextStep = exercise.progression_steps[stepIndex + 1] ?? null;
    return `
      <section class="decision stack-xl">
        <div class="completion-mark" aria-hidden="true">✓</div>
        <div>
          <div class="eyebrow">Ejercicio completado</div>
          <h1>${escapeHtml(exercise.name)}</h1>
        </div>
        <button class="button button--primary button--large" data-action="continue-session">Continuar sesión</button>
        <div class="action-grid">
          <button class="button button--secondary" data-action="repeat-exercise">Repetir</button>
          ${nextStep ? `<button class="button button--secondary" data-action="harder-exercise">Más difícil: ${escapeHtml(nextStep.label)}</button>` : ""}
        </div>
      </section>
    `;
  }

  async summaryTemplate() {
    if (!this.activeSession) return missingSessionTemplate();
    const events = await listTrainingEvents();
    const sessionEvents = events.filter((event) => event.session_id === this.activeSession.id);
    const seconds = sessionEvents.reduce(
      (total, event) => total + event.completed_duration_seconds,
      0
    );
    const areas = [...new Set(sessionEvents.map((event) => findExercise(event.exercise_id)?.training_area).filter(Boolean))];
    return `
      <section class="summary stack-xl">
        <div class="completion-mark" aria-hidden="true">✓</div>
        <div>
          <div class="eyebrow">Sesión completada</div>
          <h1>${Math.max(1, Math.round(seconds / 60))} min de práctica</h1>
          <p>${sessionEvents.length} ejercicios · ${areas.map(areaLabel).join(" · ")}</p>
        </div>
        <div class="summary-list">
          ${sessionEvents
            .map((event) => {
              const exercise = findExercise(event.exercise_id);
              return `<div><span>${escapeHtml(exercise?.name ?? event.exercise_id)}</span><span>${Math.max(1, Math.round(event.completed_duration_seconds / 60))} min</span></div>`;
            })
            .join("")}
        </div>
        <button class="button button--primary button--large" data-action="finish-session">Volver a Inicio</button>
      </section>
    `;
  }

  bindGlobalActions() {
    this.root.querySelectorAll("[data-route]").forEach((element) => {
      element.addEventListener("click", () => navigate(element.dataset.route));
    });
    this.root.querySelector('[data-action="dismiss-notice"]')?.addEventListener("click", () => {
      this.notice = "";
      this.render();
    });
    this.root.querySelector('[data-action="apply-update"]')?.addEventListener("click", () => {
      if (this.activeSession?.status === "active") {
        this.notice = "La actualización se aplicará al terminar la sesión.";
        this.render();
        return;
      }
      this.updateAction?.();
    });
    this.root.querySelector('[data-action="toggle-sound"]')?.addEventListener("click", () => {
      this.preferences = savePreferences({ sound: !this.preferences.sound });
      this.render();
    });
    this.root.querySelectorAll('[data-action="train"]').forEach((element) => {
      element.addEventListener("click", () => navigate("/session/setup"));
    });
  }

  bindRouteActions(route) {
    if (route === "/home") this.bindHome();
    if (route === "/explore") this.bindExplore();
    if (route === "/session/setup") this.bindSetup();
    if (route.startsWith("/exercise/")) this.bindExercise();
    if (route === "/evaluation") this.bindEvaluation();
    if (route === "/decision") this.bindDecision();
    if (route === "/summary") this.bindSummary();
  }

  bindHome() {
    this.root.querySelectorAll("[data-duration]").forEach((element) => {
      element.addEventListener("click", () => {
        this.preferences = savePreferences({ durationMinutes: Number(element.dataset.duration) });
        this.render();
      });
    });
    this.root.querySelectorAll("[data-focus]").forEach((element) => {
      element.addEventListener("click", () => {
        this.preferences = savePreferences({ focus: element.dataset.focus });
        navigate("/session/setup");
      });
    });
    this.root.querySelector('[data-action="repeat-recent"]')?.addEventListener("click", (event) => {
      this.createStandaloneSession(event.currentTarget.dataset.exerciseId);
    });
  }

  bindExplore() {
    const filter = () => {
      const area = this.root.querySelector("#area-filter").value;
      const mode = this.root.querySelector("#mode-filter").value;
      const filtered = exercises.filter(
        (exercise) =>
          (area === "all" || exercise.training_area === area) &&
          (mode === "all" || exercise.modes.includes(mode))
      );
      this.root.querySelector("#exercise-list").innerHTML = exerciseCards(filtered);
      this.bindExerciseCardActions();
    };
    this.root.querySelector("#area-filter")?.addEventListener("change", filter);
    this.root.querySelector("#mode-filter")?.addEventListener("change", filter);
    this.bindExerciseCardActions();
  }

  bindExerciseCardActions() {
    this.root.querySelectorAll('[data-action="open-exercise"]').forEach((element) => {
      element.addEventListener("click", () => this.createStandaloneSession(element.dataset.exerciseId));
    });
  }

  bindSetup() {
    this.root.querySelector("#session-form")?.addEventListener("submit", async (event) => {
      event.preventDefault();
      const data = new FormData(event.currentTarget);
      const durationMinutes = Number(data.get("duration"));
      const focus = String(data.get("focus"));
      const mode = String(data.get("mode"));
      this.preferences = savePreferences({ durationMinutes, focus, mode });

      const history = await listTrainingEvents();
      const plan = buildSession({
        durationMinutes,
        focus,
        mode,
        catalog: exercises,
        history,
        seed: crypto.randomUUID()
      });
      this.activeSession = {
        id: crypto.randomUUID(),
        status: "active",
        started_at: new Date().toISOString(),
        completed_at: null,
        current_index: 0,
        catalog_version: CATALOG_VERSION,
        ...plan
      };
      await this.persistActiveSession();
      navigate(`/exercise/${this.activeSession.exercises[0].exercise_id}`);
    });
  }

  bindExercise() {
    this.root.querySelector('[data-action="start-exercise"]')?.addEventListener("click", (event) => {
      const exercise = findExercise(event.currentTarget.dataset.exerciseId);
      if (!exercise) return;
      this.run = {
        exerciseId: exercise.id,
        status: "running",
        startedAt: Date.now(),
        lastResumedAt: Date.now(),
        elapsedSeconds: 0,
        endsAt: Date.now() + exercise.estimated_duration_seconds * 1000,
        remainingSeconds: exercise.estimated_duration_seconds
      };
      this.render();
    });
    this.root.querySelector('[data-action="pause-timer"]')?.addEventListener("click", () => this.toggleTimer());
    this.root.querySelector('[data-action="finish-exercise"]')?.addEventListener("click", () => this.finishExercise());
  }

  bindEvaluation() {
    this.root.querySelector("#evaluation-form")?.addEventListener("submit", (event) => {
      event.preventDefault();
      this.saveEvaluation(new FormData(event.currentTarget));
    });
    this.root.querySelector('[data-action="skip-evaluation"]')?.addEventListener("click", () => this.saveEvaluation(null));
  }

  bindDecision() {
    this.root.querySelector('[data-action="continue-session"]')?.addEventListener("click", () => this.continueSession());
    this.root.querySelector('[data-action="repeat-exercise"]')?.addEventListener("click", () => {
      const item = this.currentPlanItem();
      if (item) navigate(`/exercise/${item.exercise_id}`);
    });
    this.root.querySelector('[data-action="harder-exercise"]')?.addEventListener("click", async () => {
      const item = this.currentPlanItem();
      const exercise = item ? findExercise(item.exercise_id) : null;
      if (!item || !exercise) return;
      const current = exercise.progression_steps.findIndex((step) => step.id === item.progression_step_id);
      const next = exercise.progression_steps[current + 1];
      if (!next) return;
      item.progression_step_id = next.id;
      await this.persistActiveSession();
      navigate(`/exercise/${item.exercise_id}`);
    });
  }

  bindSummary() {
    this.root.querySelector('[data-action="finish-session"]')?.addEventListener("click", () => {
      this.activeSession = null;
      sessionStorage.removeItem(ACTIVE_SESSION_KEY);
      navigate("/home");
    });
  }

  async createStandaloneSession(exerciseId) {
    const exercise = findExercise(exerciseId);
    if (!exercise) return;
    this.activeSession = {
      id: crypto.randomUUID(),
      status: "active",
      started_at: new Date().toISOString(),
      completed_at: null,
      current_index: 0,
      catalog_version: CATALOG_VERSION,
      seed: crypto.randomUUID(),
      duration_minutes: Math.ceil(exercise.estimated_duration_seconds / 60),
      planned_duration_seconds: exercise.estimated_duration_seconds,
      focus: exercise.training_area.toLowerCase(),
      mode: "solo",
      exercises: [
        {
          order: 1,
          exercise_id: exercise.id,
          progression_step_id: exercise.progression_steps[0].id,
          planned_duration_seconds: exercise.estimated_duration_seconds,
          reasons: ["selección directa"]
        }
      ]
    };
    await this.persistActiveSession();
    navigate(`/exercise/${exercise.id}`);
  }

  resumeTimer() {
    const update = () => {
      if (!this.run || this.run.status !== "running") return;
      this.run.remainingSeconds = Math.max(0, Math.ceil((this.run.endsAt - Date.now()) / 1000));
      const timer = this.root.querySelector("[data-timer]");
      if (timer) timer.textContent = formatTime(this.run.remainingSeconds);
      if (this.run.remainingSeconds === 0) this.finishExercise();
    };
    update();
    this.timerId = window.setInterval(update, 250);
  }

  stopTimer() {
    if (this.timerId) window.clearInterval(this.timerId);
    this.timerId = null;
  }

  toggleTimer() {
    if (!this.run) return;
    if (this.run.status === "running") {
      this.run.remainingSeconds = Math.max(0, Math.ceil((this.run.endsAt - Date.now()) / 1000));
      this.run.elapsedSeconds += Math.max(0, Math.round((Date.now() - this.run.lastResumedAt) / 1000));
      this.run.status = "paused";
      this.stopTimer();
    } else {
      this.run.status = "running";
      this.run.lastResumedAt = Date.now();
      this.run.endsAt = Date.now() + this.run.remainingSeconds * 1000;
    }
    this.render();
  }

  finishExercise() {
    if (!this.run || !this.activeSession) return;
    const item = this.currentPlanItem(this.run.exerciseId);
    const exercise = findExercise(this.run.exerciseId);
    if (!item || !exercise) return;
    const activeSegment = this.run.status === "running"
      ? Math.max(0, Math.round((Date.now() - this.run.lastResumedAt) / 1000))
      : 0;
    const elapsed = Math.max(1, this.run.elapsedSeconds + activeSegment);
    this.pendingEvent = {
      id: crypto.randomUUID(),
      session_id: this.activeSession.id,
      exercise_id: exercise.id,
      progression_step_id: item.progression_step_id,
      started_at: new Date(this.run.startedAt).toISOString(),
      completed_at: new Date().toISOString(),
      planned_duration_seconds: item.planned_duration_seconds,
      completed_duration_seconds: Math.min(elapsed, item.planned_duration_seconds),
      skills: [exercise.primary_skill, ...exercise.secondary_skills],
      self_evaluation: null,
      outcome: "completed",
      content_version: exercise.content_version
    };
    this.run = null;
    navigate("/evaluation");
  }

  async saveEvaluation(formData) {
    if (!this.pendingEvent) return;
    const exercise = findExercise(this.pendingEvent.exercise_id);
    if (!exercise) return;
    this.pendingEvent.self_evaluation = Object.fromEntries(
      exercise.self_evaluation.map((criterion) => [
        criterion.id,
        formData?.get(criterion.id) ?? null
      ])
    );
    await saveTrainingEvent(this.pendingEvent);
    this.pendingEvent = null;
    navigate("/decision");
  }

  async continueSession() {
    if (!this.activeSession) return;
    const isLast = this.activeSession.current_index >= this.activeSession.exercises.length - 1;
    if (isLast) {
      this.activeSession.status = "completed";
      this.activeSession.completed_at = new Date().toISOString();
      await this.persistActiveSession();
      navigate("/summary");
      return;
    }
    this.activeSession.current_index += 1;
    await this.persistActiveSession();
    const item = this.currentPlanItem();
    navigate(`/exercise/${item.exercise_id}`);
  }

  currentPlanItem(exerciseId = null) {
    if (!this.activeSession) return null;
    if (exerciseId) {
      return this.activeSession.exercises.find((item) => item.exercise_id === exerciseId) ?? null;
    }
    return this.activeSession.exercises[this.activeSession.current_index] ?? null;
  }

  async persistActiveSession() {
    if (!this.activeSession) return;
    sessionStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(this.activeSession));
    await saveSession(this.activeSession);
  }
}

function restoreActiveSession() {
  try {
    return JSON.parse(sessionStorage.getItem(ACTIVE_SESSION_KEY) ?? "null");
  } catch {
    return null;
  }
}

function headerTemplate(soundEnabled) {
  return `
    <header class="topbar">
      <button class="brand" data-route="/home" aria-label="Ir a Inicio"><span>G</span> Gimpro <small>beta</small></button>
      <button class="icon-button" data-action="toggle-sound" aria-label="${soundEnabled ? "Silenciar sonidos" : "Activar sonidos"}" aria-pressed="${soundEnabled}">${soundEnabled ? "Sonido" : "Silencio"}</button>
    </header>`;
}

function noticeTemplate(message, canUpdate) {
  return `<aside class="notice" role="status"><span>${escapeHtml(message)}</span><div>${canUpdate ? '<button data-action="apply-update">Actualizar</button>' : ""}<button data-action="dismiss-notice" aria-label="Cerrar aviso">×</button></div></aside>`;
}

function navigationTemplate(route) {
  return `
    <nav class="bottom-nav" aria-label="Navegación principal">
      ${[
        ["/home", "Inicio"],
        ["/explore", "Explorar"],
        ["/progress", "Progreso"]
      ]
        .map(([path, label]) => `<button data-route="${path}" ${route === path ? 'aria-current="page"' : ""}>${label}</button>`)
        .join("")}
    </nav>`;
}

function focusCards() {
  return [
    ["body", "Cuerpo", "Presencia, energía y espacio"],
    ["mind", "Mente", "Agilidad, asociación y memoria"],
    ["character", "Personaje", "Cuerpo, voz y conducta"],
    ["scene", "Escena", "PROL, realidad y consecuencias"]
  ]
    .map(
      ([focus, title, description]) => `
        <button class="focus-card" data-focus="${focus}">
          <strong>${title}</strong><span>${description}</span>
        </button>`
    )
    .join("");
}

function exerciseCards(list) {
  if (list.length === 0) return '<p class="empty-inline">No hay ejercicios para estos filtros.</p>';
  return list
    .map(
      (exercise) => `
        <article class="exercise-card">
          <div class="exercise-card__meta"><span>${areaLabel(exercise.training_area)}</span><span>${Math.round(exercise.estimated_duration_seconds / 60)} min</span></div>
          <h2>${escapeHtml(exercise.name)}</h2>
          <p>${escapeHtml(exercise.short_description)}</p>
          <button class="text-button" data-action="open-exercise" data-exercise-id="${exercise.id}">Entrenar →</button>
        </article>`
    )
    .join("");
}

function runningTemplate(exercise, remainingSeconds) {
  return `
    <section class="running-view">
      <div class="eyebrow">${escapeHtml(exercise.name)}</div>
      <div class="timer" data-timer aria-label="Tiempo restante">${formatTime(remainingSeconds)}</div>
      <p class="running-prompt">${escapeHtml(exercise.focus)}</p>
      <div class="running-actions">
        <button class="button button--secondary" data-action="pause-timer">${remainingSeconds > 0 ? "Pausa / continuar" : "Continuar"}</button>
        <button class="text-button" data-action="finish-exercise">Terminar</button>
      </div>
    </section>`;
}

function missingSessionTemplate() {
  return `<section class="empty-state stack-lg"><h1>No hay una sesión activa</h1><p>Vuelve a Inicio para crear una sesión.</p><button class="button button--primary" data-route="/home">Ir a Inicio</button></section>`;
}

function notFoundTemplate() {
  return `<section class="empty-state stack-lg"><h1>No encontramos esa pantalla</h1><button class="button button--primary" data-route="/home">Ir a Inicio</button></section>`;
}

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remaining = seconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(remaining).padStart(2, "0")}`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
