# Quinta tanda: recorrido de uso diario

Fecha: 22 de octubre de 2026.

## Alcance

Implementación real en `app.html` de la propuesta de uso diario aceptada por el usuario. La publicación de esta tanda será una vista previa de Netlify; no sustituye producción ni envía versiones a las stores.

## Cambios

- Hoy: nombre del entrenamiento, duración estimada y primeros tres ejercicios reales; inicio o continuación como acción principal. Un borrador conserva su progreso y muestra la variante elegida. Si ya hay una sesión guardada hoy, el mensaje reconoce lo registrado sin afirmar que fue completa ni exigir otra sesión.
- Paso a paso: ejercicio y serie pendientes, campos grandes, referencia histórica compatible y un botón para marcar. Bandas y peso corporal conservan sus campos propios. Puede elegirse otro ejercicio pendiente y revisarse/corregirse todo en Vista directa.
- Las vistas comparten las mismas filas y borrador; cambiar de presentación no modifica prescripciones, cargas, notas, alternativas ni series realizadas. La preferencia es local al dispositivo.
- Descanso integrado en ambas vistas para sesiones de fuerza compatibles; pausa, extensión y omisión. La última serie cancela cualquier descanso anterior y permite guardar inmediatamente. El contador no anuncia cada segundo a lectores de pantalla; las transiciones sí se anuncian y recuperan el foco.
- Las sesiones de actividad cronometrada, GPS, WOD, superseries y movilidad Vital mantienen sus controles especializados. No se fuerzan prescripciones como `30s` o `6/lado` dentro del nuevo formulario numérico.
- Cierre: guardar primero; sensación, peso y nota son opcionales, plegados y guardan el borrador al editarse. Resumen corto con confirmación parcial/completa y una acción principal para volver a Hoy. Las métricas, comparaciones y planificación siguen disponibles en el detalle opcional.
- Corrección de seguridad detectada durante la revisión: al ampliar Express a Normal, las filas nuevas toman carga y banda de la alternativa real, nunca del ejercicio base incompatible. Las filas existentes no se cambian.
- Los controles del temporizador cerrado ya no permanecen accesibles fuera de pantalla.

## Verificación funcional

Pruebas con datos ficticios en orígenes locales separados, sin modificar los perfiles de la web pública:

- Navegador a 390 × 844: inicio, serie inválida rechazada, carga decimal, completar serie, descanso, pausa y cambio de vista.
- Recarga: recuperación de una y de cuatro series registradas.
- Guardado parcial: una de seis series; historial muestra `45×10`, pendientes como no completadas y nota literal con caracteres HTML escapados.
- Guardado completo: seis de seis series; última serie en Vista directa cancela descanso y Paso a paso ofrece guardar sin espera adicional.
- Inglés: nombres traducidos, campos y referencia real `42.5 kg × 10` de un registro ficticio previo.
- Las suites de Home, registro diario, cierre, historial, borradores y temporizador cubren también bandas, peso corporal, alternativas, fallbacks, idiomas, escape y errores de almacenamiento.

## Evidencias visuales

- `uso-diario-hoy-iphone.jpg`
- `uso-diario-descanso-iphone.jpg`
- `uso-diario-resumen-parcial-iphone.jpg`
- `uso-diario-resumen-completo-iphone.jpg`
- `uso-diario-historial-iphone.jpg`
- `uso-diario-serie-en-iphone.jpg`
- `uso-diario-serie-es-iphone.jpg`
- `uso-diario-hoy-guardado-iphone.jpg`
- `uso-diario-preview-bandas-iphone.jpg`
- `uso-diario-preview-guardado-iphone.jpg`

## Límites

- La prueba de navegador no sustituye una prueba física en iPhone o Android.
- No se ha añadido una biblioteca de vídeos/animaciones licenciados ni guía de voz.
- No se certifica funcionamiento offline ni aviso de descanso con el teléfono bloqueado.
- El descanso en curso no se restaura después de cerrar/recargar; las series y el borrador sí se conservan.
- Una vista previa tiene almacenamiento distinto al dominio público y a las apps nativas. No sincroniza automáticamente su historial.
- Las sesiones parciales se conservan como sesiones guardadas y mantienen la rotación actual del plan; no se convierten en entrenamientos completos.

## Publicación y comprobaciones finales

- Vista previa: https://6ada71891daf28300218c209--entrenoapp.netlify.app/app.html?qa=1
- Deploy `6ada71891daf28300218c209`: estado `ready`, contexto `deploy-preview`, `published_at: null`. Creado a las 20:26:49 UTC; listo a las 20:27:09 UTC.
- HTTP 200 y `X-Robots-Tag: noindex` tanto en la app como en la portada de la vista previa.
- SHA-256 de `app.html`, `www/app.html`, paquete y respuesta remota idénticos: `9f89b74b0d7a0e66c3cafc0d6e2b08a890f16db741e1a145805841c8ee6ebb81`.
- El paquete contiene 188 archivos públicos; sin symlinks, archivos de entorno, credenciales de firma ni directorios nativos.
- `/api/analytics/report` mantiene HTTP 401 sin autorización y `Cache-Control: no-store`.
- La respuesta de producción conserva su SHA-256 anterior: `f5b43d6f8e9503f1c34c616a1fe0d66d37366373cd84f566040427d9cd2d4d4f`. No se ha publicado esta tanda en `entrenoapp.com`.
- `npm run test:app`, `npm run test:workouts`, `npm run verify`, sintaxis de los dos scripts inline y `git diff --check`: correctos. La cobertura focalizada incluye Home 27, recorrido diario 49, resumen 42, temporizador 18 y borradores 21 pruebas.
- `npm run build`: correcto tras reintento. La primera copia tuvo un `ETIMEDOUT` de iCloud en un icono; se verificó que el icono del origen y el paquete tenían el mismo hash antes de reintentar. No se sustituyeron fuentes por copias antiguas.
- Prueba adicional en el deploy: onboarding con perfil ficticio de casa/bandas, tres pasos de bienvenida, resistencia Ligera conservada y guardado automático confirmado. Sin errores ni avisos de consola capturados. No se enviaron eventos analíticos de prueba al entorno de producción.
- No se han generado ni enviado binarios a App Store Connect o Google Play.
