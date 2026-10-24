# Tercera tanda — Tiendas y próxima sesión

21 de octubre de 2026.

Vista previa de la app: https://6ad8fcf3c1a53c73acd4cee6--entrenoapp.netlify.app/app.html

Despliegue manual de borrador, no producción. Solo se subieron los 188 archivos públicos de staging y las funciones; el pack de tiendas y el fixture permanecen locales.

## Resultado implementado

- Al guardar una bienvenida, una sesión normal o una sesión vital se propone el siguiente día concreto de la rutina.
- Fecha opcional: mañana, dentro de dos días, personalizada o sin fecha. No solicita permisos ni activa recordatorios.
- Hoy muestra la intención guardada inmediatamente y tras recargar. Si hay una sesión en curso, Reanudar sigue teniendo prioridad y la tarjeta de planificación se oculta.
- Guardar otra sesión consume la planificación anterior solo si el guardado tiene éxito. Un fallo conserva el plan, el historial y las series en memoria.
- Las referencias nuevas identifican el índice y la prescripción del día: permiten nombres repetidos, rotación de uno o dos días y reordenación inequívoca; una prescripción modificada invalida una referencia antigua.
- La bienvenida deja preparado el primer día normal de la rutina, no salta al segundo.
- Fechas de calendario locales, sin conversión de un día completo a UTC. Las fechas pasadas se muestran sin mensajes de culpa.
- La copia v2 incluye la planificación y el importador la valida. Las copias anteriores siguen siendo compatibles.
- Las rutinas propias muestran en Hoy los primeros cuatro ejercicios reales en vez del texto genérico.
- Se corrigió el ocultado de avisos largos para que no quede un fragmento verde en la parte superior de la pantalla.

## Material de tiendas

En `store-listing/2026-10-21-tiempo-registro-progreso/`:

- Cuatro fichas ES/EN para App Store y Google Play, con promesa de tiempo/material → registro → progreso.
- Novedades propuestas sin asignar versión ni build y con estado `DRAFT_NOT_SUBMITTED`.
- `preview.html` con tres capturas reales de la web usando datos ficticios en un perfil aislado.
- Guion para volver a capturar en las plataformas y tamaños finales. Las imágenes web de revisión no sustituyen capturas de las builds nativas.
- Fixture marcado explícitamente como ficticio; no debe importarse en un perfil real porque sustituye sus datos.

## Verificación

- 62 pruebas de próxima sesión: fechas locales, cambio de hora de Madrid, fechas inválidas, rotación, nombres duplicados, reordenación, bienvenida, guardar/rollback, borrador, actualización de Hoy, duración no confiable, ES/EN y privacidad de eventos.
- Dos regresiones adicionales de copias: planificación exportada/importada y rechazo de referencias inválidas antes de reemplazar datos.
- Comprobación automatizada de 20 campos de tienda dentro de límites, URLs y estado no publicado de las novedades.
- Se mantienen las suites anteriores de entrenamiento, ajustes, permisos, copias y analítica.

`npm test`, `npm run verify` y `npm run build` pasan; las tres pruebas finales añadidas para rutinas propias pasan también en la suite específica de 62 casos. `www/app.html` y el archivo de staging coinciden con la fuente. `git diff --check` no detecta errores en los archivos trabajados. Las modificaciones anteriores del usuario se han conservado sin crear commits.

La vista previa devuelve 200 en app y portada con bytes idénticos a las fuentes y cabecera `X-Robots-Tag: noindex`. El informe de analítica devuelve 401 sin autorización; no se enviaron eventos ficticios al backend. Las URLs públicas de soporte y privacidad propuestas devolvieron 200. La app desplegada abre correctamente en navegador.

Recorrido de navegador a tamaño móvil, únicamente en `127.0.0.1:4201` con `?qa=1` y datos ficticios:

1. Alta nueva, bienvenida parcial 1/3 y guardado.
2. Siguiente propuesta en día A normal; elegir mañana y fecha personalizada.
3. Recarga conserva la fecha. Empezar una sesión, marcar 12 repeticiones, volver y recargar conserva Reanudar y la serie.
4. Guardar la segunda sesión consume la fecha antigua y propone el día B.
5. Elegir nueva fecha y cerrar el resumen sin navegar muestra la tarjeta inmediatamente en Hoy.
6. Importar el fixture en ese mismo perfil ficticio y capturar plan, una serie registrada y gráficas reales del historial de ejemplo.
7. Cambiar a inglés y comprobar la tarjeta nueva con fecha y controles traducidos. Los nombres escritos por el usuario no se traducen automáticamente; el resto de la localización nativa sigue pendiente de revisión.

No se observaron avisos ni errores de consola en el recorrido revisado. El evento `next_workout_planned` admite solo dimensiones agregadas existentes: opción elegida y contexto; no envía la fecha, nombre de rutina o ID de sesión. La supresión de analítica de producto en localhost y previews se mantiene.

Evidencias locales: `proxima-sesion-bienvenida.jpg`, `proxima-sesion-hoy.jpg`, `proxima-sesion-ingles.jpg` y `pack-tiendas-vista-previa.jpg`. Los tres archivos de `store-listing/.../screenshots/` cargaron correctamente en la página de revisión.

## Pendiente de lanzamiento

No se ha publicado la web pública ni enviado versiones o metadatos a las tiendas. Faltan las pruebas físicas de iPhone/Android (archivos, arranque en frío, permisos y compra/restauración), completar la localización visible y obtener la autorización final de publicación.

Para validar el resultado tras lanzarlo: separar visitas de ficha/instalaciones de los eventos de activación. La analítica previa es agregada y solo web; no acredita usuarios únicos ni retención de las apps nativas.
