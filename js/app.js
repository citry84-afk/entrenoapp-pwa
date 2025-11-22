// EntrenoApp - Aplicación Principal (Sin autenticación para AdSense)
import { initializeEntrenoApp, appConfig } from './config/firebase-config.js';
// import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

// Importar componentes
// import './auth/auth.js'; // Deshabilitado para AdSense
import './components/dashboard.js';
import './components/workouts.js';
import './components/running.js';
import './components/challenges.js';
import './components/profile.js';

// Estado global de la aplicación
let appState = {
    currentUser: null,
    currentPage: 'dashboard',
    isOnline: navigator.onLine,
    isInitialized: false,
    language: localStorage.getItem('language') || appConfig.defaultLanguage,
    theme: localStorage.getItem('theme') || 'auto'
};

// Elementos del DOM
const loadingScreen = document.getElementById('loading-screen');
const mainContent = document.getElementById('main-content');
const bottomNav = document.getElementById('bottom-nav');
const adBanner = document.getElementById('ad-banner');

// Inicialización de la aplicación
document.addEventListener('DOMContentLoaded', async () => {
    try {
        console.log('🚀 Iniciando EntrenoApp...');
        
        // Mostrar pantalla de carga
        showLoadingScreen();
        
        // Simular usuario guest inmediatamente (antes de Firebase)
        appState.currentUser = { uid: 'guest', isGuest: true, displayName: 'Usuario' };
        
        // Configurar navegación y listeners primero (no bloquean)
        setupNavigationListeners();
        setupNetworkListeners();
        setupServiceWorkerListeners();
        setupTheme();
        
        // Inicializar Firebase en paralelo (no bloquea)
        initializeEntrenoApp().catch(err => {
            console.warn('⚠️ Firebase no disponible (modo offline):', err);
        });
        
        // Configurar banner de anuncios (no bloquea)
        setupAdBanner();
        
        // Marcar como inicializada
        appState.isInitialized = true;
        
        // Decidir primera pantalla según onboarding local (modo guest)
        const hasActivePlan = !!localStorage.getItem('entrenoapp_active_plan');
        const hasCompletedOnboarding = localStorage.getItem('entrenoapp_onboarding_complete') === 'true';

        // Rescate global: si onboarding completo pero sin plan, crear uno por defecto
        if (!hasActivePlan && hasCompletedOnboarding) {
            console.warn('⚠️ Onboarding completo pero sin plan. Creando plan por defecto (rescate global)...');
            const defaultPlan = {
                type: 'functional',
                name: 'Plan Funcional Básico',
                description: 'Plan general de fitness funcional',
                duration: 8,
                frequency: 4,
                currentWeek: 1,
                currentSession: 1,
                status: 'active',
                startDate: new Date().toISOString(),
                sessionDuration: 45,
                metadata: { generatedAt: new Date().toISOString(), basedOnOnboarding: false }
            };
            try {
                localStorage.setItem('entrenoapp_active_plan', JSON.stringify(defaultPlan));
            } catch (e) {
                console.error('❌ No se pudo escribir el plan por defecto en localStorage:', e);
            }
        }

        // Ocultar loading rápidamente
        setTimeout(() => {
            hideLoadingScreen();
            if (!hasActivePlan && !hasCompletedOnboarding) {
                navigateToPage('onboarding');
            } else {
                navigateToPage('dashboard');
            }
        }, 500); // Reducido de espera indefinida a 500ms
        
        console.log('✅ EntrenoApp inicializada correctamente (Modo Guest para AdSense)');
        
    } catch (error) {
        console.error('❌ Error inicializando la aplicación:', error);
        hideLoadingScreen();
        showErrorScreen(error);
    }
});

// Mostrar pantalla de carga
function showLoadingScreen() {
    loadingScreen.style.display = 'flex';
    mainContent.style.display = 'none';
    bottomNav.style.display = 'none';
}

