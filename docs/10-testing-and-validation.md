# 10. Pruebas y validación

## 1. Tres niveles de prueba

### Técnica
¿La aplicación funciona correctamente?

### UX
¿El usuario entiende y ejecuta el entrenamiento sin ayuda?

### Pedagógica
¿El ejercicio entrena realmente el foco declarado?

## 2. Pruebas técnicas V0

- selección aleatoria sin errores;
- temporizadores;
- transiciones de fase;
- persistencia IndexedDB;
- recuperación tras recarga;
- modo offline;
- actualización de Service Worker;
- sesiones incompletas;
- datos corruptos o vacíos;
- navegación atrás.
- tipos, rareza, contrato y cardinalidad de motores;
- anti-repetición y fallback de categorías pequeñas;
- exclusión de estilos en generación automática;
- herramienta Motores y ayuda contextual en navegador.

## 3. Pruebas de contenido

`validate:content` valida tanto ejercicios como el catálogo español de motores,
incluyendo referencias de colecciones y tokens de plantillas.

Cada ejercicio se revisará con una ficha:

- objetivo claro;
- instrucciones ejecutables;
- foco único o prioritario;
- duración realista;
- criterios observables;
- variante útil;
- progresión coherente;
- seguridad física;
- aplicabilidad individual/grupo;
- diversión / disposición al juego.

## 4. Prueba con usuarios

Dos rondas:

1. cinco usuarios con niveles variados para corregir comprensión y navegación;
2. doce improvisadores durante catorce días, incluyendo principiantes,
   intermedios, avanzados y al menos dos docentes.

Preguntas clave:

- ¿Entendiste qué hacer?
- ¿Empezaste rápido?
- ¿Te pareció entrenamiento o simple entretenimiento?
- ¿Repetirías voluntariamente?
- ¿La autoevaluación ayudó?
- ¿La progresión parecía natural?
- ¿Qué función abrirías de nuevo mañana?

## 5. Señales de alerta

- usuarios leen más de lo que practican;
- abandonan antes de iniciar el temporizador;
- ejercicios demasiado abstractos;
- demasiadas decisiones previas;
- autoevaluaciones largas;
- "más difícil" solo añade tiempo;
- el historial se percibe como juicio;
- los usuarios solo usan generadores y no sesiones.

## 6. Umbrales de salida hacia V1

- mediana hasta iniciar ejercicio ≤ 30 s y percentil 90 ≤ 60 s;
- al menos 70 % de sesiones iniciadas se completan;
- al menos 80 % ejecuta la consigna principal sin ayuda;
- al menos 70 % puntúa utilidad con 4/5 o más;
- al menos 30 % repite voluntariamente un ejercicio durante el piloto;
- cero pérdidas críticas de historial y cero bloqueos sin recuperación;
- 100 % de los flujos offline definidos pasan en CI.

El retorno a 7 y 30 días se registra, pero no bloquea V1 hasta disponer de una
muestra con tamaño suficiente.

## 7. Feedback de testers

La aplicación permite exportar, por acción explícita, un JSON anonimizado con
versión, sesiones, eventos y respuestas, además de un resumen legible. Nada se
envía automáticamente. Las notas cualitativas se recogen en un cuestionario
separado y voluntario.
