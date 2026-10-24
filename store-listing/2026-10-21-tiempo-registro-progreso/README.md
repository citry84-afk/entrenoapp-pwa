# Fichas ES/EN: tiempo → registro → progreso

Preparado el 21 de octubre de 2026. **Borrador local: no cargado ni publicado en ninguna tienda.** No sustituye los registros históricos de `release-2.2-119.md` ni asigna un número a la próxima versión.

## Mensaje y público inicial

Para quien quiere una rutina de fuerza clara, dispone de un tiempo limitado y necesita registrar lo que hace. La promesa principal es: **una rutina para el tiempo y el material que tienes**. La demostración sigue un orden sencillo: plan de hoy → registro de una serie → historial/progreso.

No se anuncian resultados físicos garantizados, pérdida de peso, diagnósticos, integración con Apple Health/Health Connect, relojes, una biblioteca de vídeos propia, rutinas creadas por IA, reseñas, cifras de usuarios ni funcionalidades copiadas de las capturas de referencia de otra app.

## Archivos listos para revisar y copiar

- `app-store/es-ES.json` y `app-store/en-US.json`: nombre, subtítulo, texto promocional, palabras clave, descripción y URLs. Los valores son los textos; las claves no se copian a los campos de la consola.
- `google-play/es-ES.json` y `google-play/en-US.json`: título, descripción breve, descripción completa y URLs.
- `first-three-screenshots.md`: guion localizado de las tres primeras capturas. **No son imágenes finales**; todavía hay que capturar y exportar la build que se vaya a enviar.
- `next-release-notes.json`: novedades condicionales, con `version` y `build` a `null`. No copiar hasta validar que cada punto está incluido y probado en la build nativa enviada.
- `preview.html`: vista local del mensaje, las cuatro fichas y el guion. Tiene posiciones para capturas reales en `screenshots/01-plan.jpg`, `screenshots/02-registro.jpg` y `screenshots/03-progreso.jpg`; si faltan, muestra una indicación de captura pendiente, no una pantalla inventada. Las descripciones se cargan desde los JSON si se abre mediante un servidor local; los enlaces a los archivos funcionan también sin esa carga.
- `qa-sample-backup.json`: fixture v2 con datos completamente ficticios para un perfil de pruebas vacío. **No importar en un perfil real.**

## Uso seguro del perfil de demostración

La importación de `qa-sample-backup.json` reemplaza la rutina y el historial del perfil de destino. Usarlo únicamente en un origen/perfil de pruebas aislado y vacío, mediante el control de importar de la app. No contiene información personal, cuenta, salud, próxima sesión planificada ni borrador activo.

El fixture incluye Día A y Día B, tres ejercicios válidos de la base de la app por día y cuatro sesiones ficticias de los días 14, 16, 18 y 20 de octubre de 2026. Las seis series de progreso tienen dos puntos cada una; hay cargas que suben, se mantienen y bajan. No son resultados de personas reales ni pesos recomendados. El presupuesto del perfil es de 40 minutos; la estimación de cada sesión de ejemplo es de 24 minutos según el cálculo actual de preparación, series, descansos y transiciones.

Se ha comprobado la compatibilidad ejecutando `validateBackupPayload` y los cálculos de duración, sesiones y progreso del código real en un contexto aislado, sin escribir en almacenamiento ni importar datos en una app real. Las capturas de la interfaz y la prueba visual de `preview.html` siguen a cargo del recorrido de revisión por UI; no se han generado imágenes con este fixture mediante scripts.

## Límites comprobados

Espacios y saltos de línea incluidos. Las palabras clave se mantienen también por debajo del límite más conservador de 100 bytes UTF-8 que documenta la referencia de Apple.

| Campo | Límite | ES | EN |
| --- | ---: | ---: | ---: |
| App Store: nombre | 30 caracteres | 25 | 23 |
| App Store: subtítulo | 30 caracteres | 29 | 26 |
| App Store: texto promocional | 170 caracteres | 148 | 142 |
| App Store: palabras clave | 100 bytes | 83 | 80 |
| App Store: descripción | 4.000 caracteres | 1.419 | 1.322 |
| App Store: novedades propuestas | 4.000 caracteres | 407 | 364 |
| Google Play: título | 30 caracteres | 25 | 23 |
| Google Play: descripción breve | 80 caracteres | 66 | 75 |
| Google Play: descripción completa | 4.000 caracteres | 1.361 | 1.268 |
| Google Play: novedades propuestas | 500 caracteres | 341 | 304 |

Las palabras clave son una propuesta semántica, no el resultado de una investigación de volúmenes de búsqueda. No contienen marcas de competidores, el nombre de EntrenoApp ni términos ajenos al producto. Google Play no utiliza un campo de palabras clave equivalente: no pegar allí la lista de Apple.

### Capturas de revisión añadidas

