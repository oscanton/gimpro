# Changelog

Todos los cambios relevantes de Gimpro se documentan en este archivo.

## [Sin publicar] — 2026-11-16

### Añadido

- Proveedor local de Motores basado en contenido curado y plantillas ponderadas.
- Tipos título, frase, lugar, personaje, situación, relación, palabra y objeto;
  estilo disponible únicamente como opción avanzada explícita.
- Rareza 0–4, generación de uno o dos motores y modo `Sorpréndeme` con perfil
  aproximado 30 % realista / 70 % raro.
- Anti-repetición con fallback y penalización por saturación semántica.
- Ruta `#/motors` integrada en navegación y ayuda contextual en ejercicios
  compatibles.
- Catálogo español y esquema ejecutable, contrato estable para proveedores
  futuros y ADR de decisión local sin LLM en el MVP.
- Pruebas unitarias del proveedor y flujo E2E de la herramienta e integración.

### Cambiado

- El catálogo de ejercicios avanza a `0.2.0` para declarar políticas opcionales
  de motores.
- `validate:content` valida también el catálogo lingüístico y sus plantillas.

## [0.1.0] — MVP — 2026-11-15

### Incluido

- PWA mobile-first instalable y local-first.
- Catálogo declarativo de veinte ejercicios, dos por entrenador.
- Sesiones deterministas de 5, 10 y 20 minutos.
- Filtros por foco y modalidad.
- Temporizador con pausa y finalización manual.
- Autoevaluación breve y omitible.
- Repetición y progresión de dificultad.
- Historial y distribución local de práctica.
- Funcionamiento offline tras la primera carga.
- Validación JSON Schema, pruebas unitarias, E2E y accesibilidad.
- Despliegue automatizado a GitHub Pages.

### Limitaciones conocidas

- No existen cuentas ni sincronización entre dispositivos.
- Favoritos y reto periódico quedan para V0.5.
- La prueba offline automatizada se ejecuta en Chromium; WebKit conserva las
  pruebas de flujo y accesibilidad.
- El contenido necesita validación pedagógica con el grupo piloto.

[0.1.0]: https://github.com/oscanton/gimpro/releases/tag/v0.1.0
