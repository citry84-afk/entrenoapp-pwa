# Capa visual y demostraciones — 23 de octubre de 2026

## Alcance

Nueva vista previa web, sin sustituir producción ni enviar versiones a las stores. La guía visual se añade al ejercicio activo del modo paso a paso y a su ficha. No modifica el plan, las series, las cargas ni el historial.

- 27 perfiles musculares revisados por nombre y material, no por coincidencias del ID o del texto del consejo.
- Mapas SVG originales con vista frontal/dorsal, grupos principales y de apoyo. Son esquemas educativos, no mediciones de activación o recuperación.
- 7 demostraciones de dos posiciones: banca con barra, sentadilla con barra, banca plana con mancuernas, rumano con barra, press de hombros explícitamente sentado con mancuernas, flexiones y remo en polea baja.
- Introducción breve de cuatro cambios de posición; reproducción/pausa manual y ampliación. No se presenta como un GIF continuo ni como una evaluación de técnica.
- Confirmación breve al completar una serie y aro de descanso conectado al temporizador existente.
- Sin reproducción automática con movimiento reducido o ahorro de datos. Se pausa al ocultar la página, salir de la sesión o empezar el descanso.
- Las variantes sin referencia exacta conservan un mapa revisado o un aviso honesto, sin inventar otra demostración.

## Procedencia y revisión visual

14 PNG originales de [Everkinetic](https://github.com/everkinetic/data), revisión `446bb9a3d0c3beb6b84f7c9d77dfc8af707a2ab6`, con atribución visible y enlaces a [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) y créditos locales. No se han modificado los archivos de imagen. La atribución completa y la procedencia están en `assets/exercise-media/CREDITS.md`.

Se inspeccionaron las 18 imágenes candidatas. Se descartaron el jalón de agarre ancho por discordancia visual con la variante al pecho y la sentadilla con bandas por encuadre incompleto. Tampoco se reutilizan imágenes de banca plana para inclinada ni de press sentado para de pie.

Se descartó la biblioteca de imágenes de `free-exercise-db`: las incidencias del mantenedor señalan incertidumbre sobre derechos del contenido visual. La licencia del código/dataset no demuestra por sí sola permiso sobre cada imagen.

Fuentes de los perfiles: enlaces por ejercicio a ACE, NASM, NSCA, wger y manual de fabricante para el remo con apoyo pectoral. Las zonas son categorías editoriales simplificadas; no son una lista anatómica exhaustiva.

## Verificación

- `npm test`: correcto. Las suites nuevas completan 43 pruebas de perfiles y 31 de visuales; el flujo diario completa 50, además de las regresiones existentes.
- `npm run verify`: correcto, sin errores bloqueantes.
- `npm run build`: correcto; recursos copiados para Capacitor. No se ha enviado ningún binario.
- Prueba real de navegador a 390×844 con perfil ficticio local: carga de imágenes, ampliación, cambio frontal/dorsal, alternancia de contenido y conservación de entradas `45.5 kg`/`10 reps`.
- Registro de dos series y transición sentadilla → banca: el mapa y la referencia cambian según el ejercicio real; descanso, pausa y omisión mantienen su comportamiento.
- Sustitución banca con barra → mancuernas: fuentes PNG distintas y datos compatibles, sin heredar la imagen de barra.
- Ficha ampliada y contexto guiado no reproducen simultáneamente. La revisión independiente detectó y cubrió el reinicio del reloj UI que cancelaba la introducción.
- Los nombres genéricos «Sentadilla», «Press hombros» y «Curl bíceps» en gym exigen además el ID del catálogo correspondiente: un personalizado ambiguo no recibe la demostración de barra.
- Pruebas aisladas con módulos reales cubren errores de imagen, carga diferida, ahorro de datos, movimiento reducido, foco, idioma, rutas inseguras, DOM retirado y ausencia de mutaciones de los datos.
- Descanso voluntario con cero series registradas: no afirma que se haya completado una serie.
- Prueba desde cero en la vista previa final: onboarding → sesión de bienvenida → sentadilla, banca, remo con sus referencias correspondientes → 3/3 guardados. Sin errores ni avisos de consola. Perfil ficticio y analítica QA desactivada.

## Vista previa final

- [Abrir la app de prueba](https://6adaf76faedc3c2e40397708--entrenoapp.netlify.app/app.html?qa=1)
- Deploy `6adaf76faedc3c2e40397708`: `ready`, contexto `deploy-preview`, sin publicación de producción.
- Paquete público separado: 206 archivos; sin .env, Git, fuentes nativas, auditorías, scripts, claves o enlaces simbólicos. El vendor público de Netlify Identity se conserva.
- App, módulos y créditos remotos coinciden con los archivos locales por SHA-256. App y recursos responden 200. La app conserva noindex y no-cache; el informe privado de analítica responde 401 sin autenticación y no-store.
- SHA-256 app de vista previa: `48cd060b9cb69238ca56d3a36258afcbfcf1c665a58e640f0febd202bbfbbab9`.
- Producción sigue devolviendo el hash anterior `9f89b74b0d7a0e66c3cafc0d6e2b08a890f16db741e1a145805841c8ee6ebb81`; no ha sido reemplazada.
- Capturas locales: `preview-demostracion-iphone.jpg`, `preview-musculos-iphone.jpg` y `preview-descanso-iphone.jpg`.

## Limitaciones y siguiente paso

La cobertura no comprende todo el catálogo, los ejercicios personalizados ni todas las variantes. Caminar, correr, Vital, temporizados y superseries mantienen sus controles específicos. Los mapas son esquemáticos, no fotografías. Antes de ampliar el catálogo o publicar en stores conviene revisar cada nuevo recurso y su variante exacta, probar en un iPhone físico y recoger sensaciones de uso continuo.

Las pruebas móviles automatizadas usan un viewport de navegador; no sustituyen una prueba física de Safari/Capacitor. La vista previa usa otro dominio y por tanto otro almacenamiento local: no contiene el historial del dominio de producción.
