# EntrenoApp 2.3 — preparación nativa, 25 de octubre de 2026

## Estado de las tiendas

| Plataforma | Versión / build | Estado comprobado |
| --- | --- | --- |
| Apple | 2.3 / 122 | Subida correcta con Xcode; procesada en TestFlight, «Lista para enviar», caduca en 90 días. |
| Google Play | 2.3 / 120 | Bundle aceptado y protegido («Mejorado»); borrador en la pista interna, no activo. |

No se han enviado versiones a revisión, iniciado lanzamientos ni añadido testers. Las versiones públicas siguen en 2.2. No se ha desplegado Netlify ni hecho push a `main`.

## Fuente e integridad

- Base: `mejoras/navegacion-simple`, commit `a90491168bc0e7c3266149932aef9167c00a3239`.
- Copia nativa previa protegida y subida: `backup/nativo-local-2026-10-25`, commit `47b7443e3d34d2d6d17269fbd7578f207d7a97fe`.
- HTML de origen, producción, `www`, AAB e IPA: SHA256 `e2431b2c942c87995bcee1c35075b490ad982f3fc4e65002b0ccc001327c8220`.
- AAB, APK debug, archive e IPA: 432 archivos HTML/assets comparados con `www`, sin ausentes ni diferencias.
- Biblioteca activa: 164 pares WebP/JPEG revisados. El árbol conserva además un WebP antiguo no usado por el registro.

## Cambios nativos necesarios

