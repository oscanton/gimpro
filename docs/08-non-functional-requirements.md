# 08. Requisitos no funcionales

## Rendimiento

- Interfaz usable en móviles de gama media.
- Primera interacción en menos de 3 s en una conexión 4G simulada y menos de 2 s tras instalación, en el dispositivo de referencia del piloto.
- Transiciones sin dependencia de red.
- Datos locales ligeros.
- Presupuesto inicial de JavaScript: menos de 250 KB comprimidos, excluyendo imágenes y audio.

## Offline

Tras una primera carga completa, las funciones V0 deben estar disponibles sin
conexión. El test E2E offline debe cubrir Inicio → sesión → ejercicio →
autoevaluación → resumen y recuperación tras recarga.

## Privacidad

V0 no requiere cuenta ni datos personales.

El historial permanece local salvo futura función explícita de exportación/sincronización.

## Seguridad

- No almacenar secretos en cliente.
- No incluir claves de APIs externas en frontend.
- Sanitizar cualquier contenido editable cuando exista.

## Compatibilidad

Objetivo inicial:

- Chrome/Chromium móvil y escritorio;
- Safari/iOS moderno;
- Edge moderno.

## Mantenibilidad

- ES Modules.
- Lógica de dominio independiente del DOM cuando sea viable.
- Contenido separado de código.
- Funciones pequeñas y testeables.
- Convenciones de nombres consistentes.

## Accesibilidad

Objetivo mínimo: WCAG 2.2 AA en contraste, foco y semántica. Los objetivos
interactivos tendrán al menos 44 × 44 CSS px, el flujo completo será operable
por teclado y axe-core no podrá reportar infracciones críticas o serias en las
vistas principales.

## Internacionalización

No es requisito funcional V0, pero el contenido debe evitar quedar estructuralmente acoplado al español para facilitar traducción futura.
