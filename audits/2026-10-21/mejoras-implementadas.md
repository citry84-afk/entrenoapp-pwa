# EntrenoApp — mejoras implementadas y verificadas

Fecha: 21 de octubre de 2026.

Vista previa: https://6ad8da30b77ee01907388cae--entrenoapp.netlify.app/

Esta es una publicación de prueba independiente, no un despliegue de producción. No se ha enviado ni publicado una nueva versión de iOS o Android. Se han conservado los cambios anteriores del proyecto; no se ha creado un commit.

## Cambios

- Borrador automático separado del historial. Conserva series, pesos, repeticiones, notas, alternativas y hora de inicio al salir y recargar. Hoy permite reanudarlo o descartarlo con confirmación.
- La sesión conserva una copia de su prescripción: cambiar preferencias o regenerar el plan no sustituye el entrenamiento en curso.
- Express y Suave generan las mismas series para la prescripción, el registro, el progreso y el guardado. Los cambios de modo conservan el trabajo completado. Los bloques cortos no se alargan al reducirlos.
- Las instrucciones antiguas que incluían otras cantidades de series o descanso ya no contradicen la prescripción en la vista previa ni en el ejercicio.
- Los minutos previstos de bloques no completados no cuentan como actividad realizada. Las gráficas distinguen variantes y material y excluyen cargas pendientes.
- Guardar dos veces no duplica una sesión. Un fallo de almacenamiento no anuncia éxito ni elimina el entrenamiento; se puede reintentar. La bienvenida dispone de guardado manual si se interrumpe el automático.
- Hoy mantiene un acceso a la primera sesión corta hasta guardar una sesión, aunque se haya cerrado la bienvenida inicial.
- Material, tiempo, días y objetivo regeneran el plan al seleccionarlos, preservando el historial y el borrador activo.
- Portada y Plus en español e inglés presentan la misma oferta: 4,99 €/mes o 29,99 €/año; prueba anual de siete días para suscripciones elegibles. Se han retirado las listas de espera y la promesa anterior de 1 €/mes de estas superficies y de los paneles internos antiguos de Plus.
- Se conservan las cinco etiquetas UTM en los enlaces internos de captación marcados. El botón usado se registra como `cta_source` / `interaction_source`, sin reemplazar la campaña. Plus y Coach incorporan seguimiento agregado compatible con el existente.
- Las referencias al script de captación están versionadas para evitar reutilizar su copia antigua. Localhost y las vistas previas no envían eventos al informe agregado de producto.

## Verificación automática

`npm run test:workouts`, `npm run verify` y `npm run build`: correctos.

- 18 regresiones de historial, compatibilidad de cargas y guardado.
- 13 regresiones de minutos realizados y gráficas.
- 18 regresiones de borradores, modos y prescripción.
- 252 días de caminar/correr dentro de su presupuesto, más cuatro sustituciones de material.
- Pruebas de atribución de campañas, entrada en app, enlaces de tienda y exclusión de pruebas.
- Prueba de reintentos analíticos sin pérdida ni envíos duplicados.
- Scripts inline y JSON estructurado de las páginas principales analizados sin errores.
- `www/app.html` coincide con `app.html`. Esto prepara los recursos web de Capacitor, pero no equivale a compilar, firmar ni probar los binarios nativos.

## Verificación en navegador

Pruebas con datos ficticios en un origen local aislado:

1. Crear un plan desde el alta y abrir la bienvenida corta.
2. Registrar 73 kg × 9 repeticiones y completar una serie.
3. Volver a Hoy, recargar, reanudar y comprobar el peso, las repeticiones y la serie completada.
4. Completar la bienvenida, comprobar su guardado automático y recargar sin que vuelva el borrador.
5. Iniciar Express: tres ejercicios de dos series, seis filas en total. Completar y guardar: 6/6 y 100 %.
6. Empezar otra sesión y cambiar material desde Ajustes: el plan se actualiza y Hoy conserva Reanudar.

En la vista previa remota se ha comprobado la portada a 390 × 844, la oferta Plus, la entrada a la app y la conservación de una campaña de prueba con su CTA separado. Sin errores de consola en los recorridos comprobados.

El HTML principal de app y el script analítico coinciden con el código local desplegado. Netlify transforma los enlaces `.html` de algunas páginas de marketing en rutas limpias; su contenido y navegación se verificaron en navegador. La vista previa lleva `X-Robots-Tag: noindex`. El informe analítico devuelve 401 sin autorización; los endpoints de eventos y compras devuelven 405 ante GET.

Capturas:

- `borrador-recuperado.png`: serie de 73 kg × 9 recuperada tras recargar.
- `express-guardado.png`: sesión de seis series guardada al 100 %.
- `portada-movil.png`: portada de la vista previa en pantalla móvil.

## Pendiente antes de ampliar la publicación

- Compra sandbox y restauración en iPhone y Android físicos; esta revisión no efectuó compras.
- Compilar y probar una nueva build nativa, incluido cierre/apertura real, GPS, permisos y guardado. Cualquier envío o lanzamiento nativo posterior requiere confirmación final.
- Decidir la publicación web de esta versión comprobada. La web pública no ha cambiado.
- Tras publicar, medir primeras sesiones guardadas y regreso, sin interpretar los recuentos agregados como usuarios únicos ni atribuir una mejora de descargas que todavía no se ha medido.

La siguiente iteración de producto debería simplificar Ajustes y reforzar un único recorrido de captación. No se han añadido campañas pagadas, nuevos proveedores ni seguimiento personal.