// Ocultar pantalla de carga
function hideLoadingScreen() {
    loadingScreen.style.display = 'none';
    mainContent.style.display = 'block';
    bottomNav.style.display = 'flex';
}

// Mostrar pantalla de error
function showErrorScreen(error) {
    loadingScreen.innerHTML = `
        <div class="logo-container">
            <div class="logo" style="font-size: 3rem;">❌</div>
            <h1>Error al cargar</h1>
            <p style="color: rgba(255,255,255,0.8); margin: 16px 0;">
                ${error.message || 'Ha ocurrido un error inesperado'}
            </p>
            <button onclick="window.location.reload()" class="glass-button glass-button-primary">
                Reintentar
            </button>
        </div>
    `;
}

// Configurar listener de autenticación (DESHABILITADO PARA ADSENSE)
function setupAuthListener() {
    // Auth deshabilitado - todos los usuarios son "guest"
    console.log('🔐 Auth deshabilitado - Modo Guest activo para AdSense');
    return;
    
    /* CÓDIGO ORIGINAL COMENTADO
    onAuthStateChanged(auth, (user) => {
        console.log('🔐 Estado de autenticación cambió:', user ? 'autenticado' : 'no autenticado');
        
        appState.currentUser = user;
        
        if (user) {
            // Usuario autenticado
            handleUserAuthenticated(user);
        } else {
            // Usuario no autenticado
            handleUserNotAuthenticated();
        }
    });
    */
}

// Manejar usuario autenticado
async function handleUserAuthenticated(user) {
    try {
        console.log('👤 Usuario autenticado:', user.email);
        
        // Verificar si es la primera vez
        const isFirstTime = await checkIfFirstTimeUser(user);
        console.log('🔍 Es primera vez?', isFirstTime);
        
        if (isFirstTime) {
            // Mostrar onboarding
            console.log('📋 Navegando a onboarding...');
            navigateToPage('onboarding');
        } else {
            // Ir al dashboard
            console.log('🏠 Navegando a dashboard...');
            navigateToPage('dashboard');
        }
        
        hideLoadingScreen();
        
    } catch (error) {
        console.error('❌ Error manejando usuario autenticado:', error);
        showErrorScreen(error);
    }
}

// Manejar usuario no autenticado
function handleUserNotAuthenticated() {
    console.log('🔒 Usuario no autenticado, mostrando login');
    navigateToPage('auth');
    hideLoadingScreen();
}

// Verificar si es usuario nuevo
async function checkIfFirstTimeUser(user) {
    try {
        // Verificar si el usuario completó el onboarding usando la función de auth.js
        if (typeof window.checkOnboardingStatus === 'function') {
            const onboardingCompleted = await window.checkOnboardingStatus(user.uid);
            return !onboardingCompleted; // Si no completó onboarding, es primera vez
        } else {
            // Fallback: verificar si hay datos guardados en localStorage
            const savedData = localStorage.getItem('entrenoapp_onboarding');
            return !savedData; // Si no hay datos guardados, es primera vez
        }
    } catch (error) {
        console.error('❌ Error verificando usuario:', error);
        return true; // En caso de error, asumir que es primera vez para estar seguros
    }
}

// Configurar listeners de navegación
function setupNavigationListeners() {
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const page = item.dataset.page;
            navigateToPage(page);
        });
    });
}

// Navegar a una página
function navigateToPage(page) {
    console.log(`📄 Navegando a: ${page}`);
    
    // Llevar página arriba del todo
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Guardar página anterior para botón atrás
    if (appState.currentPage && appState.currentPage !== page) {
        appState.previousPage = appState.currentPage;
    }
    
    try {
        if (window.debugLogger) {
            window.debugLogger.logInfo('APP_NAVIGATE', `Navegando a ${page}`, { page });
        }
        
        // Actualizar estado
        appState.currentPage = page;
        
        // Actualizar navegación activa
        updateActiveNavItem(page);
        
        // Cargar contenido de la página
        loadPageContent(page);
        
        console.log(`✅ Navegación a ${page} completada`);
        
    } catch (error) {
        console.error(`❌ Error navegando a ${page}:`, error);
        if (window.debugLogger) {
            window.debugLogger.logError('APP_NAVIGATE_ERROR', `Error navegando a ${page}`, { page, error });
        }
    }
    
    // Registrar en analytics si está disponible
    if (window.gtag) {
        gtag('config', 'G-5XL1W8RNTP', {
            page_title: page,
            page_location: window.location.href
        });
    }
}

