# ADR-001 — PWA con JavaScript vanilla en V0

**Estado:** aceptado — 2026-11-15

## Contexto

Se busca prototipar rápidamente, mantener el sistema comprensible y reducir dependencias durante la validación inicial.

## Decisión

Utilizar HTML, CSS y JavaScript vanilla con ES Modules para la V0. Vite será
la herramienta ligera de desarrollo y build; no introduce un framework de UI.
El código mantendrá contratos JSDoc comprobables con `@ts-check`.

## Consecuencias positivas

- baja complejidad inicial;
- carga ligera;
- fácil depuración;
- menor dependencia de tooling;
- buena adecuación a una PWA pequeña.

## Riesgos

- crecimiento de complejidad si la UI escala mucho;
- necesidad de disciplina en separación de responsabilidades;
- componentes reutilizables deberán diseñarse explícitamente.

## Regla de revisión

Reevaluar framework cuando la complejidad real de UI o estado lo justifique, no por anticipación.
