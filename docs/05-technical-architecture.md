# 05. Arquitectura técnica

## 1. Decisión base aprobada

V0: **PWA mobile-first con HTML, CSS y JavaScript vanilla mediante ES Modules**,
JSDoc y comprobación `@ts-check`.

Objetivo: minimizar complejidad de tooling durante la validación y mantener el prototipo fácilmente auditable y modificable.

## 2. Enfoque arquitectónico

Separar cuatro capas:

### Presentación
Pantallas, componentes visuales y navegación.

### Dominio
Motor de ejercicios, sesiones, progresión, reglas de dificultad y selección.

### Contenido
Definiciones declarativas de ejercicios, estímulos, variantes y taxonomía.

### Infraestructura
Persistencia, PWA, cache offline y futuras integraciones externas.

## 3. Estructura del código

- `/src/ui/`
- `/src/core/`
- `/src/storage/`
- `/src/pwa/`
- `/src/utils/`
- `/data/`
- `/assets/`
- `/tests/`
- `/public/`

Las dependencias apuntan hacia dentro: UI puede consumir dominio e
infraestructura; dominio no conoce DOM, IndexedDB ni Service Worker.

## 4. Local-first

V0 debe funcionar sin backend.

Persistencia prevista:

- `localStorage`: preferencias pequeñas e historial acotado de motores.
- `IndexedDB` mediante `idb`: historial, sesiones y datos con crecimiento.

La base `gimpro` comienza en versión 1. Toda modificación de stores o índices
incrementa versión y añade una migración testeada. Favoritos queda fuera de V0.

## 5. PWA

Componentes previstos:

- Web App Manifest;
- Service Worker;
- cache del shell de aplicación;
- cache de datos locales;
- estrategia explícita de actualización de versión.

Se usará `vite-plugin-pwa` en modo `injectManifest`. El shell y el catálogo se
precargan. Una actualización descargada se anuncia, pero no toma control en
mitad de una sesión; se aplica al finalizar o tras aceptación explícita.

## 6. IA futura

La IA no se invoca directamente desde el navegador con claves privadas.

El generador de Motores usa en el MVP un proveedor local en `src/core/motors/`
con contenido lingüístico en `data/motors/`. Su método asíncrono y contrato de
salida permiten añadir otro proveedor sin acoplarlo a la UI. La decisión se
registra en `docs/adr/ADR-004-local-motor-provider.md`.

Cuando llegue V2/V3 se añadirá una capa de backend o función serverless para:

- autenticación del proveedor;
- protección de claves;
- control de coste;
- límites de uso;
- versionado de prompts;
- logging técnico;
- abstracción de proveedor.

## 7. Routing

Hash routing ligero con rutas `#/home`, `#/explore`, `#/motors`,
`#/session/setup`, `#/exercise/:id` y `#/progress`. Permite recarga y hosting
estático sin reglas de reescritura del servidor.

## 8. Tooling y dependencias

- pnpm como gestor de paquetes;
- Vite para desarrollo y build;
- `idb` para IndexedDB;
- Vitest y fake-indexeddb para pruebas unitarias;
- Playwright para flujos de navegador y offline;
- axe-core para comprobaciones automáticas de accesibilidad.

Criterio V0: usar dependencias externas solo cuando su valor sea claro y eviten una implementación innecesariamente compleja.

No adoptar framework SPA por defecto.

## 9. Integración continua

Cada cambio debe validar contenido, lint, tests, build y los flujos críticos en
Chromium y WebKit. Ninguna clave o secreto se almacena en el repositorio.

## 10. Evolución

La arquitectura debe permitir migrar posteriormente a framework o backend sin reescribir el contenido pedagógico ni el modelo de ejercicios.