`screenshots/01-plan.jpg`, `02-registro.jpg` y `03-progreso.jpg` muestran la interfaz web real en un perfil local aislado a partir del fixture ficticio. La segunda se registró mediante los controles de la app; la tercera usa el historial ficticio importado. Se muestran cargas que suben, se mantienen y bajan: no son resultados de usuarios ni una promesa de mejora.

Son JPEG de revisión a 387 × 838 píxeles, no capturas finales aptas para enviar a las tiendas. No se ha usado una build nativa ni se ha generado el juego inglés. `preview.html` reúne las tres imágenes con titulares propuestos y las cuatro fichas localizadas. Las novedades incorporan además la fecha opcional de la próxima sesión; siguen pendientes de una build final validada.

Comprobación repetible de límites y estado de borrador: `node scripts/test-store-listing.js`, desde la raíz del proyecto.

## Alcance real de las afirmaciones

- Rutina por objetivo, nivel, tiempo, días y material; rutina propia: configuración e interfaz de `app.html`.
- Normal/express/suave y registro de series, kg y repeticiones: recorrido de entrenamiento de `app.html`.
- Historial, volumen y cargas registradas: `sessionSummary`, `renderHistory`, `exerciseProgressSeries` y `renderProgress`.
- Empezar sin cuenta: la experiencia gratuita no exige crear cuenta. No se promete que Plus o la restauración de compras funcionen sin los requisitos de cada plataforma.
- Copia local exportable: Ajustes y `createBackupPayload`. No se anuncia sincronización automática ni que los datos estén a salvo si se desinstala la app sin exportar una copia.
- Plus opcional, adaptación y revisión de progreso: `plusBenefitsPanel` y registro de publicación `release-2.2-119.md`. No se especifican precios ni duración de prueba en los textos generales: deben mostrarse según el producto y la elegibilidad reales de la tienda.

La frase sobre almacenamiento local se refiere a los **registros de entrenamiento**, no a toda la actividad de SDKs, publicidad, pagos o analítica. Las declaraciones de privacidad y seguridad de datos de ambas tiendas deben revisarse contra los SDKs y el comportamiento de la build final, no deducirse de esta frase.

## Antes de cargar o publicar

1. Revisar el texto con la build exacta destinada a cada tienda. La 2.2 (119) ya está publicada; las mejoras recientes de recuperación, bienvenida parcial, copias completas y avisos voluntarios requieren una build posterior para llegar a las apps instaladas.
2. Validar en iPhone y Android: abrir/cerrar, reanudar sesión, guardar, exportar/importar, permiso de avisos y compra/restauración sandbox. Las pruebas web no sustituyen esta comprobación.
3. Capturar plan, registro y progreso en ambas plataformas y en ambos idiomas. Verificar todos los textos visibles en inglés; traducir la ficha por sí sola no traduce la interfaz ni los idiomas declarados por el paquete nativo.
4. Comprobar que las URLs de soporte y privacidad definitivas coinciden entre ficha, app y web, que funcionan y que el soporte ofrece un contacto real. No se han modificado enlaces en las consolas.
5. Revisar las novedades y completar versión/build con los valores reales. Eliminar cualquier punto que no entre en la versión.
6. Obtener la autorización final para subir, enviar a revisión o publicar. Este pack no realiza ninguna de esas acciones.

Las ediciones posibles de metadatos dependen del estado de la ficha y de la plataforma. La descripción de App Store se actualiza con una nueva versión; el texto promocional puede editarse por separado. No se ha iniciado ningún flujo de revisión.

## Medir después del lanzamiento

Guardar fecha, versión y captura de la ficha anterior. Revisar en cada consola y por país/idioma, donde estén disponibles, las visitas de ficha y las instalaciones. Separar este análisis de los eventos de activación de la app. Comparar periodos equivalentes y anotar campañas; un aumento o descenso con pocas visitas no demuestra por sí solo el efecto del nuevo texto.

Prioridad de aprendizaje: ¿la gente entiende la promesa?, ¿guarda un primer entrenamiento?, ¿regresa para otro? No confundir eventos agregados con usuarios únicos ni atribuir las mejoras de retención a la ficha sin datos que lo sostengan.

## Fuentes oficiales consultadas

- [Apple: nombre y subtítulo](https://developer.apple.com/help/app-store-connect/reference/app-information/app-information/).
- [Apple: descripción, texto promocional, palabras clave y novedades](https://developer.apple.com/help/app-store-connect/reference/app-information/platform-version-information/).
- [Apple: diseño de la página de producto y capturas](https://developer.apple.com/app-store/product-page/).
- [Google Play: título y descripciones](https://support.google.com/googleplay/android-developer/answer/9859152?hl=en).
- [Google Play: notas de versión](https://support.google.com/googleplay/android-developer/answer/9859348?hl=en).

Comprobación: 21 de octubre de 2026. No se incluyen estadísticas comerciales ni promesas de mejora de conversión.
