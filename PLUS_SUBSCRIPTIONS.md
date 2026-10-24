# EntrenoApp Plus subscriptions

## Propuesta 2.2

EntrenoApp mantiene gratis el onboarding, la rutina, el entrenamiento del día, el registro básico y el historial esencial. Plus añade una capa opcional centrada solo en entrenamiento y progreso:

- Adaptar el entrenamiento a tiempo, energía y material disponible.
- Revisión semanal con un siguiente ajuste claro.
- Historial avanzado de constancia, volumen y marcas personales.
- Consejos del coach basados en los entrenamientos guardados.

No se muestra un paywall durante el onboarding. La compra se ofrece desde Ajustes > EntrenoApp Plus y se puede restaurar desde la misma pantalla.

## Productos definitivos

| Tipo | Product ID | Nombre ES | Nombre EN | Precio España |
| --- | --- | --- | --- | --- |
| Mensual | `entrenoapp_plus_monthly` | EntrenoApp Plus mensual | EntrenoApp Plus Monthly | 4,99 EUR/mes |
| Anual | `entrenoapp_plus_yearly` | EntrenoApp Plus anual | EntrenoApp Plus Yearly | 29,99 EUR/año |

El anual incluye una prueba gratuita de 7 días para nuevos suscriptores. No se ofrece plan semanal, vitalicio ni suscripción de fundador en la versión 2.2.

## RevenueCat

- Proyecto: `EntrenoApp` — nunca reutilizar claves de otro proyecto.
- Entitlement identifier: `plus`.
- Offering identifier: `default`.
- Paquete Monthly -> `entrenoapp_plus_monthly`.
- Paquete Annual -> `entrenoapp_plus_yearly`.

Las claves públicas se guardan en `assets/config/revenuecat.js`:

```js
window.ENTRENOAPP_REVENUECAT_IOS_KEY = "appl_xxx";
window.ENTRENOAPP_REVENUECAT_ANDROID_KEY = "goog_xxx";
```

Si las claves están vacías, la app debe fallar de forma segura y no cargar ningún catálogo. El entitlement debe comprobarse por el identificador exacto `plus`; nunca se acepta el primer entitlement activo como alternativa.

## App Store Connect

- Grupo: `EntrenoApp Plus`.
- Mensual: `entrenoapp_plus_monthly`, duración `ONE_MONTH`.
- Anual: `entrenoapp_plus_yearly`, duración `ONE_YEAR`.
- Ambos productos pertenecen al mismo nivel porque ofrecen las mismas funciones con distinta duración.
- Disponibilidad: todos los territorios.
- Prueba: 7 días gratis solo en el anual.

Textos es-ES:

```txt
EntrenoApp Plus mensual
Adapta tus entrenos y mejora tu progreso.

EntrenoApp Plus anual
Ajustes de entreno y revisión semanal.
```

Textos en-US:

```txt
EntrenoApp Plus Monthly
Adapt workouts and understand your progress.

EntrenoApp Plus Yearly
Workout adjustments and weekly progress review.
```

La primera suscripción debe enviarse junto con una nueva versión de la app. La captura de revisión está en `store-listing/app-store-review-plus-2.2-640x920.jpg`.

## Google Play Console

Antes de crear suscripciones, la cuenta de desarrollador debe tener configurada una cuenta de comercio de Google Payments.

Crear los mismos IDs:

- `entrenoapp_plus_monthly`, plan base mensual, renovación automática, 4,99 EUR.
- `entrenoapp_plus_yearly`, plan base anual, renovación automática, 29,99 EUR.
- Oferta de prueba gratuita de 7 días en el plan anual.

Beneficios en español:

```txt
Adapta el entrenamiento a tu tiempo y energía
Revisión semanal con un siguiente ajuste claro
Historial avanzado de constancia, volumen y marcas
Consejos del coach basados en tus entrenamientos
```

Benefits in English:

```txt
Adapt workouts to your time and energy
Weekly review with one clear next adjustment
Advanced consistency, volume and personal-best history
Coach guidance based on your workouts
```

## Netlify

Variables necesarias:

- `PLUS_TOKEN_SECRET` — ya debe existir y tener al menos 24 caracteres.
- `GEMINI_API_KEY` — solo servidor.
- `REVENUECAT_SECRET_API_KEY` — clave secreta API V1 del proyecto EntrenoApp, solo servidor. El verificador actual consulta `/v1/subscribers`; una clave V2 no es compatible con ese endpoint.

`/api/plus/purchase` consulta RevenueCat, exige el entitlement exacto `plus` y emite un token Plus firmado para el dispositivo. Ninguna clave secreta se incluye en HTML o JavaScript público.

## App nativa

- Plugin: `@revenuecat/purchases-capacitor@9.2.2`.
- iOS: capability In-App Purchase activada.
- Android: `launchMode="singleTop"` para volver correctamente desde flujos de pago externos.
- Versión objetivo: 2.2, build 119.

Comandos de preparación:

```bash
npm run verify
npm run build
npx cap sync ios
npx cap sync android
```

## Pruebas obligatorias

- Usuario gratis conserva rutina, entrenamiento, registro e historial esencial.
- Paywall muestra mensual, anual, prueba, renovación, restauración, privacidad y términos.
- Compra sandbox mensual activa `plus`.
- Compra sandbox anual aplica 7 días gratis y activa `plus`.
- Cancelación no retira el acceso antes de la fecha de expiración.
- Restaurar compra recupera Plus después de reinstalar.
- Un entitlement con otro nombre no desbloquea Plus.
- Sin clave pública o secreta, la app falla de forma segura y explica el problema.

Estado operativo verificado el 28 de julio de 2026:

- Offering `default` con mensual y anual de Apple y Google.
- Entitlement exacto `plus` asociado a los cuatro productos reales.
- Productos Google `Published` y productos Apple `Approved` en RevenueCat.
- Clave servidor API V1 dedicada guardada en Netlify.
- El backend distingue correctamente una cuenta sin entitlement activo (`403`) de un error de configuración.

## Mensaje de valor

```txt
Entrena. Adapta. Progresa.

Gratis mantiene tu plan y tu registro. Plus adapta la sesión a la vida real y convierte tu progreso en siguientes pasos claros.
```