// Actualizar elemento de navegación activo
function updateActiveNavItem(page) {
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        item.classList.remove('active');
        if (item.dataset.page === page) {
            item.classList.add('active');
        }
    });
}

// Cargar contenido de la página
async function loadPageContent(page) {
    console.log(`📋 Cargando contenido para: ${page}`);
    
    try {
        if (window.debugLogger) {
            window.debugLogger.logInfo('APP_LOAD_CONTENT', `Cargando contenido para ${page}`, { page });
        }
        
        let content = '';
        
        switch (page) {
            case 'auth':
                content = await loadAuthPage();
                break;
            case 'onboarding':
                content = await loadOnboardingPage();
                break;
            case 'dashboard':
                content = await loadDashboardPage();
                break;
            case 'workouts':
                content = await loadWorkoutsPage();
                break;
            case 'running':
                content = await loadRunningPage();
                break;
            case 'functional-workout':
                content = await loadFunctionalWorkoutPage();
                break;
            case 'gym-workout':
                content = await loadGymWorkoutPage();
                break;
            case 'challenges':
                content = await loadChallengesPage();
                break;
            case 'profile':
                content = await loadProfilePage();
                break;
            case 'progress':
                content = await loadProgressPage();
                break;
            case 'progress-stats':
                content = '<div class="challenges-container"></div>';
                break;
            case 'interval-training':
                content = '<div class="dashboard-container"></div>';
                break;
            default:
                content = '<div class="page"><h1>Página no encontrada</h1></div>';
        }
        
        // Mostrar/ocultar navegación según la página
        const showNav = !['auth', 'onboarding'].includes(page);
        bottomNav.style.display = showNav ? 'flex' : 'none';
        
        // Insertar contenido con animación
        mainContent.style.opacity = '0';
        setTimeout(async () => {
            mainContent.innerHTML = content;
            mainContent.style.opacity = '1';
            
            // Ejecutar scripts específicos de la página
            await executePageScripts(page);
            
            // Para la página de progreso, asegurar que los componentes se inicialicen
            if (page === 'progress') {
                setTimeout(() => {
                    console.log('🔄 Verificando inicialización de componentes de progreso...');
                    console.log('ProgressPhotosManager disponible:', !!window.ProgressPhotosManager);
                    console.log('BodyMeasurementsManager disponible:', !!window.BodyMeasurementsManager);
                    console.log('WorkoutCalendarManager disponible:', !!window.WorkoutCalendarManager);
                }, 500);
            }
        }, 150);
        
    } catch (error) {
        console.error(`❌ Error cargando página ${page}:`, error);
        mainContent.innerHTML = `
            <div class="page">
                <div class="glass-card text-center">
                    <h2>Error cargando página</h2>
                    <p>${error.message}</p>
                    <button onclick="navigateToPage('dashboard')" class="glass-button glass-button-primary">
                        Volver al inicio
                    </button>
                </div>
            </div>
        `;
    }
}

// Cargar páginas específicas (stubs por ahora)
async function loadAuthPage() {
    return `
        <div class="page">
            <div class="auth-container">
                <div class="logo-container text-center mb-xl">
                    <div class="logo" style="font-size: 4rem;">💪</div>
                    <h1>EntrenoApp</h1>
                    <p class="text-secondary">Tu entrenador personal</p>
                </div>
                
                <div class="glass-card">
                    <div id="auth-content">
                        <!-- El contenido se carga desde auth.js -->
                    </div>
                </div>
            </div>
        </div>
    `;
}

