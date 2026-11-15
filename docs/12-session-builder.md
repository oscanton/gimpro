# 12. Constructor de sesiones V0

## 1. Objetivo

Crear una sesión válida para una duración, foco y modalidad sin IA, de forma
determinista y testeable. El resultado debe explicar por qué se seleccionó cada
ejercicio y poder regenerarse usando la misma semilla.

## 2. Entradas

- duración: 5, 10 o 20 minutos;
- foco: surprise, body, mind, character o scene;
- modalidad: solo, pair o group;
- historial reciente opcional;
- semilla opcional.

## 3. Presupuesto temporal

Se reserva aproximadamente un 20 % para preparación, transiciones y
autoevaluación. El motor no selecciona una combinación cuya duración prevista
supere el presupuesto total.

| Sesión | Ejercicios objetivo | Tiempo de práctica |
|---|---:|---:|
| 5 min | 1 | 3-4 min |
| 10 min | 2 | 7-8 min |
| 20 min | 3-4 | 15-17 min |

## 4. Filtros obligatorios

1. Estado `published`.
2. Modalidad compatible y número de jugadores válido.
3. Duración compatible con el presupuesto restante.
4. Al menos tres pasos de progresión definidos.
5. Si existe foco explícito, al menos un ejercicio debe tener esa área o
   competencia como principal.

## 5. Puntuación de candidatos

Cada candidato parte de 100 puntos:

- +30 si su área coincide con el foco;
- +15 si su competencia principal está poco trabajada;
- +10 si alterna activación corporal y cognitiva respecto al anterior;
- +10 si no aparece en las últimas cinco ejecuciones;
- -25 si repite la competencia principal del ejercicio anterior;
- -40 si aparece en las últimas dos ejecuciones;
- -100 si no cabe en el presupuesto.

Los empates se resuelven con un generador pseudoaleatorio sembrado. El historial
vacío no penaliza ni favorece ejercicios.

## 6. Composición por duración

### 5 minutos

Un ejercicio compatible. Si hay foco, debe coincidir con él.

### 10 minutos

Dos ejercicios con competencias principales distintas. Cuando sea posible,
uno activa cuerpo/percepción y otro desarrolla el foco elegido.

### 20 minutos

Tres o cuatro ejercicios. Debe incluir activación, foco técnico e integración
escénica. No puede contener más de dos ejercicios consecutivos de la misma
área.

## 7. Progresión inicial

El constructor selecciona el primer paso salvo que el historial muestre al
menos dos ejecuciones completadas del ejercicio o el usuario haya elegido antes
“Más difícil”. Nunca aumenta dificultad basándose únicamente en una
autoevaluación positiva.

## 8. Sustituir, variar y repetir

- **Repetir:** conserva ejercicio, paso y estímulos.
- **Variar:** conserva ejercicio y paso, y usa una nueva semilla de estímulos.
- **Más difícil:** avanza exactamente un paso; si no existe, la acción no se ofrece.
- **Otro:** excluye el ejercicio actual y vuelve a puntuar candidatos que caben.

## 9. Resultado

El constructor devuelve `id`, semilla, parámetros, duración prevista, lista
ordenada de ejercicios, versión de contenido y razones de selección. Una sesión
ya creada no cambia aunque se actualice posteriormente el catálogo.

## 10. Errores

Si no hay combinación válida, el motor relaja únicamente la diversidad y el
ajuste de duración, nunca modalidad, estado publicado ni seguridad. Si sigue
sin existir resultado, devuelve un error de dominio legible y no una sesión
vacía.
