# Propuestas de Mejora - EntrenoApp Web y App de Planificación

**Fecha:** 15 diciembre 2025  
**Sitio:** https://entrenoapp.com  
**Alcance:** Web pública + App de planificación de entrenamientos

---

## Resumen Ejecutivo

Tras revisar la estructura completa del sitio (index, home, app, blog, legales) y la app de planificación (onboarding, dashboard, workouts, running, gym, funcional), se identifican mejoras en **navegación**, **UX de la app**, **consistencia técnica** y **conversión**. Las propuestas se priorizan por impacto y esfuerzo.

---

## 1. APP DE PLANIFICACIÓN DE ENTRENAMIENTOS

### 1.1 Navegación y Acceso

| Propuesta | Descripción | Impacto | Esfuerzo |
|-----------|-------------|---------|----------|
| **Añadir pestaña "Entrenamientos" en la barra inferior** | La barra inferior tiene: Inicio, Correr, Retos, Logros, Perfil. No hay acceso directo a la página de Entrenamientos. Usuarios con plan Gym o Funcional deben ir solo desde el botón "Comenzar entrenamiento" del dashboard. | Alto | Bajo |
| **Unificar acceso al plan desde el dashboard** | El menú del plan (⚙️) tiene: Ver detalles, Reiniciar, Pausar, Eliminar, Crear nuevo. Asegurar que "Crear nuevo plan" lleve al onboarding v2 y que sea visible desde la primera vista. | Medio | Bajo |
| **Atajo rápido: "Cambiar plan"** | Añadir un botón visible en el dashboard tipo "¿No es tu plan? Crea uno nuevo" cuando el usuario lleva pocas sesiones completadas. | Medio | Medio |

### 1.2 Gestión de Planes

| Propuesta | Descripción | Impacto | Esfuerzo |
|-----------|-------------|---------|----------|
| **Conectar Gestión de Planes con localStorage** | En `workouts.js`, `renderActivePlansList()` devuelve siempre `activePlans = []` (TODO). Debe leer el plan activo de `localStorage.getItem('entrenoapp_active_plan')` y mostrarlo correctamente en "Planes Activos". | Alto | Bajo |
| **Botones "Crear Nuevo Plan" en Gestión** | Los botones (Gym Split, Funcional Semanal, Híbrido) deberían abrir el onboarding v2 con el tipo pre-seleccionado, no rutas distintas sin implementar. | Medio | Medio |
| **Opción "Plan de Running"** | En Gestión de Planes solo hay Gym, Funcional e Híbrido. Añadir "Plan de Carrera" para coherencia con el onboarding. | Medio | Medio |

### 1.3 Onboarding

| Propuesta | Descripción | Impacto | Esfuerzo |
|-----------|-------------|---------|----------|
| **Paso previo: "Objetivo principal"** | El onboarding pregunta tipo de plan, experiencia, tiempo, frecuencia, equipamiento. Falta un paso explícito: "¿Qué es lo más importante para ti?" (Perder grasa, Ganar masa, Resistencia, etc.) para afinar planes de gym. | Medio | Medio |
| **Resumen antes de generar** | Mostrar un resumen tipo "Tu plan será: 4 días/semana, 45 min, Gimnasio, Intermedio" con opción de "Ajustar" antes de generar. Reduce abandono por planes no esperados. | Medio | Bajo |
| **Indicador de progreso** | Añadir barra de progreso (1/6, 2/6...) en el onboarding para que el usuario sepa cuántos pasos faltan. | Bajo | Bajo |

### 1.4 Dashboard

| Propuesta | Descripción | Impacto | Esfuerzo |
|-----------|-------------|---------|----------|
| **Vista "Próximos días"** | Mostrar qué toca mañana y pasado (o esta semana) además de "Hoy". Ayuda a planificar la semana. | Medio | Medio |
| **Recordatorio de racha** | Si el usuario tiene racha activa y hoy no ha entrenado, mostrar mensaje discreto: "Llevas X días seguidos. Hoy toca [entrenamiento]." | Medio | Medio |
| **Quick action: "Entreno libre"** | Permitir iniciar un entreno libre (running sin plan, o gym/CrossFit manual) sin que "toque" en el plan. Útil para días extra. | Medio | Alto |

### 1.5 Running, Gym y Funcional

| Propuesta | Descripción | Impacto | Esfuerzo |
|-----------|-------------|---------|----------|
| **Running: modo "sin plan"** | Si el usuario no tiene plan de running, permitir "Correr libre" con GPS igualmente, sin obligar a elegir un plan estructurado. | Medio | Medio |
| **Gym: pausa entre series** | Revisar que el timer de descanso sea visible y fácil de ajustar durante la sesión (algunos usuarios lo buscan arriba). | Bajo | Bajo |
| **Funcional: preview del WOD** | Antes de empezar un WOD, mostrar lista de ejercicios con reps/tiempo y duración estimada. Ya existe en parte; asegurar que siempre se muestre. | Medio | Bajo |

### 1.6 Persistencia y Sincronización

| Propuesta | Descripción | Impacto | Esfuerzo |
|-----------|-------------|---------|----------|
| **Backup del plan** | Exportar/importar el plan activo como JSON (para cambio de dispositivo o copia de seguridad). | Bajo | Medio |
| **Sincronización Firestore** | Con auth deshabilitado, todo está en localStorage. Cuando se reactive auth, asegurar migración suave de datos locales a Firestore. | Alto (futuro) | Alto |

---

## 2. WEB PÚBLICA

### 2.1 Navegación y Rutas

