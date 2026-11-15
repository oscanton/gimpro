# 06. Modelo de datos y contenido

## 1. Principio

El contenido pedagógico debe ser declarativo y versionable. Añadir un ejercicio nuevo no debería exigir crear una pantalla nueva.

## 2. Entidades principales

### Exercise
Define un ejercicio reutilizable.

Campos funcionales previstos:

- id
- slug
- name
- short_description
- primary_skill
- secondary_skills
- training_area
- mode
- min_players
- max_players
- difficulty
- estimated_duration
- objective
- instructions
- rules
- phases
- stimuli_sources
- self_evaluation
- variants
- progression
- prerequisites
- requirements
- tags
- source_notes
- status
- content_version

El contrato ejecutable está en `data/schema/exercise.schema.json`. El catálogo
inicial se mantiene en `data/exercises.json` y se valida antes de cada build.

### Variant
Modifica un ejercicio manteniendo su identidad pedagógica.

### ProgressionStep
Describe un salto de dificultad coherente.

### TrainingSession
Secuencia de ejercicios.

### SessionTemplate
Regla reusable para construir sesiones.

### TrainingEvent
Ejecución real de un ejercicio por parte del usuario.

Campos mínimos: `id`, `session_id`, `exercise_id`, `progression_step_id`,
`started_at`, `completed_at`, `planned_duration_seconds`,
`completed_duration_seconds`, `skills`, `self_evaluation`, `outcome` y
`content_version`.

### Skill
Competencia entrenable.

### Stimulus
Dato aleatorio reutilizable: objeto, lugar, relación, objetivo, emoción, profesión, restricción, etc.

## 3. Reglas de modelado

- IDs estables y no dependientes del nombre visible.
- Separar texto de presentación y lógica de selección.
- Una competencia principal por ejercicio; secundarias opcionales.
- No duplicar listas de estímulos entre ejercicios.
- Dificultad independiente de "nivel del usuario".
- Conservar versión de contenido para poder interpretar históricos.
- Distinguir `null` (sin responder) de `false` en autoevaluación.
- Validar el catálogo completo contra JSON Schema en CI.

## 4. Persistencia V0

IndexedDB `gimpro`, versión 1:

- `sessions`, clave `id`, índices `status` y `started_at`;
- `training_events`, clave `id`, índices `session_id`, `exercise_id` y `started_at`.

`localStorage` conserva únicamente preferencias: modalidad, sonido y última
duración/foco. El catálogo se distribuye con la aplicación y no se copia a la
base de usuario.

## 5. Autoevaluación

Cada criterio debe ser:

- observable;
- breve;
- relacionado con el foco;
- preferiblemente sí/no o escala corta;
- no moralizante;
- no basado en "ser gracioso".

## 6. Fuentes

Los ejercicios adaptados de tradiciones o referencias deben conservar notas internas de procedencia y transformación. No se copiarán textos extensos protegidos; se redactarán consignas propias basadas en principios y prácticas de entrenamiento.

Campos: `source_type`, `title`, `author`, `url`, `license`,
`adaptation_notes` y `reviewed_at`. `source_type` puede ser `original`,
`adaptation`, `tradition`, `public_domain` o `reference`.