async function loadOnboardingPage() {
    const html = `
        <div class="page onboarding-page">
            <div class="dashboard-container">
                <!-- El contenido se carga desde onboarding-v2.js -->
                <div class="loading-message text-center" style="padding: 2rem;">
                    <div style="font-size: 2rem;">⏳</div>
                    <p>Cargando onboarding...</p>
                </div>
            </div>
        </div>
    `;
    
    // Inicializar el componente después de que se renderice
    setTimeout(() => {
        console.log('🔍 Verificando disponibilidad de initOnboardingPage...');
        if (window.debugLogger) {
            window.debugLogger.logInfo('APP_ONBOARDING', 'Verificando initOnboardingPage');
        }
        
        if (typeof window.initOnboardingPage === 'function') {
            console.log('✅ initOnboardingPage encontrada, ejecutando...');
            if (window.debugLogger) {
                window.debugLogger.logInfo('APP_ONBOARDING', 'Ejecutando initOnboardingPage');
            }
            window.initOnboardingPage();
        } else {
            console.error('❌ Función initOnboardingPage no encontrada');
            if (window.debugLogger) {
                window.debugLogger.logError('APP_ONBOARDING', 'initOnboardingPage no disponible', {
                    windowKeys: Object.keys(window).filter(key => key.includes('init')),
                    available: typeof window.initOnboardingPage
                });
            }
        }
    }, 100);
    
    return html;
}

async function loadDashboardPage() {
    console.log('📄 Cargando página de dashboard...');
    return `
        <div class="page">
            <div class="dashboard-container">
                <!-- El contenido se carga desde dashboard.js -->
            </div>
        </div>
    `;
}

async function loadWorkoutsPage() {
    return `
        <div class="page">
            <h1 class="page-title">Entrenamientos</h1>
            <div class="workouts-container">
                <!-- El contenido se carga desde workouts.js -->
            </div>
        </div>
    `;
}

async function loadRunningPage() {
    return `
        <div class="page">
            <h1 class="page-title">Running</h1>
            <div class="running-container">
                <!-- El contenido se carga desde running.js -->
            </div>
        </div>
    `;
}

async function loadFunctionalWorkoutPage() {
    return `
        <div class="page">
            <h1 class="page-title">WOD Funcional</h1>
            <div class="dashboard-container">
                <!-- El contenido se carga desde functional-workout.js -->
            </div>
        </div>
    `;
}

async function loadGymWorkoutPage() {
    return `
        <div class="page">
            <h1 class="page-title">Gimnasio</h1>
            <div class="dashboard-container">
                <!-- El contenido se carga desde gym-workout.js -->
            </div>
        </div>
    `;
}

async function loadChallengesPage() {
    return `
        <div class="page">
            <h1 class="page-title">Retos Diarios</h1>
            <div class="challenges-container">
                <!-- El contenido se carga desde challenges.js -->
            </div>
        </div>
    `;
}

async function loadProgressPage() {
    return `
        <div class="page progress-page">
            <div class="page-header glass-effect" style="padding: 20px; margin-bottom: 20px; border-radius: 12px;">
                <h1 style="margin: 0;">📊 Mi Progreso</h1>
                <p style="margin: 10px 0 0 0; opacity: 0.8;">Sigue tu transformación paso a paso</p>
            </div>
            
            <div class="progress-tabs glass-effect" style="display: flex; gap: 10px; margin-bottom: 20px; padding: 10px; border-radius: 12px; flex-wrap: wrap;">
                <button class="tab-btn active" onclick="showProgressTab('photos')" style="flex: 1; min-width: 100px; padding: 12px; border: none; background: transparent; border-radius: 8px; cursor: pointer; transition: all 0.3s;">
                    📸 Fotos
                </button>
                <button class="tab-btn" onclick="showProgressTab('measurements')" style="flex: 1; min-width: 100px; padding: 12px; border: none; background: transparent; border-radius: 8px; cursor: pointer; transition: all 0.3s;">
                    📏 Medidas
                </button>
                <button class="tab-btn" onclick="showProgressTab('calendar')" style="flex: 1; min-width: 100px; padding: 12px; border: none; background: transparent; border-radius: 8px; cursor: pointer; transition: all 0.3s;">
                    📅 Calendario
                </button>
            </div>
            
            <div id="progress-tab-photos" class="progress-tab active" style="display: block;">
                <div id="progress-photos-container"></div>
            </div>
            
            <div id="progress-tab-measurements" class="progress-tab" style="display: none;">
                <div id="body-measurements-container"></div>
            </div>
            
            <div id="progress-tab-calendar" class="progress-tab" style="display: none;">
                <div id="workout-calendar-container"></div>
            </div>
        </div>
    `;
}

