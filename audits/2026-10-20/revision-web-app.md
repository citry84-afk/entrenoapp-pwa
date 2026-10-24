# Revisión de EntrenoApp — 20 de octubre de 2026

## Conclusión

La prioridad es hacer fiable el registro y facilitar que un visitante complete su primera sesión. Hay fallos reproducibles en la sesión en curso, en la adaptación Express/Suave y en las estadísticas. La captación también necesita alinear la oferta de Plus y conservar la atribución de campañas. Las mejoras visuales deben acompañar a estos cambios, no sustituirlos.

Esta revisión no modificó el producto ni publicó versiones. Se revisaron la web pública, el código local, las fichas públicas de tienda, el dossier de versiones, las pruebas existentes y el informe agregado de analítica. Las interacciones de registro se hicieron en un origen local aislado con `?qa=1`, sin enviar eventos de prueba.

## Situación comprobada

- El dossier `store-listing/release-2.2-119.md` documenta iOS y Android 2.2 (119) publicados. La consulta pública de Apple en España confirma iOS 2.2 desde el 28 de julio de 2026. Google Play muestra actualización del 24 de julio de 2026.
- La portada pública conserva mensajes de una oferta de Plus anterior. El `index.html` local ya contiene parte de la corrección y no coincide con lo publicado.
- Las funciones que originan los fallos de sesión, Express, estadísticas y preferencias se compararon con `https://entrenoapp.com/app.html`: son idénticas a las locales. Los fallos afectan a la web viva. No se probó el binario nativo instalado en un teléfono.
- Las pruebas existentes pasan: 15 regresiones de historial, 252 días de presupuestos de caminata/carrera y comprobaciones de reintentos analíticos. Los casos encontrados aquí no están cubiertos por esas pruebas.

## Datos reales disponibles

Informe protegido de producto, generado el 20 de octubre; periodo 21 de septiembre–20 de octubre de 2026.

| Evento | Recuento |
|---|---:|
| Vistas de páginas de captación | 362 |
| Clics hacia app o tiendas | 18 |
| Primera apertura de la app | 48 |
| Inicio mostrado | 47 |
| Asistente iniciado | 14 |
| Asistente terminado | 9 |
| Primer entrenamiento iniciado | 7 |
| Primer ejercicio completado | 2 |
| Primer entrenamiento guardado | 1 |
| Segundo entrenamiento en siete días | 0 |

Son recuentos agregados de eventos, no usuarios únicos ni cohortes. El informe solo contiene plataforma `web`; no permite estimar instalaciones, uso ni retención de iOS/Android. La muestra es pequeña y puede incluir visitas de revisión anteriores. Las relaciones entre filas orientan una investigación, pero no acreditan tasas de conversión individuales. La propia atribución tiene un defecto descrito más abajo.

La hipótesis de producto que merece probarse es reducir el esfuerzo antes del primer entrenamiento guardado. No hay evidencia suficiente para concluir que añadir modalidades o aumentar publicidad solucionará el problema.

## Hallazgos prioritarios

### 1. P1 — El entrenamiento en curso se pierde al volver desde Hoy

Evidencia local: `app.html:1958`, `app.html:3073`, `app.html:4826`.

`WD` y `W` mantienen los datos de la sesión solo en memoria. El almacenamiento persistente no los incluye y la entrada a un entrenamiento llama de nuevo a `initWD()`.

Reproducción en navegador: crear plan de musculación, introducir 73 kg y completar una serie, pulsar Hoy y Empezar entrenamiento. El registro queda de nuevo pendiente, el peso vuelve a cero y el reloj reinicia. También se perderá el borrador al recargar/cerrar la app.

![Estado después de volver desde Hoy: reloj reiniciado y 0/20 series](/Users/papi/Documents/EntrenoApp/entrenoapp-pwa/audits/2026-10-20/sesion-reiniciada.png)

Mejora: guardar automáticamente un borrador separado del plan y ofrecer Reanudar. Debe recuperar series, pesos, notas, alternativas y comienzo de sesión. Cambiar de día, reiniciar o descartar una sesión con trabajo realizado necesita una acción explícita que explique lo que ocurrirá.

Aceptación: una serie registrada sobrevive a navegación, recarga y cierre; se puede reanudar, guardar una vez o descartar voluntariamente.

### 2. P1 — Express/Suave muestran una prescripción distinta a la que registran

Evidencia: `app.html:4826`, `app.html:5146`, `app.html:5163`.

`initWD()` crea las filas normales antes de asignar el modo. `todayDay()` reduce ejercicios y series, pero las filas y el cálculo de finalización siguen leyendo el registro inicial.

Reproducción con funciones reales: plan de cuatro ejercicios de cuatro series. Express anuncia tres ejercicios de dos series; el registro mantiene cuatro filas por ejercicio y el denominador cuenta dieciséis series. Completar las doce filas visibles deja la sesión en 75%.

Mejora: representar la sesión adaptada en un único modelo que alimente prescripción, filas, duración y progreso. Al cambiar el modo con series ya hechas, conservarlas y comunicar el resultado.

