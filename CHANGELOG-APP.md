# Registro de versiones de EntrenoApp

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
