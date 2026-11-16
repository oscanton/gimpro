# gimpro

Nombre provisional del proyecto: **gimpro** (gym + impro).

Aplicación PWA de entrenamiento para improvisación teatral. Su objetivo no es ser una enciclopedia de juegos ni un simple generador de sugerencias, sino un **gimnasio modular de entrenamiento** que permita practicar competencias concretas de impro de forma individual y colectiva.

## Principios de producto

- Entrenar habilidades, no consumir contenido.
- Priorizar práctica, repetición, observación y progresión.
- Mantener la app útil sin IA.
- Diseñar primero para móvil, con funcionamiento offline.
- Evitar gamificación basada en puntos vacíos o castigos por ausencia.
- Medir actividad, diversidad y dificultad entrenadas; no "talento".
- Mantener una separación clara entre contenido pedagógico, motor de entrenamiento, presentación y persistencia.

## Estado actual

Base publicada: **v0.1.0**. La rama principal incorpora además el generador
local-first de **Motores** aprobado después de esa versión.

El paquete de decisiones y los ADR fue aprobado el 15 de noviembre de 2026.
La primera vertical funcional ya cubre:

- catálogo declarativo con veinte ejercicios;
- constructor determinista de sesiones de 5, 10 y 20 minutos;
- flujo sesión → ejercicio → temporizador → autoevaluación → resumen;
- repetición y avance de dificultad;
- historial y progreso local en IndexedDB;
- PWA con precache y actualización no disruptiva;
- generador local de motores con rareza, anti-repetición y ayuda contextual;
- pruebas unitarias, E2E, offline y accesibilidad.

## Documentación

- `docs/00-product-vision.md`
- `docs/01-v0-scope.md`
- `docs/02-functional-specification.md`
- `docs/03-training-model.md`
- `docs/04-ux-and-information-architecture.md`
- `docs/05-technical-architecture.md`
- `docs/06-data-and-content-model.md`
- `docs/07-motivation-and-progress.md`
- `docs/08-non-functional-requirements.md`
- `docs/09-roadmap.md`
- `docs/10-testing-and-validation.md`
- `docs/11-open-decisions.md`
- `docs/12-session-builder.md`
- `docs/13-wireframes.md`
- `docs/18-motor-generator.md`
- `docs/adr/`

## Contenido

- `content/taxonomy.md`: taxonomía inicial de competencias.
- `content/exercise-template.md`: contrato funcional de un ejercicio.
- `data/schema/exercise.schema.json`: contrato JSON Schema ejecutable.
- `data/exercises.json`: catálogo V0 inicial.
- `data/motors/es.json`: contenido curado, piezas y plantillas del generador.
- `data/schema/motor-catalog.schema.json`: contrato del catálogo lingüístico.

## Desarrollo

Requisitos: Node.js 22 o superior y pnpm 11.

```bash
pnpm install
pnpm dev
```

En Windows también puede utilizarse el lanzador:

```bat
gimpro.bat
```

El menú permite arrancar el servidor local, abrir la versión publicada en
GitHub Pages, ejecutar pruebas o generar el build de despliegue. También acepta
comandos directos:

```bat
gimpro.bat local
gimpro.bat pages
gimpro.bat test
gimpro.bat e2e
gimpro.bat build
```

Comprobación completa:

```bash
pnpm check
pnpm test:e2e
```

`pnpm check` valida contenido, lint, unidades y build de producción. Las
pruebas E2E requieren los navegadores de Playwright:

```bash
pnpm exec playwright install chromium webkit
```

## GitHub Pages

El workflow `.github/workflows/pages.yml` genera la aplicación con base
`/gimpro/` y publica `dist/`. El repositorio debe tener **Settings → Pages →
Source: GitHub Actions**. La URL prevista es:

`https://oscanton.github.io/gimpro/#/home`

## Arquitectura

- `src/core/`: dominio y constructor de sesiones.
- `src/core/motors/`: contrato y proveedor local de motores.
- `src/ui/`: navegación y vistas.
- `src/storage/`: IndexedDB y preferencias.
- `src/pwa/`: registro y Service Worker.
- `data/`: contenido pedagógico declarativo.
- `tests/`: pruebas unitarias y flujos de navegador.

## Regla de trabajo

La documentación funcional es la fuente de verdad. Cuando comience el desarrollo, cualquier cambio relevante de comportamiento deberá actualizar primero o simultáneamente la documentación correspondiente.
