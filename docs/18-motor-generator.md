# 18. Generador de motores

Estado: decisión aprobada e implementada después de Gimpro v0.1.0.

## 1. Definición y alcance

Un **motor** es un estímulo breve que inicia o alimenta una improvisación:
título, frase, lugar, personaje, situación, relación, palabra u objeto.

No es una sinopsis, una restricción de ejercicio ni una escena ya resuelta. Debe
ofrecer una situación o un concepto jugable y dejar espacio para que el usuario
lo complete. Los motores musicales quedan fuera del MVP.

Tipos automáticos del MVP:

- `title`;
- `phrase`;
- `place`;
- `character`;
- `situation`;
- `relationship`;
- `word`;
- `object`.

`style` existe como tipo avanzado y solo se genera por selección explícita. No
entra en «Sorpréndeme» ni en la ayuda contextual de los ejercicios. Las épocas
tampoco se aplican automáticamente.

## 2. Perfil creativo y calibración

La generación por defecto distribuye aproximadamente un 30 % de resultados
realistas (`0–1`) y un 70 % de resultados raros (`2–4`). La interfaz permite
fijar cualquier rareza entre 0 y 4.

Principios de curación:

1. concreto antes que abstracto;
2. situación jugable antes que torsión;
3. una desviación fuerte antes que varias rarezas acumuladas;
4. una ancla reconocible más una anomalía clara;
5. evitar aleatoriedad semánticamente vacía y juegos de palabras como mecanismo
   principal;
6. mantener abiertas las consecuencias en lugar de incluir el gag completo.

Las palabras aisladas son concretas y visuales. Las frases priorizan confesión,
reproche o afirmación que presupone un hecho extraño; las preguntas pesan menos.
Los lugares son concretos, poco habituales, alterados o imposibles. Los
personajes pueden ser personas, animales, objetos, órganos, enfermedades o
entidades personificadas. Las relaciones parten de un vínculo previo y, cuando
corresponde, de una diferencia de estatus; los desconocidos tienen menor peso.

Patrones con mayor peso:

- cotidiano + imposible;
- servicio o burocracia + elemento fantástico;
- personificación + necesidad humana;
- evento enorme + actividad banal;
- relación previa + anomalía;
- entidad imposible sometida a normas sociales, laborales o familiares.

La calibración penaliza sinopsis cerradas, cliché fantástico genérico,
relaciones sin matiz, defectos banales demasiado evidentes y saturación de una
misma familia semántica. En especial evita depender siempre de fantasmas,
demonios, Dios o el apocalipsis. El catálogo amplía variedad mediante anatomía,
objetos con voluntad, instituciones absurdas, inversiones de roles, reglas
físicas alteradas, escalas desproporcionadas, cultura local y espacios
imposibles.

## 3. Arquitectura

La UI consume un proveedor mediante un único método asíncrono:

```js
const motors = await provider.generate({
  types: ["title", "situation"],
  locale: "es",
  rarity: { min: 2, max: 4 },
  count: 1,
  history
});
```

El proveedor local de `src/core/motors/localProvider.js` combina:

1. catálogo curado de motores completos y piezas semánticas;
2. plantillas procedurales ponderadas específicas del locale;
3. exclusión de textos recientes;
4. penalización por receta repetida y saturación de familias semánticas;
5. relajación progresiva del historial cuando no quedan alternativas.

El catálogo español vive en `data/motors/es.json` y se valida con
`data/schema/motor-catalog.schema.json`. Las plantillas y todo el contenido
lingüístico visible permanecen fuera de la lógica. Otro locale puede aportar su
propio catálogo y sus propias realizaciones gramaticales sin traducir las
plantillas españolas de forma mecánica.

La selección crea varios candidatos por receta, elimina duplicados y elige con
pesos. Las etiquetas `family:*` permiten reducir temporalmente familias que ya
dominan el historial reciente. Si una categoría pequeña se agota, se prueban
ventanas de historial cada vez menores hasta permitir de nuevo el resultado; la
generación nunca queda bloqueada por anti-repetición.

