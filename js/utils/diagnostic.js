// Script de diagnóstico para verificar que todo funcione correctamente
console.log('🔍 Iniciando diagnóstico...');

// Función de diagnóstico
window.runDiagnostic = function() {
    console.log('═══════════════════════════════════════');
    console.log('🔍 DIAGNÓSTICO DE ENTRENOAPP');
    console.log('═══════════════════════════════════════');
    
    const results = {
        modules: {},
        containers: {},
        managers: {},
        serviceWorker: {},
        errors: []
    };
    
    // Verificar módulos cargados
    console.log('\n📦 MÓDULOS:');
    results.modules.ProgressPhotosManager = !!window.ProgressPhotosManager;
    results.modules.BodyMeasurementsManager = !!window.BodyMeasurementsManager;
    results.modules.WorkoutCalendarManager = !!window.WorkoutCalendarManager;
    
    console.log('  ProgressPhotosManager:', results.modules.ProgressPhotosManager ? '✅' : '❌');
    console.log('  BodyMeasurementsManager:', results.modules.BodyMeasurementsManager ? '✅' : '❌');
    console.log('  WorkoutCalendarManager:', results.modules.WorkoutCalendarManager ? '✅' : '❌');
    
    // Verificar contenedores en el DOM
    console.log('\n📋 CONTENEDORES DOM:');
    const photosContainer = document.getElementById('progress-photos-container');
    const measurementsContainer = document.getElementById('body-measurements-container');
    const calendarContainer = document.getElementById('workout-calendar-container');
    
    results.containers.photos = !!photosContainer;
    results.containers.measurements = !!measurementsContainer;
    results.containers.calendar = !!calendarContainer;
    
    console.log('  progress-photos-container:', results.containers.photos ? '✅' : '❌');
    console.log('  body-measurements-container:', results.containers.measurements ? '✅' : '❌');
    console.log('  workout-calendar-container:', results.containers.calendar ? '✅' : '❌');
    
    // Verificar managers instanciados
    console.log('\n👤 MANAGERS:');
    results.managers.progressPhotos = !!window.progressPhotosManager;
    results.managers.bodyMeasurements = !!window.bodyMeasurementsManager;
    results.managers.workoutCalendar = !!window.workoutCalendarManager;
    
    console.log('  progressPhotosManager:', results.managers.progressPhotos ? '✅' : '❌');
    console.log('  bodyMeasurementsManager:', results.managers.bodyMeasurements ? '✅' : '❌');
    console.log('  workoutCalendarManager:', results.managers.workoutCalendar ? '✅' : '❌');
    
    // Verificar Service Worker
    console.log('\n⚙️ SERVICE WORKER:');
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistration().then(registration => {
            if (registration) {
                results.serviceWorker.registered = true;
                results.serviceWorker.active = !!registration.active;
                results.serviceWorker.waiting = !!registration.waiting;
                console.log('  Registrado:', '✅');
                console.log('  Activo:', results.serviceWorker.active ? '✅' : '❌');
                console.log('  Esperando:', results.serviceWorker.waiting ? '⚠️' : '✅');
                
                if (registration.active) {
                    console.log('  Scope:', registration.scope);
                }
            } else {
                results.serviceWorker.registered = false;
                console.log('  Registrado:', '❌');
            }
        });
    } else {
        results.serviceWorker.supported = false;
        console.log('  Soporte:', '❌');
    }
    
    // Verificar página actual
    console.log('\n📄 PÁGINA ACTUAL:');
    const currentPage = window.appState?.currentPage || 'desconocida';
    console.log('  Página:', currentPage);
    
    // Verificar errores en consola
    console.log('\n❌ ERRORES:');
    const errorCount = results.errors.length;
    console.log('  Errores encontrados:', errorCount);
    
    // Resumen
    console.log('\n═══════════════════════════════════════');
    console.log('📊 RESUMEN:');
    const allModulesOk = Object.values(results.modules).every(v => v);
    const allContainersOk = Object.values(results.containers).every(v => v);
    const allManagersOk = Object.values(results.managers).every(v => v);
    
    console.log('  Módulos cargados:', allModulesOk ? '✅' : '❌');
    console.log('  Contenedores DOM:', allContainersOk ? '✅' : '❌');
    console.log('  Managers instanciados:', allManagersOk ? '✅' : '❌');
    
    if (!allModulesOk) {
        console.log('\n⚠️ ACCIÓN REQUERIDA:');
        console.log('  Los módulos no están cargados. Verifica que los scripts estén en app.html');
    }
    
    if (!allContainersOk && currentPage === 'progress') {
        console.log('\n⚠️ ACCIÓN REQUERIDA:');
        console.log('  Los contenedores no están en el DOM. Navega a la página de progreso primero.');
    }
    
    if (!allManagersOk && currentPage === 'progress') {
        console.log('\n⚠️ ACCIÓN REQUERIDA:');
        console.log('  Los managers no están instanciados. Intenta navegar a la página de progreso de nuevo.');
    }
    
    console.log('═══════════════════════════════════════\n');
    
    return results;
};

// Ejecutar diagnóstico automáticamente después de 2 segundos
setTimeout(() => {
    console.log('🔍 Ejecutando diagnóstico automático...');
    window.runDiagnostic();
}, 2000);

// También ejecutar cuando se carga la página de progreso
document.addEventListener('DOMContentLoaded', () => {
    // Observar cambios en la URL o en el estado de la app
    const observer = new MutationObserver(() => {
        if (window.appState?.currentPage === 'progress') {
            setTimeout(() => {
                console.log('🔍 Página de progreso detectada, ejecutando diagnóstico...');
                window.runDiagnostic();
            }, 1000);
        }
    });
    
    // Observar cambios en el DOM
    if (document.body) {
        observer.observe(document.body, { childList: true, subtree: true });
    }
});

console.log('✅ Script de diagnóstico cargado. Ejecuta window.runDiagnostic() para diagnóstico manual.');


