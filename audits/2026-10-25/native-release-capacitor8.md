# EntrenoApp 2.3: Capacitor 8, web e iOS/Android

Preparación: 25 de octubre de 2026. Estado actualizado el 26 de octubre de 2026. Rama: `mejoras/navegacion-simple`.

## Alcance y autorización

El usuario autorizó publicar la web, migrar a Capacitor 8, probar y enviar ambas apps a revisión con publicación tras la aprobación. También aprobó iOS 15 y Android 7/API 24 como mínimos, conservar la protección automática de Google Play y usar ADB/XCTest únicamente en dispositivos virtuales nuevos de QA. No se instalaron apps en sus dispositivos personales ni se modificaron sus datos de entrenamiento.

## Estado de publicación

| Destino | Versión | Estado observado |
| --- | --- | --- |
| Web | HTML `0184ca65…` | Publicada en https://entrenoapp.com/app.html; HTTP 200 y hash idéntico al artefacto validado. |
| App Store | 2.3 (123) | Enviada: **Pendiente de revisión**. Publicación automática tras aprobación y valoración actual conservada. |
| Google Play | 2.3 (121) | **Activa en producción, lanzamiento al 100 %**, confirmado el 26 de octubre en los 178 países o regiones existentes. |

La versión pública anterior de iOS es 2.2 (121) y la de Android es 2.2 (119). Las builds iOS 122 y Android 120 no son las candidatas de este envío.

Prueba de Apple: `/Users/papi/Documents/EntrenoApp/native-release-audits/2026-10-25/appstore-123-submitted.jpg`.
Envío Apple: `16250e3e-9675-4f76-9d76-21e0df6ef6f7`.
Prueba de Android: `/Users/papi/Documents/EntrenoApp/native-release-audits/2026-10-25/google-play-121-production-2026-10-26.jpg`.

## Código incluido

- Capacitor core/CLI/iOS/Android 8.5.3, AdMob 8.2.1, Keep Awake 8.0.1, Local Notifications 8.3.1 y Purchases Capacitor 13.7.6, fijados en el lockfile.
- Android compile/target API 36, mínimo API 24, AGP 8.13.2, Gradle 8.14.3 con checksum y JDK 21. Insets nativos de SystemBars y fondo oscuro.
- iOS mínimo 15, build 123, soporte UIScene y reenvío de enlaces en SceneDelegate. El SDK actual de RevenueCat incorpora el arreglo de Xcode, por lo que ya no se ejecuta el backport antiguo desde Podfile.
- Reloj WOD con fechas límite, pausa/reanudación, controles inmediatos y cancelación de avisos obsoletos. Señales EMOM y descanso independientes.
- Pantalla activa solo se muestra activada si el sistema confirma la adquisición. Se libera al guardar, descartar o importar; gestiona adquisiciones pendientes y regreso al primer plano.
- UMP `canRequestAds` es obligatorio antes de inicializar anuncios; los errores deniegan la inicialización y las opciones de privacidad se muestran cuando UMP las requiere.
- Fuerza Vital normaliza prescripciones de segundos sin sobrescribir entradas ni resultados completados del usuario.
- Identificadores, firma y almacenamiento local conservados.

## Integridad de artefactos

Los **513 archivos web** (48.494.341 bytes) de la preparación limpia coinciden por SHA256 en el AAB, el archive de iOS y la IPA exportada. Solo existen dos archivos adicionales esperados del puente Cordova en cada paquete. Sin archivos ausentes, diferencias de hash, entradas ZIP duplicadas ni hallazgos del escáner de rutas privadas/patrones de secretos en esos assets. Los 16 archivos críticos de código y configuración coinciden entre repositorio y preparación.

HTML SHA256: `0184ca65eeee6b7d46c2246b36a3a255e3de86adb2e9a3fd3fc83a0a84603126`.

| Artefacto | Ruta | SHA256 |
| --- | --- | --- |
| AAB firmado | `/Users/papi/Library/Developer/EntrenoAppRelease-20261025-cap8/android/app/build/outputs/bundle/release/app-release.aab` | `adcae2565ada269aae6e18a558ae27faba761841cf47208fe7a92c814f2b3305` |
| APK de QA | `/Users/papi/Library/Developer/EntrenoAppRelease-20261025-cap8/android/app/build/outputs/apk/debug/app-debug.apk` | `5419e299af45b965cbfe7b06cef7abb860ca84e3b8eda9d665191d4d5e7aa7ca` |
| IPA exportada | `/Users/papi/Library/Developer/Xcode/Exports/EntrenoApp-2.3-123-local/App.ipa` | `ed06973e561e384d23e22ced369c8b17612cf33a6a91c4bf17e662826c8ad7fa` |

