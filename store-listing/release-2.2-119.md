# EntrenoApp 2.2 (119)

## Objetivo

Introducir EntrenoApp Plus sin perder el foco simple de la versión 2.1. La experiencia gratuita sigue centrada en el entrenamiento del día; la suscripción aparece solo desde Ajustes y añade adaptación y progreso avanzado.

## Novedades para las tiendas

### Español

EntrenoApp Plus llega como una capa opcional para adaptar el entrenamiento a tu tiempo y energía, revisar el progreso semanal y entender mejor tu constancia, volumen y marcas. La rutina, el entrenamiento del día y el registro básico siguen disponibles gratis.

### English

EntrenoApp Plus is an optional layer that adapts workouts to your time and energy, reviews weekly progress and helps you understand consistency, volume and personal bests. The routine, today’s workout and basic logging remain free.

## Suscripciones

- Mensual: `entrenoapp_plus_monthly` — 4,99 EUR/mes en España.
- Anual: `entrenoapp_plus_yearly` — 29,99 EUR/año en España.
- Prueba: 7 días gratis solo en el anual.
- Entitlement RevenueCat: `plus`.
- Offering RevenueCat: `default`.

## Estado de preparación

- [x] UI Plus simplificada a entrenamiento y progreso.
- [x] Precios, renovación, restauración, privacidad y términos visibles en el paywall.
- [x] Comprobación estricta del entitlement `plus` en cliente y backend.
- [x] iOS In-App Purchase activado.
- [x] Android configurado con `singleTop` para el retorno del pago.
- [x] Grupo y productos creados en App Store Connect.
- [x] Precios y disponibilidad mundial configurados en Apple.
- [x] Prueba anual de 7 días configurada en los 175 territorios de Apple.
- [x] Localizaciones es-ES y en-US y captura de revisión cargadas en Apple.
- [x] Proyecto independiente EntrenoApp creado en RevenueCat.
- [x] Archivo iOS 2.2 (119) firmado para distribución y subido correctamente a App Store Connect.
- [x] AAB Android 2.2 (119) firmado y validado por Google Play.
- [x] Resolver el estado `MISSING_METADATA` de Apple recalculando y guardando los precios de ambas suscripciones para los 175 países o regiones.
- [x] Conectar la app iOS real y copiar la clave pública `appl_...`.
- [x] Crear la cuenta de comercio de Google Payments.
- [x] Crear y activar los dos productos y planes base en Google Play (4,99 EUR/mes y 29,99 EUR/año en España, con 7 días de prueba en el anual).
- [x] Crear la app de Google Play en RevenueCat y copiar la clave pública `goog_...`.
- [x] Crear la cuenta de servicio de Google, conceder los permisos mínimos y cargar su JSON privado en RevenueCat.
- [x] Guardar `REVENUECAT_SECRET_API_KEY` en Netlify.
- [x] Publicar el AAB 2.2 (119) en la pista cerrada Alpha.
- [x] Validar las credenciales de Google en RevenueCat y conectar las notificaciones en tiempo real.
- [x] Configurar Pub/Sub y confirmar desde Play Console que la notificación de prueba se envía correctamente.
- [x] Importar los productos reales de Apple y Google en RevenueCat, asociarlos al entitlement `plus` y añadirlos a los paquetes mensual y anual del offering `default`.
- [x] Publicar Android 2.2 (119) en producción; el canal figura activo.
- [x] Enviar conjuntamente a revisión de Apple iOS 2.2 (119), el grupo EntrenoApp Plus y las suscripciones mensual y anual.
- [x] Corregir el rechazo automático 3.1.2 de Apple añadiendo el EULA estándar a las descripciones es-ES y en-US, restaurar el lanzamiento manual y volver a enviar los cuatro elementos el 26 de julio de 2026.
- [x] Publicar iOS 2.2 (119), el grupo EntrenoApp Plus y sus suscripciones mensual y anual.
- [x] Confirmar que los cuatro productos reales (mensual/anual de Apple y Google) están publicados o aprobados y asociados al offering `default` y al entitlement `plus`.
- [x] Sustituir en Netlify la credencial incompatible por una clave secreta RevenueCat API V1 y verificar el endpoint `/v1/subscribers`.
- [x] Verificar en producción que el backend de Plus consulta RevenueCat correctamente y deniega el acceso cuando no existe una suscripción activa.
- [x] Desplegar analítica propia y agregada del embudo de activación, retención y compra, sin guardar email, IP, identificadores persistentes ni contenido de entrenamientos.
- [x] Proteger el informe de producto con `ANALYTICS_ADMIN_TOKEN` y fijar el inicio de recogida en el 28 de julio de 2026.
- [ ] Ejecutar compras sandbox y restauración en ambas plataformas.
- [x] Generar los binarios definitivos 2.2 (119).

Android 2.2 (119) e iOS 2.2 (119) están públicos. Las suscripciones mensual y anual están configuradas en ambas tiendas y conectadas a RevenueCat. La verificación servidor-servidor funciona en producción. Falta únicamente completar una compra sandbox y su restauración en dispositivos físicos para cerrar la validación de extremo a extremo sin efectuar un cobro real.

La analítica de producto está activa en la web y preparada en los proyectos nativos. Para habilitarla dentro de las apps instaladas será necesario incluirla en una futura build posterior a la 119; no se abre una nueva revisión solo por este cambio.

## Captura para revisión de suscripciones Apple

`store-listing/app-store-review-plus-2.2-640x920.jpg`

## Restricción de publicación

La versión 2.2 (119) ya fue autorizada y publicada en ambas tiendas. Cualquier build nativa posterior debe volver a prepararse y verificarse antes de abrir una nueva revisión o lanzamiento.