| Propuesta | Descripción | Impacto | Esfuerzo |
|-----------|-------------|---------|----------|
| **Unificar enlace "Inicio"** | El nav apunta a `/home.html`, que redirige a `/` (index). Considerar que el nav apunte directamente a `/` o `index.html` para claridad. | Bajo | Bajo |
| **CTA "Usar la App" más visible** | En index hay "Ver HUB", "Plan 8 Semanas", "Usar la App". El tercero tiene menos contraste. Darle más peso visual si la conversión a app es prioridad. | Medio | Bajo |
| **Enlace App en blog** | Asegurar que el blog y los artículos tengan enlace claro a la app (para captar lectores interesados). | Medio | Bajo |

### 2.2 Consistencia Técnica

| Propuesta | Descripción | Impacto | Esfuerzo |
|-----------|-------------|---------|----------|
| **Unificar google-site-verification** | `index.html` usa `pwkGx1He7UVJLHGaDJV4I9W3Zom5rGIvizK1YPWu06A` y `app.html` usa `DSyHkxyNB3t94dJbNUw_GKpCGAp4tLsK6JBeGhvhQbQ`. Deberían coincidir (Search Console puede dar problemas si hay verificaciones distintas). | Medio | Bajo |
| **Autor unificado** | Varias páginas usan "LIPA Studios" como author; about/privacy usan Motivado de la Vida. Mantener coherencia: "LIPA Studios (Motivado de la Vida)" si aplica. | Bajo | Bajo |

### 2.3 SEO y Contenido

| Propuesta | Descripción | Impacto | Esfuerzo |
|-----------|-------------|---------|----------|
| **Schema WebApplication en app.html** | Añadir SoftwareApplication/WebApplication en app.html para que Google entienda que es una app usable. | Medio | Bajo |
| **Internal links desde artículos a app** | Los artículos de running/gym deberían incluir CTA tipo "Prueba la app de planificación" con enlace a app.html. | Medio | Medio |
| **Blog: orden por fecha** | Revisar que los artículos del blog aparezcan ordenados por fecha (más recientes primero) para frescura percibida. | Bajo | Bajo |

### 2.4 Experiencia Móvil

| Propuesta | Descripción | Impacto | Esfuerzo |
|-----------|-------------|---------|----------|
| **Menú hamburguesa en móvil** | El nav principal en index/home tiene muchos enlaces. En móvil, un menú colapsable (hamburguesa) mejora la usabilidad. | Medio | Medio |
| **Touch targets** | Revisar que botones y enlaces tengan al menos 44x44px para cumplir accesibilidad en móvil. | Medio | Bajo |

---

## 3. RENDIMIENTO Y TÉCNICO

| Propuesta | Descripción | Impacto | Esfuerzo |
|-----------|-------------|---------|----------|
| **Lazy load de scripts en app** | La app carga muchos módulos (dashboard, workouts, running, profile, etc.). Considerar carga diferida de componentes que no se usan en la primera pantalla. | Medio | Alto |
| **Preload de app.html** | Desde index/home, añadir `<link rel="prefetch" href="/app.html">` para acelerar la primera visita a la app. | Bajo | Bajo |
| **Revisar dependencias CDN** | Chart.js, Leaflet, Firebase, Stripe se cargan en app.html. Asegurar que Stripe solo se cargue si hay flujo de pago activo. | Medio | Medio |

---

## 4. ACCESIBILIDAD

| Propuesta | Descripción | Impacto | Esfuerzo |
|-----------|-------------|---------|----------|
| **Contraste del disclaimer** | El disclaimer médico en la app tiene fondo amarillo suave; revisar contraste de texto para WCAG AA. | Medio | Bajo |
| **Labels en botones** | Algunos botones usan solo emojis (🏠, 🏃, etc.). Añadir `aria-label` o texto visible para lectores de pantalla. | Medio | Bajo |
| **Skip to content** | En páginas largas (index, artículos), añadir enlace "Saltar al contenido" al inicio para teclado y lectores de pantalla. | Bajo | Bajo |

---

## 5. PRIORIZACIÓN RECOMENDADA

### Inmediatas (1–2 días)
1. Conectar `renderActivePlansList()` con el plan activo en localStorage.
2. Unificar `google-site-verification` en app.html con el de index.
3. Añadir pestaña "Entrenamientos" en la barra inferior de la app (o acceso equivalente).

### Corto plazo (1–2 semanas)
4. Botones "Crear Nuevo Plan" que abran onboarding v2 con tipo pre-seleccionado.
5. Resumen antes de generar plan en onboarding.
6. CTA "Usar la App" más visible en index.
7. Enlaces a app.html desde artículos relevantes.

### Medio plazo (1 mes)
8. Vista "Próximos días" en dashboard.
9. Menú hamburguesa en navegación móvil.
10. Paso "Objetivo principal" en onboarding.

---

## 6. ARCHIVOS CLAVE AFECTADOS

| Archivo | Cambios principales |
|---------|---------------------|
| `app.html` | Nav inferior, google-site-verification |
| `js/components/workouts.js` | renderActivePlansList, botones Crear plan |
| `js/components/onboarding-v2.js` | Resumen previo, objetivo principal |
| `js/components/dashboard.js` | Próximos días, atajo cambiar plan |
| `js/app.js` | Navegación a workouts |
| `index.html` | CTA App, prefetch app.html |
| `css/styles.css` / `content-pages.css` | Nav móvil, contraste |

---

**Conclusión:** Las mejoras más impactantes y rápidas están en la **gestión de planes** (mostrar plan activo, acceso a crear nuevo) y en la **navegación de la app** (acceso directo a Entrenamientos). La web pública está sólida en contenido y legales; las mejoras son sobre todo de consistencia técnica y conversión a la app.
