# Registro de versiones de EntrenoApp

## 2.3 — iOS (123) / Android (121) — 25 de octubre de 2026

Estado actualizado el 26 de octubre: web publicada; Android 2.3 (121) activo en producción al 100 %; iOS 2.3 (123) enviado y pendiente de revisión, con publicación automática tras aprobación. Las pruebas principales y sus límites están documentados en `audits/2026-10-25/native-release-capacitor8.md`.

- Reloj WOD basado en una fecha límite real; controles actualizados al iniciar, pausar, continuar y terminar, sin reinicios por doble pulsación.
- Avisos EMOM y cuenta atrás independientes del descanso; callbacks antiguos y sonidos tardíos cancelados.
- Pantalla activa solo cuando el sistema confirma la activación; recuperación al volver a la app y liberación al guardar o descartar.
- Corrección de prescripciones de segundos en Fuerza Vital y migración limitada de sus borradores antiguos sin cambiar resultados introducidos.
- Compatibilidad con Android API 36 y ciclo de escenas de iOS; fondos nativos oscuros coherentes.
- Anuncios condicionados al permiso UMP y acceso a sus opciones de privacidad cuando es necesario.
- Se mantienen identificadores, firma, datos locales, iOS 15 y Android 7 como mínimos aprobados.

Notas ES/EN: `store-listing/release-2.3-123.md`.

## 2.3 — iOS (122) / Android (120) — 25 de octubre de 2026

Estado: iOS 2.3 (build 122) firmada y procesada en TestFlight; Android 2.3 (versionCode 120) firmada, aceptada por Play y en borrador interno. QA iOS parcial completada; QA Android bloqueada por espacio del emulador. Sin envío a revisión ni publicación; falta corregir controles EMOM y completar avisos/pantalla activa.

### Novedades que se incluirán

- Registro de kg, repeticiones y series más rápido, con el peso conservado para la siguiente serie.
- Ilustraciones premium de ejercicios.
- Rutinas Torso/Pierna más equilibradas.
- Navegación y menús más sencillos.
- Programa Cross training de 10 semanas y 50 WOD de 15 minutos, con temporizadores EMOM y For Time.

Notas para las tiendas en español e inglés: `store-listing/release-2.3-122.md`. El envío a revisión y el lanzamiento requieren autorización previa.

### Preparación nativa

- Capacitor actualizado al parche 6.2.2, sin migración mayor ni cambios al HTML publicado.
- Compatibilidad mínima aprobada: iOS 15 y Android 7 (API 24), manteniendo la protección automática de Play.
- Backport del arreglo oficial de RevenueCat para Xcode 27, aplicado tras cada instalación de Pods y cubierto por pruebas.
- Los paquetes contienen los mismos 432 archivos web e imágenes que `www/`; SHA256 de `app.html` idéntico a producción.
- Registro de compilación, verificaciones y limitaciones en `audits/2026-10-25/native-release-2.3.md`.
- QA iOS confirma copia de kg y avance del EMOM, pero descubre controles del reloj sin actualizar al iniciarlo. Pendiente de corregir y volver a empaquetar antes de revisión; HTML conservado idéntico a la web.

## Tanda web en curso - 10 de julio de 2026

Estado: publicada en `https://entrenoapp.com`. Los cambios están sincronizados en `www/` para incluirlos en la siguiente compilación de iOS y Android.

### Añadido

- Inicio rápido basado en nivel: `Empiezo de cero`, `Ya he entrenado` o `Entreno con frecuencia`.
- Cada nivel genera una propuesta inicial diferente: el perfil principiante comienza con 20 minutos, sin material y con ejercicios claros; intermedio y avanzado reciben una rutina de gym adaptada a su punto de partida.
- El plan de inicio ya no deriva por defecto a `Fuerza vital`; esa opción se mantiene solo para quien elige expresamente empezar muy fácil.
- El nivel queda visible en Perfil y se puede cambiar después. Al cambiarlo, EntrenoApp regenera la rutina sin borrar el historial.
- Los ejercicios con peso corporal no piden kg: solo repeticiones. Los entrenos con bandas mantienen registro de resistencia y repeticiones.
- El WOD diario solo se muestra en perfiles CrossFit, HYROX o híbridos funcionales; no aparece como distracción en planes de iniciación, caminar o fuerza vital.
- Acceso rápido a la última sesión dentro del entrenamiento: recupera pesos, repeticiones y bandas de la sesión equivalente con un toque, antes de empezar a registrar.

### Inspiración revisada: Lyfta

- Lyfta destaca por permitir abrir una rutina y registrar rápido: historial por ejercicio, temporizador de descanso, referencias previas, rutinas propias y progreso visible.
- Decisión de producto para EntrenoApp: conservar la sencillez de "entrenar sin pensar" y llevar esas utilidades a acciones puntuales, no a una pantalla llena de métricas avanzadas.
- EntrenoApp ya cubre temporizador, rutinas propias, alternativas, referencia anterior, progreso, GPS y planes de inicio. La siguiente mejora de esta línea será facilitar la explicación visual de ejercicios, especialmente para quien empieza desde cero.

### Verificación y publicación web

- `npm run verify` correcto.
- `npm run build` correcto y `app.html` sincronizado con `www/app.html`.
- JavaScript principal analizado sin errores y `git diff --check` correcto.
- Producción publicada en Netlify el 10 de julio de 2026.

## Próxima versión móvil - 1.99 (build 116)

Estado: base Plus implementada; pendiente de configuración privada y prueba en deploy.

### Añadido desde 1.98 (115)

- Guías de ejercicios para principiantes y personas mayores con propósito, tres pasos y seguridad.
- YouTube pasa a ser una ayuda externa opcional.
- Presentación inicial de EntrenoApp Plus y socios fundadores.
- Base segura para activar Plus mediante códigos validados en servidor.
- Tokens Plus con caducidad, ligados a una instalación.
- EntrenoApp Rewards: invitación personal, prueba de 7 días y un mes por cada tres activaciones únicas.
- Primera experiencia IA Plus: Coach sorpresa con una acción breve basada en el contexto local.
- Primer entrenador adaptativo Plus: tres respuestas convierten la sesión prevista en completa, corta, suave o corta + suave.
- La adaptación se previsualiza y solo se aplica cuando el usuario la confirma; la rutina original no se modifica.
- Preparación de Gemini Flash-Lite mediante función de Netlify; la clave nunca se incluye en la app.

### Corregido

- El formulario de interesados Plus usa el dominio público cuando se ejecuta dentro de iOS o Android.
- Los anuncios se ocultan mientras exista un acceso Plus activo.

### Pendiente antes de publicar

- Configurar variables de entorno de Plus y Gemini en Netlify.
- Probar códigos, expiración, rewards y límites diarios en un deploy de prueba.
- Probar AdMob con Plus activo e inactivo en iOS y Android.
- Sincronizar Capacitor cuando se cierre la siguiente tanda móvil.

### Verificación completada

- `npm run build` y `npm run verify` correctos el 21 de junio de 2026.
- Las tres Netlify Functions se empaquetan correctamente.
- Revisión visual a 390 x 844 sin desbordamiento horizontal ni errores de consola.
- `app.html` y `www/app.html` son idénticos tras el build.

## 1.98 (115) - 13 de junio de 2026

- Último archive iOS y bundle Android localizados para comparar cambios.
- GPS para caminar y correr, referencias anteriores, música, pantalla despierta y modo muñeca.
- Ajustes de banner para no cubrir la navegación inferior.
- Onboarding simplificado y rutina propia.