Archive: `/Users/papi/Library/Developer/Xcode/Archives/2026-10-25/EntrenoApp-2.3-123.xcarchive`.
Firma iOS verificada con `codesign --verify --deep --strict`; firma del AAB verificada con jarsigner y APK con apksigner. iOS SDK 27.1 y versión/mínimo confirmados en el plist del archive. AAB sin archivos `.so`; no se realizó una prueba de runtime de 16 KB. El explorador de bundles de Google Play confirma **Compatible con 16 kB** para el artefacto activo (ID `4860244515975140631`), además de mínimo 24, target 36 y protección automática. Captura `google-play-121-bundle-16kb-2026-10-26.jpg`.

## Verificación reproducible

- `npm test` completo y `npm run verify`: correctos en la preparación limpia fuera de iCloud.
- Revisión independiente repitió WOD 24/24, Keep Awake 14/14, UMP 9/9 y borradores 23/23: 70 pruebas aprobadas, además de comprobaciones estáticas de Capacitor 8.
- `npm run build`, sincronización nativa, Gradle bundleRelease/assembleDebug, archive y exportación de iOS: correctos.
- `git diff --check`: correcto.
- La ejecución de toda la suite en el directorio original tropieza con copias numéricas de JSON generadas por iCloud. Se conservaron esos archivos y se verificó la selección canónica en una preparación limpia; no se incorporan al release.

### iOS: UI nativa

Dispositivo nuevo desechable iPhone 17 Pro/iOS 26.5. Posteriormente apagado y eliminado.

- `test10Gym`: **1 prueba aprobada**. Onboarding de musculación, sesión, 62,5 kg/10 repeticiones, serie completada, descanso y peso conservado en la serie siguiente.
- EMOM: observados minuto 1 → 2, movimiento correspondiente, pausa/reanudación y pantalla activa confirmada por el plugin nativo, con captura `24-screen-awake-confirmed-by-plugin.png`.
- La suite EMOM no pasó globalmente: primero el harness buscaba un botón en lugar de un switch; después un tap de Detener cayó bajo la cabecera fija. El intento aislado posterior ejecutó 0 pruebas y **no cuenta como validación**. Detener cuenta con cobertura determinista, pero no quedó verificado mediante ese test nativo.
- Sonido físico, modo silencio, ejecución prolongada en segundo plano, compras reales y dispositivos reales no verificados. No se realizaron cobros ni clics en anuncios.

Evidencia XCTest: `/Users/papi/Library/Developer/EntrenoAppQA-Cap8-20261025/`.

### Android: UI nativa

AVD nueva `EntrenoApp_QA_Cap8_121`, API 36, serial `emulator-5556`. El primer arranque presentó ANR del launcher/System UI. En el segundo se redujo la resolución a 540×1170 conservando el tamaño lógico y se asignaron 3 GB/4 CPU; el arranque llegó al onboarding tras pulsar Esperar una vez. Esto no acredita un ANR de EntrenoApp.

Onboarding de Musculación/Ganar músculo/intermedio, cuatro días, 40 minutos y Gym completo completado por UI. Registro de 62,5 kg × 10 repeticiones en la serie 1, descanso y serie 2 conservando 62,5 kg confirmados visualmente. Capturas `android-cap8-121-gym-entered.png`, `android-cap8-121-gym-rest.png` y `android-cap8-121-gym-next-set-copied.png` en la carpeta de evidencia.

Pantalla activa confirmada además mediante `dumpsys window`: `KEEP_SCREEN_ON` ausente antes, presente al activar y retirado al desactivar, con los estados de UI correspondientes. Capturas `android-cap8-121-keepawake-on.png` y `android-cap8-121-keepawake-off.png`.

Cross/EMOM completado por UI tras reiniciar exclusivamente los datos ficticios de la app en esta VM desechable para repetir el onboarding de Cross. Al retomar el día 26, la VM estaba apagada y se arrancó la misma AVD sin wipe: conservó el plan WOD 3 y su borrador. Reloj iniciado a 15:00, pausa con tiempo fijo 14:48 entre dos observaciones, reanudación y cambio automático a minuto 2 / 12 Box Step-ups a 13:54. Detener restauró 15:00, minuto 1 / 8 Power Cleans y los botones Iniciar reloj/Marcar hecho. Un segundo inicio comenzó en minuto 1 a 14:59, sin retomar el tiempo previo; un segundo Detener restauró de nuevo 15:00. Sin errores AndroidRuntime observados durante este tramo. Las pruebas se hicieron sin red en la VM para no activar anuncios ni operaciones externas. Al terminar, la misma AVD se apagó tras validar su nombre; sus datos y evidencias se conservaron.