## 4. Contrato de salida

Todo proveedor devuelve una lista de uno o dos objetos con la misma forma:

```json
{
  "id": "motor:1.0.0:550e8400-e29b-41d4-a716-446655440000",
  "type": "title",
  "text": "Merienda antes del apocalipsis",
  "locale": "es",
  "rarity": 3,
  "source": "curated",
  "recipeId": "curated.title.merienda-apocalipsis",
  "tags": ["pattern:catastrophe-banal", "family:apocalypse"],
  "parts": ["merienda", "apocalipsis"],
  "contentVersion": "1.0.0"
}
```

- `id`: identidad de la generación, no del texto canónico;
- `type`: tipo válido solicitado;
- `text`: realización final no vacía;
- `locale`: locale del catálogo;
- `rarity`: entero de 0 a 4;
- `source`: `curated` o `procedural`;
- `recipeId`: motor curado o plantilla que produjo el resultado;
- `tags`: metadatos de selección, incluyendo familias semánticas;
- `parts`: IDs de piezas que permiten auditar la combinación;
- `contentVersion`: versión del contenido lingüístico.

El contrato no expone detalles internos del proveedor. Un futuro proveedor LLM
deberá implementar el mismo método y devolver esta estructura.

## 5. Herramienta Motores

La ruta `#/motors` está integrada en la navegación persistente. Mantiene una
configuración compacta:

- tipo, incluyendo `style` como opción avanzada explícita;
- rareza 0–4;
- uno o dos resultados;
- `Generar` con la configuración elegida;
- `Sorpréndeme` con tipos automáticos y perfil 30/70;
- `Otro` para repetir el modo de generación actual.

La herramienta es principalmente de entrenamiento: presenta el estímulo sin
añadir guardado, packs, filtros temáticos ni una escena completa en el MVP.

## 6. Integración contextual

`data/exercises.json` puede declarar una política opcional:

```json
{
  "motor_policy": {
    "accepted_types": ["character", "relationship", "place", "situation"],
    "rarity": [1, 3],
    "refreshable": true
  }
}
```

Solo los ejercicios compatibles tienen `motor_policy`. La pantalla del
ejercicio muestra un motor opcional y el botón `Otro motor`; el usuario no ve
controles de tipo ni rareza. El perfil pedagógico decide automáticamente ambos.

Perfiles iniciales:

- asociación y rebote: `word`;
- espacio y mímica: `place` / `object`;
- personaje: `character` / `relationship`;
- PROL: `character` / `relationship` / `place` / `situation`;
- detonadores e historia: `title` / `phrase` / `situation`.

Ejercicios de justificación y energía no reciben motor en esta primera
integración porque su foco no lo necesita. La ayuda se conserva al iniciar el
temporizador y puede renovarse sin abandonar el ejercicio.

## 7. Persistencia local

`src/storage/motorHistory.js` guarda en `localStorage` como máximo los 60
resultados más recientes. El historial solo sirve para diversidad local y no se
sincroniza ni sale del dispositivo. Se conservan texto, receta y etiquetas para
aplicar anti-repetición y saturación semántica.

## 8. Decisión sobre IA

El MVP no utiliza LLM ni necesita red. La generación local es rápida,
reproducible en pruebas, auditable, traducible y funciona completamente offline.

Una integración LLM podrá añadirse más adelante como otro proveedor, tras una
capa de backend que proteja credenciales y controle costes. No reemplazará el
catálogo local ni obligará a cambiar el contrato consumido por la UI.

## 9. Validación

Las pruebas unitarias cubren tipos, rareza, uno y dos resultados, exclusión de
`style` en automático, anti-repetición, fallback al agotar catálogo, contrato y
ausencia de salidas vacías. El E2E abre la herramienta, genera otro resultado,
cambia tipo y rareza y comprueba la ayuda contextual en un ejercicio compatible.

La validación de contenido comprueba además el esquema del catálogo, referencias
de colecciones y tokens de las plantillas.
