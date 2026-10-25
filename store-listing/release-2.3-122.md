# EntrenoApp 2.3 — iOS (122) / Android (120)

## Estado de preparación

Preparación nativa del 25 de octubre de 2026: iOS 2.3 (122) firmada, exportada y procesada en TestFlight ("Lista para enviar"); Android 2.3 (versionCode 120) firmada, aceptada por Google Play y guardada como borrador interno. Ninguna enviada a revisión ni publicada. Las notas siguientes siguen siendo borradores.

Compatibilidad mínima aprobada por el titular: iOS 15 y Android 7 (API 24). Se conserva la protección automática de Google Play. HTML empaquetado idéntico a producción, SHA256 `e2431b2c942c87995bcee1c35075b490ad982f3fc4e65002b0ccc001327c8220`.

## Novedades para las tiendas

### Español

Entrena con menos toques y más claridad:

- Registra kg, repeticiones y series más rápido; el peso se conserva para la siguiente serie.
- Nuevas ilustraciones premium para orientarte.
- Rutinas Torso/Pierna más equilibradas.
- Menús más sencillos para encontrar tu entrenamiento.
- Cross training: 10 semanas, 50 WOD de 15 minutos, con temporizadores EMOM y For Time.

### English

Train with fewer taps and more clarity:

- Log kg, reps and sets faster; the weight carries over to your next set.
- New premium illustrations to guide you.
- Better-balanced Upper/Lower routines.
- Simpler menus to find your workout.
- Cross training: 10 weeks, 50 WODs of 15 minutes, with EMOM and For Time timers.

## Pendiente antes de publicar

- Cerrar las pruebas de dispositivo de registro, rutinas, temporizadores, avisos y pantalla despierta. Las pruebas automáticas y la integridad de los dos paquetes ya pasan.
- Corregir los controles del EMOM detectados en iOS: el reloj avanza, pero tras iniciarlo sigue visible «Iniciar reloj» y no aparecen Pausar/Detener hasta otro render. Requiere nuevos builds; estos conservan exactamente el HTML publicado.
- Elegir la distribución a testers internos si se desea; no se han añadido grupos ni destinatarios.
- Solicitar autorización antes de cualquier envío a revisión o lanzamiento.

Detalle técnico y evidencia: `audits/2026-10-25/native-release-2.3.md`.
