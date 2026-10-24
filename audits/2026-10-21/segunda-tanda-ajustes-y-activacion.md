# Segunda tanda — Ajustes, primera sesión y copias

21 de octubre de 2026.

Vista previa actualizada: https://6ad8e0d7b410adb830fdb879--entrenoapp.netlify.app/

No se ha cambiado la web pública ni enviado nuevas versiones a las tiendas. Los cambios anteriores del proyecto se conservan; no se ha creado un commit.

## Mejoras implementadas

- **Ajustes más claros:** siete secciones plegables. Plan, avisos y copias aparecen antes de las opciones adicionales; Plus deja de ocupar el inicio. Salud y reloj se identifican como integración pendiente.
- **Accesibilidad y continuidad:** opciones con botones y estado seleccionado, etiquetas en horas y avisos, apertura con teclado. Cambiar una opción o idioma conserva la sección abierta, el foco y la posición. La sesión activa tiene un acceso directo para reanudarla.
- **Bienvenida parcial:** después del primer paso se puede finalizar o guardar lo hecho. No se guardan sesiones vacías. Completar todos los pasos mantiene el guardado automático, sin duplicarlo si se pulsa guardar manualmente.
- **Notificaciones voluntarias:** apagadas por defecto. Ni el alta, ni el arranque, ni el coach solicitan permiso automáticamente. Solo una acción explícita de activación o prueba puede solicitarlo. Las configuraciones existentes se restauran con permiso ya concedido, sin volver a preguntar.
- **Copia completa v2:** incluye plan, actividad guardada, idioma, sonido y entrenamiento en curso desde memoria. Puede rescatar el borrador aunque el almacenamiento rechace escrituras. No exporta credenciales de cuenta.
- **Importación protegida:** acepta copias antiguas, valida antes de reemplazar y comprueba las escrituras. Ante un fallo intenta restaurar las claves anteriores, conserva la memoria y comunica si esa restauración no fue completa. No transfiere permisos de otro dispositivo; cancela avisos antiguos y restaura los importados de forma pasiva.

## Comprobaciones realizadas

`npm test`, `npm run verify` y `npm run build`: correctos. El nuevo comando `npm test` ejecuta ambas suites.

Nuevas pruebas de esta tanda:

- 14 de cambios de preferencias sin perder sesión ni historial.
- 14 de grupos, foco, scroll, botones e idioma de Ajustes.
- 12 de bienvenida vacía, parcial, automática, reintento y duplicados.
- 21 de permisos y notificaciones voluntarias.
- 28 de copias, validación, escritura, recuperación y portabilidad de permisos.

Además siguen pasando las 49 regresiones anteriores, 252 casos de planificación de caminar/correr, cuatro sustituciones de material y las pruebas de atribución/reintentos analíticos.

En navegador y con datos ficticios en orígenes locales aislados:

1. Cambiar tiempo mantuvo Mi plan abierto, el foco en la opción elegida y el borrador intacto.
2. Cambiar a inglés mantuvo Idioma abierto y el foco en el idioma seleccionado.
3. Una instalación nueva mostró avisos apagados. La sección se abrió con Enter; horas y estados tienen etiquetas accesibles.
4. Una bienvenida 0/3 no permitía finalizar; después de 1/3 ofreció Guardar lo hecho y guardó la sesión parcial.
5. Se exportó una sesión con 77 kg × 11 completados, se importó y, tras recargar, la serie seguía marcada con sus valores. El historial anterior se conservó dentro de esa copia.
6. Se revisó la pantalla móvil a 390 × 844. Sin errores de consola en los recorridos comprobados.

Los recursos de `www` están actualizados para Capacitor. Esto no equivale a haber compilado, firmado ni probado un binario en un teléfono.

## Evidencia

- `ajustes-simplificados.png`: nueva pantalla móvil.
- `bienvenida-parcial.png`: primera sesión guardada con 1/3 pasos.
- `copia-restaurada.png`: serie de 77 kg × 11 recuperada desde la copia.

## Siguiente validación

Probar en iPhone y Android físicos la descarga/importación de archivos, los permisos reales, el arranque en frío y las compras/restauración sandbox pendientes. La publicación web o nativa sigue separada de esta vista previa; no se han contratado campañas ni añadido seguimiento personal.
