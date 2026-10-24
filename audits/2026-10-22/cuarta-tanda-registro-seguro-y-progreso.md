# Cuarta tanda: registro seguro y progreso legible

Fecha de revisión: 22 de octubre de 2026. Cambios locales y despliegue de borrador; no publicación en producción ni en App Store/Google Play.

## Cambios aplicados

- Las referencias históricas rellenan únicamente series pendientes. Conservan las series realizadas, las notas, las sensaciones y el peso corporal de la sesión actual.
- Cada ejercicio busca su última referencia compatible realmente realizada, incluso si una sesión parcial más reciente lo omitió. No se mezclan variantes ni materiales distintos.
- Copiar una serie o completar un ejercicio no sobrescribe series ya registradas. Las filas históricas omitidas mantienen su posición y no se convierten en referencias.
- Se valida carga finita no negativa y repeticiones o duración positivas al marcar y al guardar. Se aceptan decimales con coma. Desmarcar continúa siendo posible si una fila quedó inválida.
- Registro de fuerza, controles de descanso, finalización, resumen, historial y primer nivel de progreso revisados en español e inglés. Etiquetas accesibles y estados de selección explícitos.
- Los minutos del feedback temporal reflejan lo marcado, no el objetivo del plan. El progreso distingue el tiempo registrado de la sesión, que incluye descansos, de los minutos de actividad temporal.
- El encabezado de progreso describe registros guardados sin presentar una estimación de recuperación como dato medido.
- Notas, nombres e identificadores importados se tratan como datos. El historial usa índices validados en sus callbacks y escapa el contenido visible; los valores internos de las bandas no se traducen ni se reescriben.
- Borrar el historial explica que incluye pesos corporales y la próxima fecha, conserva el entrenamiento en curso y restaura el estado en memoria si falla el guardado.

## Verificación

- `npm test`: correcto. Incluye 36 pruebas nuevas de seguridad del registro, 34 de resumen/finalización ES/EN, 54 de interfaz de historial/progreso y dos regresiones adicionales del guardado en el bloque de historial.
- `npm run verify`: correcto, sin errores bloqueantes.
- `npm run build`: correcto; los recursos de `www/` quedan actualizados para un posterior empaquetado nativo, sin compilar ni firmar binarios.
- `git diff --check` sobre los archivos de código modificados: correcto. No se han creado commits ni alterado ramas.
- La preparación web finaliza con 188 archivos públicos, sin enlaces simbólicos, archivos de entorno, claves de firma ni carpetas nativas.
- El hash de `app.html` coincide entre fuente, `www/` y el directorio preparado para la vista previa.

## Recorrido móvil probado

Perfil de QA aislado en localhost, viewport 390 × 844 y datos ficticios; no se accedió al historial real del usuario ni se enviaron eventos de prueba a la analítica agregada.

1. Se recuperó el borrador y se intentó completar una serie con cero repeticiones: se rechazó con explicación y sin marcarla.
2. Se introdujo `72,5` con el teclado: el campo conservó `72.5`.
3. Se completó una serie con 72,5 kg × 9 y se añadió `QA <b>literal</b> & descanso` como nota.
4. Se cargaron referencias: la serie completada siguió en 72,5 × 9; las pendientes recibieron sus referencias compatibles y la nota permaneció.
5. Se guardó la sesión parcial. Tras recargar, el historial muestra una sola serie realizada; los demás ejercicios figuran como no completados y la nota se muestra literalmente, sin interpretar HTML.
6. Se revisó el primer nivel de progreso y su etiqueta de tiempo incluyendo descansos. La duración larga de este registro ficticio procede de un borrador de QA que permaneció abierto entre días; no representa una sesión deportiva real.
7. Sin errores de consola en el recorrido final. Evidencia: `historial-en-qa.jpg`.

## Límites y siguientes validaciones

- No se ha probado esta tanda en iPhone o Android físicos ni se han validado compras/restauraciones en sandbox.
- Los módulos opcionales de salud, Mind, WOD y consejos ampliados aún no tienen una revisión lingüística integral. No se presenta como una traducción completa de toda la app.
- No se ha cambiado la versión ni enviado metadatos o capturas a las tiendas. Las capturas de QA no sustituyen a las capturas comerciales.
- No hay evidencia de incremento de descargas o retención: estos cambios aún son de revisión y las cifras históricas agregadas no equivalen a usuarios únicos ni a cohortes nativas.
- Algunos archivos antiguos tardaron en responder durante la sincronización de la carpeta. Se esperó a que las comprobaciones y la copia finalizaran correctamente; no se omitieron ni sustituyeron por versiones antiguas.

## Vista previa

[Abrir la app de revisión](https://6ada26e9b8e5d58beff5fda9--entrenoapp.netlify.app/app.html).

- Despliegue de borrador `6ada26e9b8e5d58beff5fda9`, sin `--prod`.
- `app.html` e `index.html`: HTTP 200, coincidencia exacta con los archivos locales y cabecera `X-Robots-Tag: noindex`.
- `/api/analytics/report`: HTTP 401 sin credenciales y `Cache-Control: no-store`. No se enviaron eventos ficticios al servicio.
- La interfaz remota abre correctamente, sin errores de consola en la carga comprobada. Se conserva abierta como entrega de revisión.
