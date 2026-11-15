# 13. Wireframes funcionales V0

Los wireframes expresan jerarquía, acciones y estados. No fijan todavía la
paleta final ni detalles decorativos.

## 1. Inicio

```text
┌────────────────────────────┐
│ GIMPRO beta        [sonido]│
│                            │
│ ¿Entrenamos?               │
│ [ 5 min ][10 min][20 min]  │
│ [       ENTRÉNAME       ]  │
│                            │
│ ¿Qué quieres entrenar?     │
│ [Cuerpo] [Mente] [Personaje]│
│ [Escena] [Sorpréndeme]     │
│                            │
│ Repetir reciente           │
│ Último ejercicio       [→] │
├────────────────────────────┤
│ Inicio   Explorar  Progreso│
└────────────────────────────┘
```

## 2. Preparación de sesión

```text
┌────────────────────────────┐
│ ← Preparar sesión          │
│ Duración  [5] [10] [20]    │
│ Foco      [Sorpréndeme ▾]  │
│ Modalidad [Solo ▾]         │
│                            │
│ 2 ejercicios · 10 minutos │
│ Asociación → Personaje     │
│                            │
│ [       EMPEZAR         ]  │
└────────────────────────────┘
```

## 3. Presentación del ejercicio

```text
┌────────────────────────────┐
│ 1 de 2              3 min  │
│ REBOTE INSTANTÁNEO         │
│ Responde sin editarte.     │
│                            │
│ Reto                       │
│ Di una asociación por cada │
│ palabra que aparezca.      │
│                            │
│ • Sin explicar             │
│ • Una respuesta            │
│                            │
│ [        INICIAR        ]  │
└────────────────────────────┘
```

## 4. Ejecución

```text
┌────────────────────────────┐
│                            │
│        02:14               │
│                            │
│        FARO                │
│                            │
│      [SIGUIENTE]           │
│                            │
│ [Pausa]          [Terminar]│
└────────────────────────────┘
```

Durante la ejecución no se muestra navegación general.

## 5. Autoevaluación

```text
┌────────────────────────────┐
│ Observa lo ocurrido        │
│                            │
│ ¿Respondiste sin justificar?│
│ [Sí] [A veces] [No]        │
│                            │
│ ¿Aparecieron asociaciones  │
│ variadas? [Sí][A veces][No]│
│                            │
│ [Saltar]        [CONTINUAR]│
└────────────────────────────┘
```

## 6. Decisión entre ejercicios

```text
┌────────────────────────────┐
│ Ejercicio completado       │
│                            │
│ [CONTINUAR SESIÓN]         │
│ [Repetir] [Variar]         │
│ [Más difícil: con ritmo]   │
│ [Sustituir]                │
└────────────────────────────┘
```

## 7. Resumen

```text
┌────────────────────────────┐
│ Sesión completada          │
│ 9 min · 2 ejercicios       │
│                            │
│ Asociación       4 min     │
│ Personaje        5 min     │
│                            │
│ Descubrimiento: centro     │
│ corporal                   │
│                            │
│ [VOLVER A INICIO]          │
└────────────────────────────┘
```

## 8. Explorar y progreso

```text
┌──────── Explorar ──────────┐  ┌──────── Progreso ──────────┐
│ Buscar ejercicio           │  │ Últimos 30 días             │
│ [Cuerpo][Mente][Escena]    │  │ 84 min entrenados           │
│ Modalidad [Solo ▾]         │  │                              │
│                            │  │ Cuerpo      ███████          │
│ Rebotador de conceptos [→] │  │ Mente       █████            │
│ Cadena de asociaciones [→] │  │ Personaje   ███              │
│ Mímica de objetos      [→] │  │ Escena      ██               │
│ ...                        │  │                              │
├────────────────────────────┤  │ Poco trabajado: Escucha     │
│ Inicio  Explorar  Progreso │  ├──────────────────────────────┤
└────────────────────────────┘  │ Inicio  Explorar   Progreso  │
                                └──────────────────────────────┘
```

## Estados obligatorios

Todas las vistas contemplan carga, vacío y error recuperable. Explorar debe
funcionar sin historial. Progreso vacío invita a iniciar una primera sesión y
no muestra gráficos sin datos.
