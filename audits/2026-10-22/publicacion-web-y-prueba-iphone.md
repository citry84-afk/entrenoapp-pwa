# Publicación web y prueba en iPhone

Solicitud del usuario: publicar en la web para probar en iPhone y decidir después si se lleva a las tiendas. Autorización de publicación web recibida el 22 de octubre de 2026. No incluye envío a App Store o Google Play.

## Alcance

La versión revisada de registro seguro, resumen ES/EN e historial/progreso se prepara para producción. Antes de publicarla se corrige un fallo adicional descubierto durante la auditoría: el descanso dependía del número de ejecuciones de `setInterval`, por lo que podía atrasarse tras una suspensión del navegador.

El descanso usa ahora una fecha límite real y se recalcula al volver a primer plano. Pausar conserva milisegundos restantes; añadir tiempo no reanuda una pausa. Cancelar o sustituir un descanso invalida callbacks anteriores. No se reproducen de golpe los pitidos perdidos y el fin se procesa una sola vez.

Esta corrección no añade voz, nuevas notificaciones ni persistencia del descanso al cerrar/recargar. Tampoco convierte la web en una integración con Apple Watch ni acredita funcionamiento offline.

## Verificación previa

- Suite completa `npm test`, incluidas 17 nuevas pruebas deterministas de descanso: correcta.
- `npm run verify`, `npm run build` y `git diff --check`: correctos. Fuente, recursos de Capacitor y paquete público comparten el hash de `app.html` `f5b43d6f8e9503f1c34c616a1fe0d66d37366373cd84f566040427d9cd2d4d4f`.
- Comprobaciones de suspensión, vuelta de segundo plano, pausa, +30, cancelación, reemplazo y avisos duplicados con reloj simulado.
- Interfaz local a 390 × 844 con perfil ficticio: completar una serie inicia descanso de 2 min; pausa +30 muestra 2:30 sin reanudar; continuar vuelve a la cuenta atrás.
- Omitir el descanso y guardar la sesión parcial deja una sesión de 1/6 series y 320 kg; después de recargar permanece guardada. Sin errores de consola. Evidencia visual: `descanso-pausa-qa.jpg`.
- No se han importado datos reales del usuario ni enviado eventos ficticios a la analítica.
- Preparación de recursos nativos no equivale a compilación, firma o distribución de binarios.

## Riesgo de publicación automática

Netlify tiene despliegue continuo desde `main`. La publicación previa era `6a8add572eadf51caa568797`, del 23 de agosto de 2026, según los metadatos consultados. Un despliegue posterior de Git puede sustituir la publicación manual. Se avisó al usuario; no se ha bloqueado ni cambiado la configuración automática. Si quiere mantener una versión fija, debe acordarse el bloqueo de publicación.

## Prueba propuesta al usuario en Safari

Antes de probar, exportar una copia si ya hay sesiones importantes. No borrar los datos de Safari para actualizar: los registros se guardan localmente y el HTML se sirve sin caché persistente.

1. Abrir `https://entrenoapp.com/app.html?v=20261022` y comprobar que conserva el plan y el historial que ya existían en ese navegador.
2. Empezar una sesión, introducir carga y repeticiones y completar una sola serie.
3. Iniciar descanso de 90 s, bloquear el iPhone unos 30 s y volver: comprobar que el tiempo restante ha descontado lo transcurrido. No es una garantía de alarma sonora con la pantalla bloqueada.
4. Pausar, añadir 30 s y continuar. Probar también omitir un descanso.
5. Cargar referencias: confirmar que no cambian la serie hecha ni la nota actual.
6. Guardar parcialmente y comprobar el historial después de recargar. El descanso en curso no se recupera tras cerrar/recargar; la sesión sí tiene su borrador.

La web en Safari y el contenedor de Capacitor no comparten automáticamente almacenamiento. Que esta prueba salga bien no sustituye una prueba nativa de instalación, permisos, compras/restauraciones y suspensión antes de enviar a las tiendas.

## Despliegue

Publicación completada en [entrenoapp.com](https://entrenoapp.com/app.html?v=20261022).

- Despliegue `6ada46749d23bbb2120ee6df`, estado `ready`, contexto `production`, publicado el 22 de octubre de 2026 a las 17:23:16 UTC. Confirmado después mediante los metadatos del sitio, no solo por la salida del comando.
- Publicado desde el paquete público revisado de 188 archivos, sin enlaces simbólicos. No se publicó la carpeta completa de trabajo.
- `app.html` e `index.html`: HTTP 200 y coincidencia byte a byte con las fuentes locales. `Cache-Control: no-cache,no-store,must-revalidate`. La portada no conserva la cabecera `noindex` de la vista previa; la app mantiene su propia metaetiqueta `noindex`.
- `/api/analytics/report`: HTTP 401 sin credenciales, `Cache-Control: no-store`.
- La interfaz pública carga un perfil ya existente sin reiniciarlo. Comprobación responsive a 390 × 844 y sin errores de consola. Captura `web-publicada-iphone.jpg`; es una vista móvil del navegador de QA, no una captura de un iPhone físico.
- La inspección del dominio principal se hizo con `qa=1` para no emitir telemetría ficticia. El enlace de prueba del usuario no lleva esa opción.
- No se han enviado builds ni metadatos a las tiendas, ni cambiado permisos o configuraciones de despliegue automático.

Investigación y siguiente etapa: [inspiración competitiva y prioridades](inspiracion-competencia-y-prioridades.md). Las demostraciones nuevas, voz y mejoras de sustitución son propuestas pendientes, no capacidades añadidas en esta publicación.
