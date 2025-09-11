// EntrenoApp - Aplicación Principal
import { initializeEntrenoApp, auth, appConfig } from './config/firebase-config.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

// Importar componentes
import './auth/auth.js';
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
        
        // Inicializar Firebase
        await initializeEntrenoApp();
        
        // Configurar listeners
        setupAuthListener();
        setupNavigationListeners();
        setupNetworkListeners();
        setupServiceWorkerListeners();
        
        // Configurar tema
        setupTheme();
        
        // Configurar banner de anuncios
        setupAdBanner();
        
        // Marcar como inicializada
        appState.isInitialized = true;
        
        console.log('✅ EntrenoApp inicializada correctamente');
        
    } catch (error) {
        console.error('❌ Error inicializando la aplicación:', error);
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

// Configurar listener de autenticación
function setupAuthListener() {
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

async function loadProfilePage() {
    return `
        <div class="page">
            <h1 class="page-title">Perfil</h1>
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
    if (appConfig.adSettings.bannerEnabled) {
        adBanner.style.display = 'flex';
        document.body.classList.add('has-ad-banner');
        
        // Simular contenido de anuncio
        adBanner.querySelector('.ad-content').innerHTML = `
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

console.log('📱 EntrenoApp cargada y lista');