Informe completo: `/Users/papi/Documents/EntrenoApp/native-release-audits/2026-10-25/android-cap8-121-qa-final.md`. Capturas `android-cap8-121-emom-minute2.png`, `android-cap8-121-emom-restarted-minute1.png` y `android-cap8-121-emom-final-stopped.png`.

No se verificaron audio físico, compras reales, dispositivos reales ni todos los modelos admitidos; no se afirma una prueba funcional exhaustiva.

Google Play validó API 36/mínimo 24 y mostró la protección automática activada. La revisión del release solo mostró dos advertencias no bloqueantes: 1.691 modelos antes admitidos dejan de serlo al elevar el mínimo compatible y ausencia de mapping de desofuscación (`minifyEnabled false`, sin ofuscación en esta build). El lanzamiento guardado cubre el 100 % en los países de destino existentes, sin añadir países.

Después de publicar, el panel de producción muestra además un aviso de **Uso de memoria / Comportamiento inadecuado**, con fecha «feb 2027», y una recomendación de experiencia de usuario. El título explicativo no se expone correctamente en la UI examinada; el paquete enlazado sí declara compatibilidad con 16 kB. No se deduce de ello la causa ni se afirma que el aviso esté resuelto. Queda como seguimiento de calidad no bloqueante para la versión ya activa; evidencia visible en la captura de producción.

Durante la preparación se desactivó la publicación gestionada para cumplir la publicación automática tras aprobación autorizada, tras comprobar que no había otros cambios listos para publicarse. Al retomar el día 26, Safari mostró de nuevo publicación gestionada activada y **un único cambio aprobado**, la versión de producción 2.3 (121). Después cambió externamente a última publicación el 26 de octubre y sin cambios no publicados. El agente no pulsó el botón final de publicación en esta reanudación y no se atribuye esa acción externa. Se confirmó en Probar y publicar la última versión 2.3 (121) al 100 %, y en Producción el canal activo con esa misma versión en 178 países o regiones.

## Despliegue web

Netlify producción: `6ade7a1fb6c6574a6738ff17`.
Permalink: https://6ade7a1fb6c6574a6738ff17--entrenoapp.netlify.app.
Preview previa: `6ade78d1e07537e280bf3aa5`.

Selección pública de 612 archivos escaneada sin hallazgos. Funciones empaquetadas desde TypeScript actual, excluyendo ZIP antiguos. Página principal y privacidad HTTP 200; GET de endpoints Plus responde 405 sin mutar datos. Se inspeccionó producción sin modificar el perfil existente del usuario. El 26 de octubre se confirmó de nuevo que el HTML público mantiene el SHA256 canónico indicado arriba.

La integración Git de Netlify continúa conectada a `main` y no está bloqueada: un despliegue posterior de esa rama puede reemplazar esta publicación manual. No se ha modificado ni enviado `main`.

## Evidencia y límites

Logs y capturas: `/Users/papi/Documents/EntrenoApp/native-release-audits/2026-10-25/`. Logs principales `cap8-full-tests-final.log`, `cap8-android-build-final.log`, `cap8-ios-archive.log`, `cap8-ios-upload.log`, `cap8-netlify-production.log`.

`npm audit` conserva 10 hallazgos transitivos (8 moderados y 2 altos; ninguno crítico). La revisión de alcanzabilidad no encontró una ruta activa bloqueante: los altos `@fastify/busboy` e `image-size` proceden de utilidades de emulación de Netlify, no de los assets web/nativos ni de imports usados por las funciones actuales. Los moderados afectan herramientas de desarrollo y la propagación Baggage de OpenTelemetry, que no activa el bootstrap de servidor examinado. Esto no equivale a una garantía de seguridad. Queda como mantenimiento actualizar selectivamente esos parches y volver a probar las funciones, sin aplicar el downgrade de Capacitor sugerido por `npm audit fix --force`. Se conserva el lock exacto de los artefactos presentados.

Se limpiaron solo cachés regenerables de compilación autorizadas. Se preservaron artefactos finales, fotografías, proyectos, aplicaciones, claves y copias de iCloud. No se afirma ausencia total de errores ni aprobación de las tiendas antes de que estas la confirmen.