// Función para cambiar tabs
window.showProgressTab = function(tab) {
    // Ocultar todos los tabs
    document.querySelectorAll('.progress-tab').forEach(t => {
        t.style.display = 'none';
    });
    
    // Remover active de todos los botones
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
        btn.style.background = 'transparent';
    });
    
    // Mostrar tab seleccionado
    const selectedTab = document.getElementById(`progress-tab-${tab}`);
    if (selectedTab) {
        selectedTab.style.display = 'block';
    }
    
    // Activar botón
    const buttons = document.querySelectorAll('.tab-btn');
    buttons.forEach(btn => {
        if (btn.textContent.includes(tab === 'photos' ? '📸' : tab === 'measurements' ? '📏' : '📅')) {
            btn.classList.add('active');
            btn.style.background = 'rgba(102, 126, 234, 0.2)';
        }
    });
    
    // Inicializar componente si es necesario
    setTimeout(() => {
        if (tab === 'photos' && window.progressPhotosManager) {
            window.progressPhotosManager.render();
        } else if (tab === 'measurements' && window.bodyMeasurementsManager) {
            window.bodyMeasurementsManager.render();
        } else if (tab === 'calendar' && window.workoutCalendarManager) {
            window.workoutCalendarManager.render();
        }
    }, 100);
};

async function loadProfilePage() {
    // Inicializar el perfil inmediatamente
    if (window.initProfile) {
        window.initProfile();
    }
    
    return `
        <div class="page">
            <div class="profile-container">
                <!-- El contenido se carga desde profile.js -->
            </div>
        </div>
    `;
}