- Capacitor Android/iOS/core/CLI fijados en 6.2.2, parche de la misma rama 6. Corrige el aviso nativo [GHSA-rvm3-566m-v7fv](https://github.com/ionic-team/capacitor/security/advisories/GHSA-rvm3-566m-v7fv).
- Mínimos aprobados expresamente: iOS 15 (Xcode instalado ya no compila para 13) y Android 7/API 24 (requisito mostrado por la protección automática de Play). Protección conservada; target Android 35.
- RevenueCat conserva el plugin 9.2.2 y sus versiones de compra. Se aplica solo el movimiento de inicializador del [arreglo oficial para Xcode 27](https://github.com/RevenueCat/purchases-ios/commit/870899891ac9a05118ae6ee16d4ae189b2c1eac2). Helper idempotente, fail-closed, preserva permisos; ejecutado desde `Podfile post_install` y probado.
- Parche AdMob de tipos UMP confirmado después de npm install y de la sincronización.
- Identificador público de AdMob Android recuperado desde la copia nativa local.

## Artefactos locales

| Artefacto | Ruta | SHA256 |
| --- | --- | --- |
| AAB firmado | `android/app/build/outputs/bundle/release/app-release.aab` | `117e48ca815702d70f914027b7f8860edbc6a0dd148002934823be13c2c8d6a6` |
| APK debug API 24 | `android/app/build/outputs/apk/debug/app-debug.apk` | `834b3c1753cea1e6b8fdf8b622a8ab1e54488fa2c1af58fd9fb34e0690327cec` |
| IPA exportada | `/Users/papi/Library/Developer/Xcode/Exports/EntrenoApp-2.3-122/App.ipa` | `6692dd3223e0cc6dc2ec5d73ea28bb3f3707ff70b9e95124ada38eeba27f8429` |

Archive: `/Users/papi/Library/Developer/Xcode/Archives/2026-10-25/EntrenoApp-2.3-122.xcarchive`.

El archive se genera fuera de Documents para evitar metadatos Finder/iCloud que invalidan la firma. Firma del AAB y APK verificadas; archive verificado con `codesign --verify --deep --strict`; exportación local y subida Apple terminaron correctamente. ZIP de IPA/AAB/APK íntegros.

## Verificaciones

- `npm install`, `npm test`, `npm run verify` y `npm run build`: correctos inicialmente. Tras llegar copias de conflicto de iCloud, `npm test` en el checkout falla por un registro duplicado; no se han eliminado esas copias. La suite completa vuelve a pasar en el snapshot canónico de Git fuera de iCloud (árbol `e425c5d66fedc6737c0510c1fa3d928e7d82fcc5`, incluye los cambios nativos preparados).
- `node scripts/compile-generated-exercise-media.js --require-complete`: 164 revisadas, 0 pendientes.
- `npx cap sync ios` y `npx cap sync android`: correctos.
- `npm run test:native`: movimiento oficial del inicializador, API pública, idempotencia, rechazo de estructura inesperada y permisos de solo lectura.
- `node scripts/test-store-listing.js`: correcto. Conteo adicional de estas notas: español 367/500; inglés 316/500 caracteres.
- QA interactiva iOS: probe de WebView y onboarding Gym/4 días pasados por XCTest en un simulador nuevo. Torso A y copia de 62,5 kg a la segunda serie confirmados. Cross/WOD 3 observado avanzando del minuto 1 al 2, «12 Box Step-ups», a 14:00. El último runner se interrumpió después de esa observación ante el defecto de controles indicado abajo: no se declara suite global aprobada. Audio físico y estado nativo de pantalla activa no comprobados.
- QA Android: el primer dispositivo no terminó de arrancar durante la presión de disco y fue retirado. En una segunda ronda aislada, dos intentos abortaron antes de arrancar: el emulador exige 7.372,80 MB para crear userdata y observó 5.988,77 MB. Se respetó el límite de intentos; no se instaló APK ni se declara verificación de interfaz, audio o `FLAG_KEEP_SCREEN_ON`. Los AVD personales permanecen intactos.

## Límites y pendientes antes de revisión

- **Bloqueo antes de revisión:** tras pulsar «Iniciar reloj», el EMOM actualiza reloj y etiqueta pero mantiene los botones iniciales; Pausar/Detener no aparecen hasta otro render. `startWodTimer` llama a `updateWodTimerDom`, que no recrea las acciones que genera `wodExercisePanel`. Confirmado en capturas a 14:44 y 14:00. No se corrige en este empaquetado para conservar el HTML idéntico a producción; necesita corrección y nuevos builds antes del lanzamiento.
- Cerrar QA Android con más espacio o en un dispositivo físico de prueba. Completar sonido/notificaciones/keep-awake en ambos sistemas; no interpretar una compilación correcta como prueba de esas funciones.
- El WOD de la web usa decremento por intervalos: puede retrasarse en segundo plano. El aviso 3–2–1 depende del estado de descanso; el aviso de cambio de minuto tiene su propia llamada. No se han cambiado estas funciones para mantener exactamente la web solicitada.
- Pantalla activa es opt-in. El texto del botón no demuestra por sí solo el estado nativo; falta comprobar el indicador nativo. Guardar libera keep-awake; descartar no lo libera explícitamente en esta fuente.
- npm audit conserva 12 avisos en herramientas/paquetes de servidor; los dos avisos críticos de runtime nativo quedaron corregidos. No se usó audit fix --force ni se modificó el backend.
- El titular confirmó haber aceptado personalmente el contrato de Apple. No se aceptaron contratos en su nombre.
- Se limpiaron únicamente cachés de compilación autorizadas y outputs/dispositivos temporales propios. No se tocaron fotos, vídeos, aplicaciones ni AVD personales.
- Aparecieron copias de conflicto de iCloud con sufijos numéricos durante el trabajo. Se preservan sin añadirlas a este commit; también se conserva cualquier trabajo local ajeno.

Evidencia local fuera del repositorio: `/Users/papi/Documents/EntrenoApp/native-release-audits/2026-10-25/` (logs redactados, hashes, comprobaciones de ramas y capturas de las tiendas).

QA iOS reproducible y capturas: `/Users/papi/Library/Developer/EntrenoAppQA-20261025-ios/QA-REPORT.md`.
