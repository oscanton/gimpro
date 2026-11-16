# 11. Registro de decisiones V0

Decisiones aprobadas el **2026-11-15** y ampliadas el **2026-11-16**. Este
documento registra la línea base de V0 y las decisiones posteriores a v0.1.0.

## Producto

- [x] `Gimpro` será el nombre visible de V0, identificado como beta.
- [x] El reto periódico queda en V0.5.
- [x] Favoritos queda en V0.5; V0 ofrece “Repetir reciente”.
- [x] El modo grupo no tiene entrada propia: es un filtro de modalidad.

## UX

- [x] Navegación persistente: Inicio, Explorar, Motores y Progreso. Inicio contiene Entréname, Entrenar habilidad y Explorar ejercicios.
- [x] Estilo minimalista deportivo con detalles teatrales.
- [x] “Más difícil” avanza al siguiente paso de progresión significativo del mismo ejercicio.
- [x] La autoevaluación es breve, visible y omitible; una omisión se registra como `null`.

## Contenido

- [x] Taxonomía aprobada como `taxonomy-v0.1`; PERFORMANCE queda reservada para V1.
- [x] Aprobados los diez entrenadores V0.
- [x] Dos ejercicios por entrenador y al menos tres progresiones por ejercicio.
- [x] Atribución mediante tipo, título, autor, URL, licencia, adaptación y fecha de revisión.

## Técnica

- [x] JavaScript vanilla, ES Modules y JSDoc con `@ts-check`.
- [x] Hash routing ligero.
- [x] IndexedDB para sesiones y eventos; `localStorage` para preferencias y el historial acotado de motores.
- [x] Librería mínima `idb` con versiones y migraciones explícitas.
- [x] Vitest + fake-indexeddb para unidades; Playwright para flujos, PWA y offline; axe-core para accesibilidad.
- [x] Vite + pnpm + `vite-plugin-pwa` en modo `injectManifest`.

## Motores (posterior a v0.1.0)

- [x] Motor es una capacidad transversal y no un entrenador adicional.
- [x] Proveedor local curado/procedural, español inicial y funcionamiento sin IA.
- [x] Rareza 0–4 con perfil automático aproximado 30 % realista / 70 % raro.
- [x] Máximo dos motores simultáneos y `style` solo bajo petición explícita.
- [x] Historial local con anti-repetición y relajación progresiva.
- [x] Herramienta propia e integración solo en ejercicios compatibles.
- [x] Contrato de proveedor estable para una integración LLM futura.

## Validación

- [x] Dos rondas: cinco usuarios de usabilidad y doce improvisadores durante catorce días.
- [x] Métricas y umbrales definidos en `docs/10-testing-and-validation.md`.
- [x] Exportación local explícita de JSON anonimizado y resumen legible; sin envío automático.

## Convención de dificultad

- `difficulty` es una estimación normalizada de 1 a 5.
- `progression_steps` es la secuencia pedagógica propia del ejercicio y puede contener entre tres y siete pasos.
- La interfaz muestra etiquetas descriptivas y no una supuesta nota de talento.
