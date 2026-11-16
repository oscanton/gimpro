# ADR-004. Proveedor local para Motores

- Estado: aceptado
- Fecha: 2026-11-16

## Contexto

Gimpro necesita estímulos breves, variados y jugables tanto como herramienta
independiente como dentro de ejercicios. La aplicación es local-first y debe
seguir siendo útil offline. La UI no debe quedar acoplada a una tecnología de
generación concreta.

## Decisión

El MVP usa un proveedor local asíncrono que combina catálogo curado, piezas
semánticas y plantillas procedurales ponderadas por locale. El proveedor aplica
anti-repetición, rareza 0–4 y penalización de familias semánticas saturadas.

La salida tiene un contrato estable común a cualquier proveedor. `style` solo se
permite por petición explícita y los tipos automáticos son los ocho tipos MVP.

No se usa LLM en el MVP.

## Consecuencias

- La herramienta funciona sin conexión, cuentas, claves ni coste variable.
- Contenido y gramática pueden revisarse y probarse como datos versionados.
- Cada locale necesita plantillas propias.
- La variedad depende de la amplitud y la curación continuada del catálogo.
- Un proveedor LLM futuro podrá implementar el mismo contrato, pero necesitará
  backend, protección de credenciales y controles de coste antes de activarse.
