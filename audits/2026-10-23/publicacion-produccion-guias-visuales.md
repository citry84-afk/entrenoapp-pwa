# Publicación de guías visuales — 23 de octubre de 2026

Autorización: el usuario aprobó la vista previa y pidió llevarla a producción. No se amplía el alcance a App Store, Google Play, cambios de cuentas, bloqueo de despliegues ni migraciones de datos.

## Paquete aprobado

- Vista previa aprobada: `6adaf76faedc3c2e40397708`.
- Snapshot público: `/var/folders/gr/lcm7yq1n7rx_yylcyxwtc0f00000gn/T/entrenoapp-web-release-2daxoD`.
- SHA-256 app: `48cd060b9cb69238ca56d3a36258afcbfcf1c665a58e640f0febd202bbfbbab9`.
- SHA-256 portada, sin cambios: `c73eab78782383366ac5632f51c27305a0e0b9be770553645579cb5caea89d24`.
- Módulos: músculos `6fd9a19841f7fa1f79f0969aedbdc0eca0a4ba4e4262d58e4a6701ac40ee8c15`; medios `2c72f021fea2eca9b425ca0f7e2ff376b8d4ffa63a3b6027b7f4b81dc9118cb8`; visuales `9145d1bff2dd1aea2af19d6417bbb5e0df7816093d5fcedbc5596edfaa4e9fbc`.
- 206 archivos, 14 PNG originales, créditos y 3 módulos; auditoría independiente sin .env, Git, código nativo, auditorías, scripts, enlaces simbólicos ni claves privadas. La configuración pública Firebase y el vendor de Identity ya existentes se conservan.
- Snapshot y archivos visuales actuales coinciden por hash; no se ha reconstruido una versión diferente ni se ha publicado la raíz del workspace.

## Comprobaciones previas

- `npm test`: correcto. 43 comprobaciones de perfiles, 31 de visuales y 50 del flujo diario, además de todas las regresiones existentes.
- `npm run verify`, repetido en esta publicación: correcto, sin errores bloqueantes.
- El snapshot ya había pasado `npm run verify`, `npm run build` y el recorrido completo de bienvenida con guardado en la vista previa.
- Producción antes de publicar: deploy `6adadebdcee6760babd2097a`, app con hash `9f89b74b0d7a0e66c3cafc0d6e2b08a890f16db741e1a145805841c8ee6ebb81`.
- Se avisó de que el siguiente push a la rama de producción puede sustituir el despliegue manual. No se ha bloqueado ni cambiado Git CD.

## Alcance funcional

27 perfiles musculares, 7 referencias de dos posiciones, ampliación/reproducción/pausa, mapas frontal/dorsal y feedback de descanso. La cobertura sigue siendo parcial y los mapas son esquemas orientativos. No se cambia el formato del historial ni se traslada el historial ficticio de la vista previa al dominio principal.

## Publicación y comprobación posterior

- [App en producción](https://entrenoapp.com/app.html?v=20261023-visual1).
- Deploy `6adbbe414179615e0a009d66`, estado `ready`, contexto `production`, publicado el `2026-10-23T20:06:33.855Z`.
- CLI `netlify-cli@27.1.2`, `--prod --no-build`, snapshot público explícito y funciones existentes. Sin cambios de configuración, secretos, Git ni stores.
- App, portada y los tres módulos remotos coinciden por SHA-256 con el snapshot aprobado. Portada conservada y sin noindex global.
- Auditoría GET independiente: 14 PNG y `CREDITS.md` responden 200; sus 15 hashes coinciden con el snapshot.
- El informe privado `/api/analytics/report` conserva 401 sin autenticación y `Cache-Control: no-store`.
- Navegador en el dominio principal: recarga correcta, los tres módulos versionados están referenciados y consola sin errores/avisos. Se mantuvo intacto el perfil existente, sin iniciar ni registrar ninguna sesión.
- El recorrido interactivo completo ya se había verificado en la misma versión de la vista previa; no se crearon sesiones ficticias en el dominio principal.
