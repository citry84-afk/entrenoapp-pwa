# Publicación en producción: uso diario

Fecha local: 23 de octubre de 2026 (Europe/Madrid).

## Autorización y alcance

Petición explícita: «ponlo en producción para probarlo». Se publica el mismo paquete validado en la vista previa `6ada71891daf28300218c209`, sin cambios adicionales de producto ni publicaciones nativas.

El usuario ha sido avisado de que un push posterior a `main` puede sustituir la publicación manual. No se bloquea ni se cambia la configuración de despliegue automático.

## Comprobaciones previas

- Paquete público: 188 archivos regulares, sin symlinks, archivos de entorno, directorios nativos o credenciales de firma.
- `app.html` en origen, `www`, paquete y vista previa coincide con SHA-256 `9f89b74b0d7a0e66c3cafc0d6e2b08a890f16db741e1a145805841c8ee6ebb81`.
- `index.html` en origen, `www` y paquete coincide con SHA-256 `c73eab78782383366ac5632f51c27305a0e0b9be770553645579cb5caea89d24`.
- Reejecutadas 97 pruebas focalizadas: recorrido diario 49, Home 27 y borradores 21; todas correctas. El paquete ya había superado las suites completas y la comprobación previa al deploy en la tanda del 22 de octubre.
- Revisión independiente del paquete realizada sin editar fuentes. No se han regenerado ni incorporado cambios ajenos al paquete probado.

## Resultado del despliegue

- Deploy `6adadebdcee6760babd2097a`: estado `ready`, contexto `production`, publicado el 23 de octubre de 2026 a las 04:12:54 UTC.
- URL: https://entrenoapp.com/app.html?v=20261023
- HTTP 200 en la app; SHA-256 remoto idéntico al paquete probado (`9f89b74b0d7a0e66c3cafc0d6e2b08a890f16db741e1a145805841c8ee6ebb81`). Cabecera `Cache-Control: no-cache,no-store,must-revalidate`.
- Portada HTTP 200 y contenido sin cambios, SHA-256 `c73eab78782383366ac5632f51c27305a0e0b9be770553645579cb5caea89d24`; sin cabecera global de noindex.
- Informe analítico protegido: HTTP 401 sin autorización y `Cache-Control: no-store`.
- Verificación visual a tamaño móvil: nueva pantalla Hoy visible en el dominio público; sin errores ni avisos de consola capturados. Solo se ha leído la interfaz existente, sin iniciar, marcar, guardar o descartar entrenamientos ni modificar el perfil.
- Evidencia: `produccion-hoy-iphone.jpg` (perfil de prueba preexistente).
- La inspección del navegador se hizo con `qa=1`; no se enviaron eventos analíticos ficticios.
- Sin publicación en App Store Connect ni Google Play; sin migraciones u operaciones de edición/borrado de datos del usuario ni cambios en la configuración de despliegue automático.