Aceptación: en cada modo, las series anunciadas, visibles, guardadas y contadas son las mismas; completar todas termina en 100%.

### 3. P2 — El progreso puede incluir actividad no realizada y mezclar ejercicios distintos

Evidencia: `app.html:2299`, `app.html:6214`, `app.html:6519`.

- Un bloque de caminar de veinte minutos con `done:false` devuelve cero series hechas, 0% completado y veinte minutos activos. Se están sumando minutos previstos como realizados.
- Las gráficas agrupan por ID sin distinguir material/variante y toman el máximo de todas las series. Press con barra de 80 kg hecho más 150 kg pendiente, seguido de mancuernas de 24 kg con el mismo ID, genera una gráfica de 150 a 24.

Mejora: separar objetivos de resultados, contar solo actividad realizada y reutilizar en gráficas la identidad de ejercicio/material y el filtro de series completadas que ya se emplean en el historial y los récords.

Aceptación: una serie pendiente no establece marcas; barra y mancuernas no se comparan como una sola variante; un bloque omitido no añade minutos activos.

### 4. P1 comercial — Plus tiene mensajes incompatibles entre superficies

La [portada pública](https://entrenoapp.com/) ofrece fundador de 1 €/mes y nutrición con IA. La [página Plus](https://entrenoapp.com/plus) anuncia 4,99 €/mes o 29,99 €/año, adaptación y progreso, pero conserva una lista para avisar cuando se publique la versión 2.2. Esa versión ya está publicada según el dossier y Apple.

Evidencia local: `index.html:1216` contiene una corrección parcial; `plus.html:99` y `app.html:4382` conservan mensajes anteriores.

Mejora: una oferta consistente con las funciones y suscripciones disponibles. Actualizar portada, Plus, modal interno y textos de tienda; sustituir la espera por un acceso claro a la app o a las tiendas. Confirmar compra de prueba y restauración en dispositivos, pendientes en el dossier, antes de ampliar la promoción.

### 5. P2 — La medición atribuye campañas a la posición de un botón

Evidencia: `js/growth-tracking.js:39`, `netlify/functions/analytics-report.ts:114`.

El enlace hacia `/app` sustituye la campaña original por valores como `hero_demo`, `organic_web` y `seo_to_app`. Un visitante adquirido mediante otra campaña pierde esa procedencia al entrar en la app. Plus y Coach no incluyen el mismo seguimiento propio.

Mejora: conservar procedencia/campaña y registrar la posición del botón en un campo independiente. Completar cobertura de los recorridos relevantes y definir claramente qué mide cada informe. Para medir cohortes habrá que diseñar una solución acorde con la privacidad; los recuentos actuales no equivalen a un embudo por usuario.

### 6. P2 — Cambiar preferencias no aplica los cambios al plan

Evidencia: `app.html:6941`, `app.html:6963`.

Cambiar material, objetivo, tiempo o días guarda el perfil, pero deja la rutina anterior hasta pulsar Regenerar rutina. El cambio de nivel sí regenera inmediatamente, por lo que el comportamiento también es inconsistente.

Mejora: una acción clara de Aplicar cambios que explique qué se adaptará y preserve el historial y las sesiones en curso.

### 7. P2 — Detalles de confianza y localización de la tienda

La [ficha española de Google Play](https://play.google.com/store/apps/details?id=com.lipastudios.entrenoapp&hl=es&gl=ES) tiene la descripción nueva y muestra 50+ descargas; esta cifra es un intervalo público, no el total exacto. Sus enlaces de soporte y privacidad siguen apuntando a github.io y telegra.ph. La versión en inglés conserva una descripción genérica. Conviene unificar enlaces en entrenoapp.com y revisar ES/EN.

Comprobación positiva: las treinta URLs del sitemap público respondieron 200, con canonical propio y sin noindex. Robots permite rastreo. No se encontró un bloqueo técnico general de indexación; Search Console y las métricas privadas de las tiendas hacen falta para valorar adquisición y visibilidad.

## Orden propuesto de trabajo

1. **Fiabilidad de la sesión:** borrador recuperable, Reanudar y coherencia Express/Suave; añadir regresiones que reproduzcan los casos de esta revisión.
2. **Credibilidad del progreso:** series completadas, minutos reales e identidad de material/variante; aplicar preferencias de forma clara.
3. **Primera sesión sencilla:** probar una entrada de dos a cinco minutos que permita entender el registro y guardar un resultado antes de pedir toda la configuración. Mantener accesible la entrada para quien ya tiene rutina.
4. **Captación coherente:** alinear Plus y fichas, desplegar correcciones locales revisadas y arreglar atribución. Medir por separado captación, primera sesión y repetición.
5. **Nueva versión nativa:** incorporar las mejoras verificadas y la instrumentación pendiente, realizar compra/restauración sandbox y preparar una release revisable para iOS/Android.

Objetivo inicial: que una sesión nunca se pierda y que más personas lleguen a guardar su primer entrenamiento. Evaluar la prueba de activación con datos nuevos; no usar los recuentos web actuales como retención de las apps nativas.
