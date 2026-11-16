# ADR-002 — Local-first y sin cuenta en V0

**Estado:** aceptado — 2026-11-15

## Contexto

El valor principal de V0 es entrenar. Login, backend y sincronización añaden fricción y complejidad sin validar la hipótesis principal.

## Decisión

V0 funcionará sin cuenta y almacenará preferencias y datos pequeños acotados
(como el historial reciente de motores) en `localStorage`, y sesiones y eventos
en IndexedDB mediante `idb`. El esquema tendrá versión y migraciones explícitas.

## Consecuencias

- onboarding mínimo;
- uso offline;
- privacidad simple;
- desarrollo más rápido;
- el usuario puede perder historial al borrar datos o cambiar de dispositivo.

## Mitigación futura

V1+ puede incorporar exportación/importación y posteriormente sincronización opcional.
