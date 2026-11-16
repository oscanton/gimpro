# 02. Especificación funcional

## 1. Navegación principal

La navegación tendrá cuatro destinos persistentes tras incorporar Motores:

- **Inicio**: acceso rápido al entrenamiento.
- **Explorar**: habilidades, entrenadores y ejercicios.
- **Motores**: estímulos breves locales para entrenamiento y escena libre.
- **Progreso**: historial y distribución de práctica.

Inicio ofrece tres acciones: **Entréname**, **Entrenar habilidad** y
**Explorar ejercicios**. Motores tiene nombre propio para no convertirse en un
cajón genérico de herramientas. El reto periódico queda fuera de V0.

## 2. Flujo "Entréname"

1. Usuario pulsa Entréname.
2. Selecciona duración: 5 / 10 / 20 min.
3. Selecciona foco: Sorpréndeme / Cuerpo / Mente / Personaje / Escena.
4. Opcionalmente cambia la modalidad: solo / pareja / grupo; por defecto se conserva la última preferencia o `solo`.
5. El motor genera una secuencia compatible con el tiempo y modalidad.
6. Se presenta el primer ejercicio con objetivo, instrucciones y duración.
7. Usuario inicia.
8. Al finalizar: autoevaluación breve y omitible.
9. Opciones: continuar / repetir / subir dificultad / sustituir.
10. Final de sesión: resumen de competencias trabajadas.
11. Registro en historial local.

## 3. Flujo de ejercicio individual

Cada ejercicio debe contener como mínimo:

- nombre;
- competencia principal;
- objetivo;
- consigna;
- duración;
- modalidad;
- dificultad;
- fases si aplica;
- criterios observables;
- variantes;
- acción posterior recomendada.

## 4. Modos de salida tras ejercicio

- **Hecho**: continúa.
- **Repetir**: misma configuración.
- **Más difícil**: avanza al siguiente `progression_step` del mismo ejercicio.
- **Variar**: mantiene objetivo, cambia estímulos.
- **Otro**: sustituye el ejercicio.

## 5. Autoevaluación

La autoevaluación debe:

- durar menos de 20 segundos en ejercicios cortos;
- utilizar preguntas observables;
- evitar "bien/mal";
- no producir una nota global de talento;
- alimentar recomendaciones futuras.
- poder omitirse sin penalización; las respuestas omitidas se almacenan como `null`.

Ejemplo de mímica:

- ¿Mantuviste el tamaño del objeto?
- ¿Recordaste dónde lo dejaste?
- ¿El peso modificó tu cuerpo?
- ¿Respetaste las superficies del espacio?

## 6. Historial

Registrar por ejecución:

- fecha/hora;
- exercise_id;
- variante;
- dificultad;
- duración prevista;
- duración completada;
- competencias;
- resultado de autoevaluación;
- repetición sí/no;
- sesión a la que pertenece.

Una sesión se crea en estado `planned`, pasa a `active` al iniciar el primer
ejercicio y termina como `completed` o `abandoned`. Las ejecuciones parciales
se conservan y nunca se convierten automáticamente en fracaso.

## 7. Progreso

Mostrar:

- minutos entrenados por competencia;
- frecuencia de práctica;
- diversidad de ejercicios;
- nivel máximo practicado;
- competencias poco trabajadas;
- descubrimientos recientes.

No mostrar inicialmente:

- puntuación total;
- ranking;
- nivel global del improvisador;
- comparativa contra otros usuarios.