// Ejecutar scripts específicos de página
async function executePageScripts(page) {
    console.log(`🔧 Ejecutando scripts para página: ${page}`);
    
    switch (page) {
        case 'auth':
            console.log('🔐 Inicializando auth...');
            if (window.initAuthPage) window.initAuthPage();
            break;
        case 'dashboard':
            console.log('🏠 Inicializando dashboard...');
            if (window.initDashboard) {
                // Pequeño delay para asegurar que el DOM esté listo
                setTimeout(() => {
                    window.initDashboard();
                    console.log('✅ Dashboard inicializado');
                }, 100);
            } else {
                console.error('❌ window.initDashboard no está disponible');
                // Intentar recargar después de un segundo
                setTimeout(() => {
                    if (window.initDashboard) {
                        console.log('🔄 Reintentando inicialización del dashboard...');
                        window.initDashboard();
                    }
                }, 1000);
            }
            break;
        case 'workouts':
            if (window.initWorkouts) window.initWorkouts();
            break;
        case 'running':
            console.log('🏃‍♂️ Inicializando running...');
            if (window.debugLogger) {
                window.debugLogger.logInfo('APP_INIT_RUNNING', 'Inicializando componente running', { 
                    initRunningExists: !!window.initRunning 
                });
            }
            if (window.initRunning) {
                try {
                    console.log('✅ Ejecutando initRunning...');
                    await window.initRunning();
                    console.log('✅ Running inicializado correctamente');
                } catch (error) {
                    console.error('❌ Error en initRunning:', error);
                    if (window.debugLogger) {
                        window.debugLogger.logError('APP_INIT_RUNNING_ERROR', 'Error inicializando running', { error });
                    }
                }
            } else {
                console.error('❌ window.initRunning no está disponible');
                if (window.debugLogger) {
                    window.debugLogger.logError('APP_INIT_RUNNING_NOT_FOUND', 'initRunning no encontrado');
                }
            }
            break;
        case 'functional-workout':
            console.log('⚡ Inicializando workout funcional...');
            if (window.initFunctionalWorkout) {
                try {
                    console.log('✅ Ejecutando initFunctionalWorkout...');
                    await window.initFunctionalWorkout();
                    console.log('✅ Workout funcional inicializado correctamente');
                } catch (error) {
                    console.error('❌ Error en initFunctionalWorkout:', error);
                }
            } else {
                console.error('❌ window.initFunctionalWorkout no está disponible');
            }
            break;
        case 'gym-workout':
            console.log('🏋️‍♂️ Inicializando workout de gimnasio...');
            if (window.initGymWorkout) {
                try {
                    console.log('✅ Ejecutando initGymWorkout...');
                    await window.initGymWorkout();
                    console.log('✅ Workout de gimnasio inicializado correctamente');
                } catch (error) {
                    console.error('❌ Error en initGymWorkout:', error);
                }
            } else {
                console.error('❌ window.initGymWorkout no está disponible');
            }
            break;
        case 'challenges':
            if (window.initChallenges) window.initChallenges();
            break;
        case 'profile':
            if (window.initProfile) window.initProfile();
            break;
        case 'progress':
            console.log('📊 Inicializando página de progreso...');
            console.log('📊 Verificando módulos disponibles...');
            console.log('  ProgressPhotosManager:', !!window.ProgressPhotosManager);
            console.log('  BodyMeasurementsManager:', !!window.BodyMeasurementsManager);
            console.log('  WorkoutCalendarManager:', !!window.WorkoutCalendarManager);
            
            // Función para inicializar componentes
            const initProgressComponents = () => {
                // Crear managers si no existen
                if (!window.progressPhotosManager) {
                    if (window.ProgressPhotosManager) {
                        console.log('📸 Creando ProgressPhotosManager...');
                        try {
                            window.progressPhotosManager = new window.ProgressPhotosManager();
                            console.log('✅ ProgressPhotosManager creado');
                        } catch (error) {
                            console.error('❌ Error creando ProgressPhotosManager:', error);
                        }
                    } else {
                        console.error('❌ ProgressPhotosManager no está disponible. Verifica que el script esté cargado.');
                    }
                } else {
                    console.log('✅ ProgressPhotosManager ya existe');
                }
                
                if (!window.bodyMeasurementsManager) {
                    if (window.BodyMeasurementsManager) {
                        console.log('📏 Creando BodyMeasurementsManager...');
                        try {
                            window.bodyMeasurementsManager = new window.BodyMeasurementsManager();
                            console.log('✅ BodyMeasurementsManager creado');
                        } catch (error) {
                            console.error('❌ Error creando BodyMeasurementsManager:', error);
                        }
                    } else {
                        console.error('❌ BodyMeasurementsManager no está disponible. Verifica que el script esté cargado.');
                    }
                } else {
                    console.log('✅ BodyMeasurementsManager ya existe');
                }
                
                if (!window.workoutCalendarManager) {
                    if (window.WorkoutCalendarManager) {
                        console.log('📅 Creando WorkoutCalendarManager...');
                        try {
                            window.workoutCalendarManager = new window.WorkoutCalendarManager();
                            console.log('✅ WorkoutCalendarManager creado');
                        } catch (error) {
                            console.error('❌ Error creando WorkoutCalendarManager:', error);
                        }
                    } else {
                        console.error('❌ WorkoutCalendarManager no está disponible. Verifica que el script esté cargado.');
                    }
                } else {
                    console.log('✅ WorkoutCalendarManager ya existe');
                }
                
                // Renderizar componentes
                setTimeout(() => {
                    const photosContainer = document.getElementById('progress-photos-container');
                    const measurementsContainer = document.getElementById('body-measurements-container');
                    const calendarContainer = document.getElementById('workout-calendar-container');
                    
                    console.log('📋 Verificando contenedores DOM...');
                    console.log('  progress-photos-container:', !!photosContainer);
                    console.log('  body-measurements-container:', !!measurementsContainer);
                    console.log('  workout-calendar-container:', !!calendarContainer);
                    
                    if (window.progressPhotosManager && photosContainer) {
                        console.log('📸 Renderizando fotos...');
                        try {
                            window.progressPhotosManager.render();
                            console.log('✅ Fotos renderizadas');
                        } catch (error) {
                            console.error('❌ Error renderizando fotos:', error);
                        }
                    } else {
                        console.warn('⚠️ No se puede renderizar fotos:', {
                            manager: !!window.progressPhotosManager,
                            container: !!photosContainer
                        });
                    }
                    
                    if (window.bodyMeasurementsManager && measurementsContainer) {
                        console.log('📏 Renderizando medidas...');
                        try {
                            window.bodyMeasurementsManager.render();
                            console.log('✅ Medidas renderizadas');
                        } catch (error) {
                            console.error('❌ Error renderizando medidas:', error);
                        }
                    } else {
                        console.warn('⚠️ No se puede renderizar medidas:', {
                            manager: !!window.bodyMeasurementsManager,
                            container: !!measurementsContainer
                        });
                    }
                    
                    if (window.workoutCalendarManager && calendarContainer) {
                        console.log('📅 Renderizando calendario...');
                        try {
                            window.workoutCalendarManager.render();
                            console.log('✅ Calendario renderizado');
                        } catch (error) {
                            console.error('❌ Error renderizando calendario:', error);
                        }
                    } else {
                        console.warn('⚠️ No se puede renderizar calendario:', {
                            manager: !!window.workoutCalendarManager,
                            container: !!calendarContainer
                        });
                    }
                    
                    // Mostrar tab de fotos por defecto
                    if (typeof window.showProgressTab === 'function') {
                        window.showProgressTab('photos');
                    }
                    
                    // Ejecutar diagnóstico si está disponible
                    if (typeof window.runDiagnostic === 'function') {
                        setTimeout(() => window.runDiagnostic(), 500);
                    }
                }, 300);
            };
            
            // Intentar inicializar inmediatamente
            initProgressComponents();
            
            // Si los módulos no están disponibles, esperar un poco más
            if (!window.ProgressPhotosManager || !window.BodyMeasurementsManager || !window.WorkoutCalendarManager) {
                console.warn('⚠️ Algunos módulos no están disponibles. Esperando 500ms más...');
                setTimeout(() => {
                    initProgressComponents();
                }, 500);
            }
            break;
        case 'progress-stats':
            if (window.renderProgressStats) window.renderProgressStats();
            break;
        case 'interval-training':
            if (window.renderIntervalTraining) window.renderIntervalTraining();
            break;
        case 'onboarding':
            console.log('📋 Inicializando onboarding v2...');
            // Usar el nuevo onboarding rediseñado
            if (window.initOnboardingPage) {
                window.initOnboardingPage();
                console.log('✅ Onboarding v2 inicializado');
            } else {
                console.error('❌ window.initOnboardingPage no está disponible');
            }
            break;
    }
}

