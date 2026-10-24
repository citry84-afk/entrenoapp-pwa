# Inspiración competitiva y prioridades para EntrenoApp

Fecha: 22 de octubre de 2026. Investigación de documentación pública oficial, no prueba práctica de las apps ni ranking de popularidad. Las funciones y límites pueden variar por plataforma o plan.

## Qué ya ofrece el mercado

| App | Capacidades documentadas | Matices relevantes |
| --- | --- | --- |
| Hevy | Registro de carga, repeticiones, duración y RPE; valores anteriores; descanso automático; vídeos e instrucciones; offline y Apple Watch. Trainer genera programas según experiencia, objetivo, material y preferencias. | Trainer, rutinas ilimitadas e historial completo figuran en Pro. No se ha verificado aquí adaptación por duración. [Ficha oficial](https://apps.apple.com/us/app/hevy-workout-tracker-gym-log/id1458862350). |
| Strong | Rutinas, registro, notas, instrucciones, vídeos animados, descanso automático, superseries y calculadoras de calentamiento/discos. Watch puede registrar sin iPhone. | Gratis permite guardar entrenamientos ilimitados, pero limita las rutinas personalizadas a tres. No se ha acreditado aquí generación automática por material/tiempo ni alcance offline del móvil. [Ficha oficial](https://apps.apple.com/us/app/strong-workout-tracker-gym-log/id464254577). |
| Fitbod | Planificación según objetivo, historial y material; duración elegida; recomendaciones de carga/series/repeticiones; vídeos e indicaciones escritas; sustituciones. | Offline puede generar y guardar, pero vídeos no cacheados y parte del historial requieren conexión. Watch es acompañante: iniciar, cambiar ejercicios y finalizar requieren iPhone. [FAQ](https://fitbod.me/faqs/), [offline](https://help.fitbod.me/hc/en-us/articles/360006572594-Can-I-use-Fitbod-without-an-internet-connection), [integraciones](https://help.fitbod.me/hc/en-us/sections/35305345636375-Integrations). |
| Lyfta | Cargas, series, repeticiones, descanso automático, notas, superseries, vídeos e instrucciones. Watch permite seguir ejercicios y completar series. | El registro, biblioteca y rutinas propias son gratuitos; análisis ampliados y programas están en Premium. Su soporte establece el iPhone como referencia ante discrepancias con Watch. No se ha verificado offline o adaptación automática por tiempo. [Registro](https://www.lyfta.app/usage/workout-tracker), [Watch](https://support.lyfta.app/en/article/lyfta-on-apple-watch), [planes](https://support.lyfta.app/en/article/lyfta-free-and-premium). |

Los dibujos, cronómetros, pesos y consejos son expectativas de la categoría, no una diferenciación suficiente. Adaptar una rutina al material o al tiempo tampoco es una novedad universal. Que una función no aparezca en estas fuentes no demuestra que no exista.

## Público confirmado y experiencia propuesta

Decisión del usuario: atender a los tres públicos planteados. Es una decisión de alcance, no evidencia de demanda ni de encaje de producto ya validado.

| Necesidad o contexto | Experiencia que debemos ofrecer |
| --- | --- |
| Personas que empiezan en el gimnasio | Guía del siguiente ejercicio y serie, demostración específica, indicaciones breves y descanso claro. |
| Personas que ya entrenan | Registro directo, referencias anteriores compatibles, control de la rutina y progreso sin pasos explicativos obligatorios. |
| Personas que entrenan en casa con poco tiempo o material | Sesión ajustada al tiempo y material disponibles, alternativas coherentes y continuidad aunque cambie el contexto. |

No son categorías excluyentes: alguien con experiencia puede entrenar en casa o necesitar guía para un ejercicio nuevo. Propuesta de diseño: un solo perfil, plan e historial; nivel de ayuda ajustable y contexto de cada sesión. Reutilizar las preguntas existentes de experiencia, tiempo y material, sin añadir una elección obligatoria de «tipo de usuario».

- **Guía o registro rápido:** dos grados de detalle de la misma sesión. Cambiar la ayuda visible no cambia por sí solo los ejercicios, cargas ni series guardadas.
- **Tiempo y material de hoy:** contexto combinable con ambos grados de ayuda, conservando lo realizado y mostrando los cambios de plan antes de aplicarlos.
- **Misma continuidad:** no separar el progreso en historiales de casa, gimnasio, principiantes o avanzados. Sí conservar la identidad real de cada variante y su material para comparar cargas correctamente.

Promesa de producto: **«Abre la app y entiende tu siguiente acción: qué ejercicio, qué serie, con qué referencia y cuánto descansar».** El objetivo es reducir decisiones y miradas al móvil, manteniendo control sobre la rutina.

## Orden de trabajo propuesto

1. **Fiabilidad del ciclo serie → descanso → siguiente serie.** Cargas realizadas separadas de referencias; guardado recuperable; descanso calculado con tiempo real transcurrido, no suponiendo que el navegador siga ejecutándose al bloquear el iPhone. No prometer avisos en segundo plano sin comprobar capacidades y permisos.
2. **Sustituir sin borrar.** «Máquina ocupada» debe ofrecer alternativas compatibles, explicar el cambio y conservar lo ya realizado. Nunca convertir automáticamente las cargas de ejercicios diferentes en equivalentes.
3. **Guía ajustable y diez a doce demostraciones útiles.** Mantener el registro rápido accesible y ofrecer explicación contextual sin imponerla a todos. Priorizar movimientos frecuentes y sus variantes relevantes en gimnasio, mancuernas y peso corporal. Vídeos o animaciones propios o con licencia adecuada, indicaciones breves y revisión por un profesional competente antes de publicarlos. No copiar imágenes o animaciones de Lyfta. La auditoría interna identifica guías SVG genéricas y `DEMO_ASSETS` vacío: no existe aún una biblioteca de demostraciones específicas.
4. **Después, voz optativa.** Avisos cortos de siguiente acción o fin de descanso, desactivables y compatibles con música. Debe poder usarse con guía o registro rápido, no convertirse en un tercer recorrido separado. No hay voz implementada actualmente. No confundir avisos con conteo automático de repeticiones o evaluación de técnica.

No ampliar ahora red social, reloj, IA conversacional ni cámara. Tampoco presentar el funcionamiento offline como verificado: requiere pruebas específicas de carga inicial, recuperación, guardado y disponibilidad de medios.

## Cinco pruebas propuestas con usuarios

Plan pendiente de ejecutar. Propuesta: una ronda de cinco personas por necesidad/contexto principal, admitiendo perfiles que se solapen. Los umbrales de cuatro de cinco se evaluarían por ronda; un promedio global no debe ocultar un mal resultado en uno de los tres públicos. Son criterios iniciales de aceptación, no resultados obtenidos ni una muestra estadísticamente representativa.

| Tarea | Criterio de éxito propuesto |
| --- | --- |
| Empezar una sesión de veinte minutos | Al menos cuatro de cinco encuentran el primer ejercicio y explican qué deben hacer sin ayuda. |
| Registrar tres series y descansar, bloqueando y reabriendo el móvil | Cero pérdida de valores; el descanso refleja el tiempo transcurrido; al menos cuatro de cinco identifican la siguiente serie sin indicaciones externas. |
| Sustituir una máquina ocupada | Cero sobrescritura de series realizadas; al menos cuatro de cinco eligen una alternativa y comprenden qué cambia. |
| Consultar una demostración | Al menos cuatro de cinco localizan y explican dos indicaciones técnicas; revisión profesional sin errores críticos en los materiales. |
| Guardar una sesión parcial y volver después | Cero pérdida de series/notas; al menos cuatro de cinco encuentran el historial y distinguen referencia anterior de resultado guardado. |

Añadir en cada ronda un cambio de contexto: una persona habituada al gimnasio prueba una sesión corta en casa, o alguien que usa registro rápido consulta la guía de un ejercicio desconocido. Debe conservar el mismo historial y no perder series ni notas al cambiar la ayuda visible o adaptar la sesión.

Registrar tiempo, errores, ayudas necesarias y comentarios; decidir la siguiente iteración según lo observado. Este documento actualiza el alcance y el plan, no implementa funciones. La corrección del temporizador y las protecciones de registro ya se publicaron en web; la guía ajustable, nuevas demostraciones, voz y mejoras de sustitución siguen pendientes de diseño, validación y desarrollo. Las tiendas continúan a la espera de la prueba en iPhone.
