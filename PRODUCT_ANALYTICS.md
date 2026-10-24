# EntrenoApp product analytics

## Objetivo

Medir el recorrido esencial sin copiar al servidor el contenido de los entrenamientos ni crear perfiles individuales:

`página de captación -> CTA -> primera apertura -> onboarding mostrado -> onboarding iniciado -> onboarding terminado -> primer entreno iniciado -> primer ejercicio completado -> primer entreno guardado -> segundo entrenamiento -> paywall -> compra`

Los eventos se guardan como registros agregables en Netlify Blobs. No se guarda email, dirección IP, notas, pesos, repeticiones, objetivos de salud ni un identificador persistente del dispositivo.

## Eventos principales

- `marketing_page_view`
- `marketing_cta_click`
- `app_first_open`
- `app_session_started`
- `onboarding_viewed`
- `onboarding_started`
- `onboarding_complete`
- `first_workout_started`
- `first_exercise_completed`
- `first_workout_saved`
- `activation_first_workout_24h`
- `activation_second_workout_7d`
- `retention_returned_after_1d`
- `retention_returned_after_7d`
- `plus_paywall_view`
- `plus_plan_selected`
- `plus_purchase_started`
- `plus_purchase_success`
- `plus_purchase_cancelled`
- `plus_purchase_failed`
- `plus_restore_success`

La cola del cliente conserva hasta 50 eventos si no hay conexión y reintenta al recuperar Internet. Cada evento tiene una identidad efímera dentro de la cola para que un envío en curso no borre eventos añadidos al mismo tiempo. Solo los nombres y dimensiones incluidos en la lista permitida del servidor son aceptados.

Las páginas de captación que cargan `js/growth-tracking.js` miden vistas y clics de CTA. Los enlaces hacia la app web reciben parámetros UTM limitados a la fuente interna, el medio `organic_web` y la campaña `seo_to_app`.

## Informe

El endpoint `/api/analytics/report` exige `ANALYTICS_ADMIN_TOKEN` y devuelve únicamente totales agregados para un máximo de 90 días.

Desde un equipo autenticado con Netlify:

```bash
npm run analytics:report
npm run analytics:report -- --days=7
npm run analytics:report -- --days=30 --json
```

## Lectura semanal

- Pocas instalaciones respecto a visitas de tienda: probar ficha y primeras capturas.
- Pocos primeros entrenamientos: simplificar onboarding y llegada al entrenamiento del día.
- Pocos segundos entrenamientos: mejorar utilidad del plan y recordatorios.
- Buen uso pero pocos paywalls: mostrar Plus después de aportar valor.
- Muchos paywalls y pocas compras: revisar mensaje, prueba anual y precios.

RevenueCat sigue siendo la fuente fiable para suscriptores activos, renovaciones, cancelaciones y reembolsos. Este embudo sirve para entender la experiencia anterior a la compra.

La línea base de producción comienza el `2026-07-28T17:12:41.399Z`. Los eventos anteriores pertenecen a las verificaciones del despliegue y se excluyen del informe.