// Configurar listeners de red
function setupNetworkListeners() {
    window.addEventListener('online', () => {
        console.log('🌐 Conexión restaurada');
        appState.isOnline = true;
        showNetworkStatus('Conexión restaurada', 'success');
    });
    
    window.addEventListener('offline', () => {
        console.log('📴 Sin conexión - Modo offline');
        appState.isOnline = false;
        showNetworkStatus('Modo offline activado', 'warning');
    });
}

// Mostrar estado de red
function showNetworkStatus(message, type) {
    // Crear notificación temporal
    const notification = document.createElement('div');
    notification.className = `network-notification glass-effect ${type}`;
    notification.innerHTML = `
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    // Remover después de 3 segundos
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Configurar listeners del service worker
function setupServiceWorkerListeners() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.addEventListener('message', (event) => {
            if (event.data.type === 'CACHE_UPDATED') {
                console.log('📦 Caché actualizada');
                showNetworkStatus('Contenido actualizado', 'info');
            }
        });
    }
}

// Configurar tema
function setupTheme() {
    const theme = localStorage.getItem('theme') || 'auto';
    applyTheme(theme);
}

// Aplicar tema
function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
}

// Configurar banner de anuncios
function setupAdBanner() {
    if (!appConfig.adSettings.bannerEnabled) return;
    if (!adBanner) return;

    adBanner.style.display = 'flex';
    document.body.classList.add('has-ad-banner');

    // Asegurar contenedor de contenido
    let content = adBanner.querySelector('.ad-content');
    if (!content) {
        content = document.createElement('div');
        content.className = 'ad-content';
        adBanner.appendChild(content);
    }

    // Si no hay un <ins class="adsbygoogle"> visible, poner fallback discreto
    const hasAdsIns = adBanner.querySelector('ins.adsbygoogle');
    if (!hasAdsIns) {
        content.innerHTML = `
            <span style="font-size: 0.8rem; color: rgba(255,255,255,0.6);">
                📱 Espacio publicitario discreto
            </span>
        `;
    }
}

// Navegar hacia atrás
function navigateBack() {
    if (appState.previousPage) {
        console.log(`⬅️ Navegando hacia atrás a: ${appState.previousPage}`);
        navigateToPage(appState.previousPage);
    } else {
        console.log('🏠 No hay página anterior, navegando al dashboard');
        navigateToPage('dashboard');
    }
}

// Funciones globales
window.navigateToPage = navigateToPage;
window.navigateBack = navigateBack;
window.appState = appState;

// Compatibilidad: algunas versiones antiguas usan navigateTo
// Creamos un alias seguro para evitar errores por JS cacheado
try {
    window.navigateTo = navigateToPage;
} catch (e) {}

// Función para mantener la pantalla encendida durante entrenamientos
function keepScreenOn() {
    if ('wakeLock' in navigator) {
        navigator.wakeLock.request('screen').then((wakeLock) => {
            console.log('🔆 Pantalla mantenida encendida');
            return wakeLock;
        }).catch((error) => {
            console.log('❌ Error manteniendo pantalla encendida:', error);
        });
    }
}

// Función para liberar el bloqueo de pantalla
function releaseScreenLock(wakeLock) {
    if (wakeLock) {
        wakeLock.release().then(() => {
            console.log('🔅 Pantalla liberada');
        });
    }
}

// Exportar funciones útiles
window.keepScreenOn = keepScreenOn;
window.releaseScreenLock = releaseScreenLock;

// Función para verificar el estado de la PWA
window.checkPWAStatus = function() {
    console.log('🔍 Verificando estado de PWA...');
    
    const checks = {
        manifest: !!document.querySelector('link[rel="manifest"]'),
        serviceWorker: 'serviceWorker' in navigator,
        icons: {
            icon192: !!document.querySelector('link[href*="icon-192x192.png"]'),
            icon512: !!document.querySelector('link[href*="icon-512x512.png"]'),
            appleTouch: !!document.querySelector('link[rel="apple-touch-icon"]')
        },
        metaTags: {
            appName: !!document.querySelector('meta[name="application-name"]'),
            appleWebApp: !!document.querySelector('meta[name="apple-mobile-web-app-capable"]'),
            mobileWebApp: !!document.querySelector('meta[name="mobile-web-app-capable"]')
        },
        https: location.protocol === 'https:' || location.hostname === 'localhost'
    };
    
    console.log('📊 Estado PWA:', checks);
    
    // Verificar si se puede instalar
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then(registration => {
            console.log('✅ Service Worker registrado:', registration);
        });
    }
    
    return checks;
};

console.log('📱 EntrenoApp cargada y lista');
