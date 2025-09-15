// Sistema de autenticación para EntrenoApp
import { auth, db, firebaseConfig } from '../config/firebase-config.js';
import { 
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    signInWithRedirect,
    getRedirectResult,
    GoogleAuthProvider,
    OAuthProvider,
    signOut,
    updateProfile,
    sendPasswordResetEmail,
    sendEmailVerification
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { 
    doc, 
    setDoc, 
    getDoc,
    serverTimestamp 
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// Providers de autenticación
const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('email');
googleProvider.addScope('profile');

// Apple Sign-In provider
const appleProvider = new OAuthProvider('apple.com');
appleProvider.addScope('email');
appleProvider.addScope('name');

// Estado de autenticación
let authState = {
    isLoading: false,
    currentView: 'login', // 'login', 'register', 'forgot-password'
    error: null
};

// Inicializar página de autenticación
window.initAuthPage = async function() {
    // Verificar si ya hay un usuario autenticado
    const currentUser = auth.currentUser;
    if (currentUser) {
        console.log('Usuario ya autenticado:', currentUser.email);
        showSuccess('¡Bienvenido de vuelta!');
        window.location.href = '#dashboard';
        return;
    }
    
    // Verificar si hay un redirect result (para móviles)
    try {
        const result = await getRedirectResult(auth);
        if (result) {
            const user = result.user;
            const isNewUser = result._tokenResponse?.isNewUser || false;
            
            // Debug logging
            console.log('Redirect result encontrado:', {
                user: user ? user.email : 'No user',
                isNewUser,
                provider: result.providerId
            });
            
            // Mostrar mensaje de carga
            showSuccess('Procesando autenticación...');
            
            // Guardar datos del usuario primero
            await saveUserToLocalStorage(user);
            
            // Verificar que el usuario esté realmente autenticado
            if (auth.currentUser && auth.currentUser.uid === user.uid) {
                if (isNewUser) {
                    const displayName = user.displayName || user.email.split('@')[0];
                    await createUserProfile(user, displayName);
                    showSuccess('¡Bienvenido! Configuremos tu perfil.');
                    setTimeout(() => {
                        window.location.href = '#onboarding';
                    }, 1000);
                    return;
                } else {
                    showSuccess('¡Bienvenido de vuelta!');
                    setTimeout(() => {
                        window.location.href = '#dashboard';
                    }, 1000);
                    return;
                }
            } else {
                console.error('Usuario no autenticado después del redirect');
                showError('Error en la autenticación. Intenta de nuevo.');
            }
        } else {
            console.log('No hay redirect result');
        }
    } catch (error) {
        console.error('Error en getRedirectResult:', error);
        // Manejar errores de redirect
        if (error.code === 'auth/network-request-failed') {
            showError('Error de conexión. Verifica tu conexión a internet e intenta de nuevo.');
        } else if (error.code === 'auth/too-many-requests') {
            showError('Demasiados intentos. Espera un momento e intenta de nuevo.');
        } else if (error.code !== 'auth/popup-closed-by-user') {
            showError('Error en la autenticación. Intenta de nuevo.');
        }
    }
    
    renderAuthContent();
    setupAuthListeners();
};

// Renderizar contenido de autenticación
function renderAuthContent() {
    const authContent = document.getElementById('auth-content');
    
    if (!authContent) {
        console.error('❌ No se encontró el contenedor de autenticación');
        return;
    }
    
    let content = '';
    
    switch (authState.currentView) {
        case 'login':
            content = renderLoginForm();
            break;
        case 'register':
            content = renderRegisterForm();
            break;
        case 'forgot-password':
            content = renderForgotPasswordForm();
            break;
        default:
            content = renderLoginForm();
    }
    
    authContent.innerHTML = content;
    
    // Cargar credenciales guardadas si es la vista de login
    if (authState.currentView === 'login') {
        loadSavedCredentials();
    }
    
    setupFormListeners();
}

// Cargar credenciales guardadas
function loadSavedCredentials() {
    const savedEmail = localStorage.getItem('entrenoapp_remember_email');
    const savedPassword = localStorage.getItem('entrenoapp_remember_password');
    
    if (savedEmail && savedPassword) {
        setTimeout(() => {
            const emailInput = document.getElementById('login-email');
            const passwordInput = document.getElementById('login-password');
            const rememberCheckbox = document.getElementById('remember-me');
            
            if (emailInput) emailInput.value = savedEmail;
            if (passwordInput) passwordInput.value = atob(savedPassword);
            if (rememberCheckbox) rememberCheckbox.checked = true;
        }, 100);
    }
}

// Formulario de login
function renderLoginForm() {
    return `
        <div class="auth-form glass-fade-in">
            <h2 class="text-center mb-lg">Iniciar Sesión</h2>
            
            ${authState.error ? `
                <div class="error-message glass-card-error mb-md">
                    <span>⚠️ ${authState.error}</span>
                </div>
            ` : ''}
            
            <form id="login-form" class="auth-form-content">
                <div class="form-group">
                    <label class="form-label">Email</label>
                    <input 
                        type="email" 
                        id="login-email" 
                        class="glass-input" 
                        placeholder="tu@email.com"
                        required
                        autocomplete="email"
                    >
                </div>
                
                <div class="form-group">
                    <label class="form-label">Contraseña</label>
                    <input 
                        type="password" 
                        id="login-password" 
                        class="glass-input" 
                        placeholder="••••••••"
                        required
                        autocomplete="current-password"
                    >
                </div>
                
                <div class="form-group-checkbox mb-md">
                    <label class="checkbox-label">
                        <input type="checkbox" id="remember-me" class="checkbox-input">
                        <span class="checkbox-custom"></span>
                        <span class="checkbox-text">Recordar contraseña</span>
                    </label>
                </div>
                
                <button 
                    type="submit" 
                    class="glass-button glass-button-primary btn-full mb-md"
                    ${authState.isLoading ? 'disabled' : ''}
                >
                    ${authState.isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                </button>
            </form>
            
            <div class="auth-divider mb-md">
                <span>o continúa con</span>
            </div>
            
            <div class="social-auth mb-lg">
                <button 
                    id="google-login" 
                    class="glass-button social-button google-button btn-full mb-sm"
                    ${authState.isLoading ? 'disabled' : ''}
                >
                    <span class="social-icon">🔍</span>
                    Continuar con Google
                </button>
                
                <!-- Apple Sign-In temporalmente deshabilitado hasta configuración completa -->
                <!--
                <button 
                    id="apple-login" 
                    class="glass-button social-button apple-button btn-full"
                    ${authState.isLoading ? 'disabled' : ''}
                >
                    <span class="social-icon">🍎</span>
                    Continuar con Apple
                </button>
                -->
            </div>
            
            ${(isIOSSafari() || isChromeAndroid()) ? `
                <div class="ios-fallback text-center mt-md">
                    <p class="text-secondary mb-sm">
                        ${isIOSSafari() ? '¿Problemas con Google en Safari?' : '¿Problemas con Google en Chrome?'}
                    </p>
                    <div class="fallback-buttons">
                        <button id="force-google-redirect" class="link-button mb-sm">
                            Forzar Google (Redirect)
                        </button>
                        <br>
                        <button id="show-email-login" class="link-button">
                            Usar email y contraseña
                        </button>
                    </div>
                </div>
            ` : ''}
            
            <div class="auth-links text-center">
                <button 
                    id="show-forgot-password" 
                    class="link-button mb-sm"
                >
                    ¿Olvidaste tu contraseña?
                </button>
                <br>
                <button 
                    id="resend-verification" 
                    class="link-button mb-sm"
                >
                    Reenviar email de verificación
                </button>
                <br>
                <span class="text-secondary">¿No tienes cuenta? </span>
                <button id="show-register" class="link-button">
                    Regístrate aquí
                </button>
            </div>
            
            <div class="debug-section text-center mt-md">
                <button id="debug-firebase-btn" class="debug-btn" onclick="window.runAllTests()">
                    🔧 Debug Firebase
                </button>
            </div>
        </div>
    `;
}

// Formulario de registro
function renderRegisterForm() {
    return `
        <div class="auth-form glass-fade-in">
            <h2 class="text-center mb-lg">Crear Cuenta</h2>
            
            ${authState.error ? `
                <div class="error-message glass-card-error mb-md">
                    <span>⚠️ ${authState.error}</span>
                </div>
            ` : ''}
            
            <form id="register-form" class="auth-form-content">
                <div class="form-group">
                    <label class="form-label">Nombre</label>
                    <input 
                        type="text" 
                        id="register-name" 
                        class="glass-input" 
                        placeholder="Tu nombre"
                        required
                        autocomplete="name"
                    >
                </div>
                
                <div class="form-group">
                    <label class="form-label">Email</label>
                    <input 
                        type="email" 
                        id="register-email" 
                        class="glass-input" 
                        placeholder="tu@email.com"
                        required
                        autocomplete="email"
                    >
                </div>
                
                <div class="form-group">
                    <label class="form-label">Contraseña</label>
                    <input 
                        type="password" 
                        id="register-password" 
                        class="glass-input" 
                        placeholder="••••••••"
                        required
                        autocomplete="new-password"
                        minlength="6"
                    >
                </div>
                
                <div class="form-group">
                    <label class="form-label">Confirmar Contraseña</label>
                    <input 
                        type="password" 
                        id="register-confirm-password" 
                        class="glass-input" 
                        placeholder="••••••••"
                        required
                        autocomplete="new-password"
                        minlength="6"
                    >
                </div>
                
                <div class="form-group">
                    <label class="checkbox-container">
                        <input type="checkbox" id="accept-terms" required>
                        <span class="checkmark"></span>
                        <span class="checkbox-text">
                            Acepto los <a href="#" class="link-button">términos y condiciones</a>
                        </span>
                    </label>
                </div>
                
                <button 
                    type="submit" 
                    class="glass-button glass-button-primary btn-full mb-md"
                    ${authState.isLoading ? 'disabled' : ''}
                >
                    ${authState.isLoading ? 'Creando cuenta...' : 'Crear Cuenta'}
                </button>
            </form>
            
            <div class="auth-divider mb-md">
                <span>o continúa con</span>
            </div>
            
            <div class="social-auth mb-lg">
                <button 
                    id="google-register" 
                    class="glass-button social-button google-button btn-full mb-sm"
                    ${authState.isLoading ? 'disabled' : ''}
                >
                    <span class="social-icon">🔍</span>
                    Continuar con Google
                </button>
                
                <!-- Apple Sign-In temporalmente deshabilitado hasta configuración completa -->
                <!--
                <button 
                    id="apple-register" 
                    class="glass-button social-button apple-button btn-full"
                    ${authState.isLoading ? 'disabled' : ''}
                >
                    <span class="social-icon">🍎</span>
                    Continuar con Apple
                </button>
                -->
            </div>
            
            <div class="auth-links text-center">
                <span class="text-secondary">¿Ya tienes cuenta? </span>
                <button id="show-login" class="link-button">
                    Inicia sesión aquí
                </button>
            </div>
        </div>
    `;
}

// Formulario de recuperación de contraseña
function renderForgotPasswordForm() {
    return `
        <div class="auth-form glass-fade-in">
            <h2 class="text-center mb-lg">Recuperar Contraseña</h2>
            
            <p class="text-center text-secondary mb-lg">
                Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña
            </p>
            
            ${authState.error ? `
                <div class="error-message glass-card-error mb-md">
                    <span>⚠️ ${authState.error}</span>
                </div>
            ` : ''}
            
            <form id="forgot-password-form" class="auth-form-content">
                <div class="form-group">
                    <label class="form-label">Email</label>
                    <input 
                        type="email" 
                        id="forgot-email" 
                        class="glass-input" 
                        placeholder="tu@email.com"
                        required
                        autocomplete="email"
                    >
                </div>
                
                <button 
                    type="submit" 
                    class="glass-button glass-button-primary btn-full mb-lg"
                    ${authState.isLoading ? 'disabled' : ''}
                >
                    ${authState.isLoading ? 'Enviando...' : 'Enviar Enlace'}
                </button>
            </form>
            
            <div class="auth-links text-center">
                <button id="show-login" class="link-button">
                    ← Volver al login
                </button>
            </div>
        </div>
    `;
}

// Configurar listeners de formularios
function setupFormListeners() {
    // Login form
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Register form
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
    
    // Forgot password form
    const forgotForm = document.getElementById('forgot-password-form');
    if (forgotForm) {
        forgotForm.addEventListener('submit', handleForgotPassword);
    }
    
    // Social auth buttons
    const googleLogin = document.getElementById('google-login') || document.getElementById('google-register');
    if (googleLogin) {
        googleLogin.addEventListener('click', handleGoogleAuth);
    }
    
    const appleLogin = document.getElementById('apple-login') || document.getElementById('apple-register');
    if (appleLogin) {
        appleLogin.addEventListener('click', handleAppleAuth);
    }
    
    // Botones de fallback
    const showEmailLogin = document.getElementById('show-email-login');
    if (showEmailLogin) {
        showEmailLogin.addEventListener('click', (e) => {
            e.preventDefault();
            showView('login');
        });
    }
    
    const forceGoogleRedirect = document.getElementById('force-google-redirect');
    if (forceGoogleRedirect) {
        forceGoogleRedirect.addEventListener('click', async (e) => {
            e.preventDefault();
            setLoading(true);
            try {
                showSuccess('Forzando redirect a Google...');
                await signInWithRedirect(auth, googleProvider);
            } catch (error) {
                handleAuthError(error);
                setLoading(false);
            }
        });
    }
    
    // Botón de reenviar verificación
    const resendVerification = document.getElementById('resend-verification');
    if (resendVerification) {
        resendVerification.addEventListener('click', async (e) => {
            e.preventDefault();
            await resendVerificationEmail();
        });
    }
}

// Configurar listeners de navegación
function setupAuthListeners() {
    document.addEventListener('click', (e) => {
        const target = e.target;
        
        if (target.id === 'show-register') {
            e.preventDefault();
            showView('register');
        } else if (target.id === 'show-login') {
            e.preventDefault();
            showView('login');
        } else if (target.id === 'show-forgot-password') {
            e.preventDefault();
            showView('forgot-password');
        }
    });
}

// Mostrar vista específica
function showView(view) {
    authState.currentView = view;
    authState.error = null;
    renderAuthContent();
}

// Manejar login con email/contraseña
async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    const rememberMe = document.getElementById('remember-me')?.checked || false;
    
    if (!email || !password) {
        showError('Por favor completa todos los campos');
        return;
    }
    
    setLoading(true);
    
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        
        // Guardar credenciales si se marca recordar
        if (rememberMe) {
            localStorage.setItem('entrenoapp_remember_email', email);
            localStorage.setItem('entrenoapp_remember_password', btoa(password)); // Encoding básico
        } else {
            localStorage.removeItem('entrenoapp_remember_email');
            localStorage.removeItem('entrenoapp_remember_password');
        }
        
        // Guardar datos del usuario en localStorage
        await saveUserToLocalStorage(userCredential.user);
        
        // Verificar si el email está verificado
        if (!userCredential.user.emailVerified) {
            showSuccess('¡Bienvenido de vuelta! Recuerda verificar tu email para acceder a todas las funciones.');
        } else {
            showSuccess('¡Bienvenido de vuelta!');
        }
        
        setTimeout(() => {
            window.loadPage('dashboard');
        }, 1500);
        
    } catch (error) {
        console.error('❌ Error en login:', error);
        handleAuthError(error);
    } finally {
        setLoading(false);
    }
}

// Manejar registro con email/contraseña
async function handleRegister(e) {
    e.preventDefault();
    
    const name = document.getElementById('register-name').value.trim();
    const email = document.getElementById('register-email').value.trim();
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm-password').value;
    const acceptTerms = document.getElementById('accept-terms').checked;
    
    // Validaciones
    if (!name || !email || !password || !confirmPassword) {
        showError('Por favor completa todos los campos');
        return;
    }
    
    if (password !== confirmPassword) {
        showError('Las contraseñas no coinciden');
        return;
    }
    
    if (password.length < 6) {
        showError('La contraseña debe tener al menos 6 caracteres');
        return;
    }
    
    if (!acceptTerms) {
        showError('Debes aceptar los términos y condiciones');
        return;
    }
    
    setLoading(true);
    
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        
        // Actualizar perfil con el nombre
        await updateProfile(userCredential.user, { displayName: name });
        
        // Crear perfil inicial en Firestore
        await createUserProfile(userCredential.user, name);
        
        // Guardar datos del usuario en localStorage
        await saveUserToLocalStorage(userCredential.user);
        
        // Enviar verificación de email
        try {
            await sendEmailVerification(userCredential.user);
            showSuccess('¡Cuenta creada exitosamente! Te hemos enviado un email de verificación. Revisa tu bandeja de entrada.');
        } catch (emailError) {
            console.warn('⚠️ Error enviando email de verificación:', emailError);
            showSuccess('¡Cuenta creada exitosamente! Configuremos tu perfil.');
        }
        
        // Redirigir al onboarding
        setTimeout(() => {
            window.loadPage('onboarding');
        }, 2000);
        
    } catch (error) {
        console.error('❌ Error creando cuenta:', error);
        handleAuthError(error);
    } finally {
        setLoading(false);
    }
}

// Manejar recuperación de contraseña
async function handleForgotPassword(e) {
    e.preventDefault();
    
    const email = document.getElementById('forgot-email').value.trim();
    
    if (!email) {
        showError('Por favor ingresa tu email');
        return;
    }
    
    setLoading(true);
    
    try {
        await sendPasswordResetEmail(auth, email);
        
        showSuccess('Se ha enviado un enlace de recuperación a tu email. Revisa tu bandeja de entrada y spam.');
        
        // Volver al login después de 5 segundos
        setTimeout(() => {
            showView('login');
        }, 5000);
        
    } catch (error) {
        console.error('❌ Error enviando email de recuperación:', error);
        
        // Manejar errores específicos de email
        if (error.code === 'auth/user-not-found') {
            showError('No existe una cuenta con este email. Verifica la dirección o regístrate.');
        } else if (error.code === 'auth/invalid-email') {
            showError('Email inválido. Verifica la dirección e intenta de nuevo.');
        } else if (error.code === 'auth/too-many-requests') {
            showError('Demasiados intentos. Espera unos minutos antes de solicitar otro enlace.');
        } else {
            handleAuthError(error);
        }
    } finally {
        setLoading(false);
    }
}

// Manejar autenticación con Google
// Detectar si es iOS Safari
function isIOSSafari() {
    const ua = navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(ua);
    const isSafari = /Safari/.test(ua) && !/Chrome|CriOS|FxiOS|OPiOS|mercury/.test(ua);
    return isIOS && isSafari;
}

// Detectar si es Chrome en Android
function isChromeAndroid() {
    const ua = navigator.userAgent;
    return /Android/.test(ua) && /Chrome/.test(ua) && !/Edge|OPR|Vivaldi|Brave/.test(ua);
}

// Detectar si es navegador de Telegram
function isTelegramBrowser() {
    const ua = navigator.userAgent;
    return /TelegramBot|Telegram/i.test(ua);
}

// Detectar si es dispositivo móvil
function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// Detectar si tiene problemas con popups
function hasPopupIssues() {
    const ua = navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(ua);
    const isChromeAndroid = /Android/.test(ua) && /Chrome/.test(ua);
    // Safari de escritorio suele bloquear third-party cookies/popups en OAuth
    const isSafariDesktop = /Safari\//.test(ua) && !/Chrome|Chromium|Android|Mobile/i.test(ua);
    const isTelegram = /TelegramBot|Telegram/i.test(ua);
    
    // Telegram funciona bien con popups, otros pueden tener problemas
    return (isIOS || isChromeAndroid || isSafariDesktop) && !isTelegram;
}

async function handleGoogleAuth() {
    setLoading(true);
    
    try {
        // Verificar si el dominio está autorizado
        const authorizedDomains = [
            'entrenoapp.netlify.app',
            'localhost',
            '127.0.0.1',
            'netlify.app' // Dominio base de Netlify
        ];
        
        const currentDomain = window.location.hostname;
        
        if (!authorizedDomains.some(domain => currentDomain.includes(domain))) {
            // No lanzar error, solo advertir
        }
        
        let result;
        const isIOS = isIOSSafari();
        const isChromeAndroid = isChromeAndroid();
        const isTelegram = isTelegramBrowser();
        const hasIssues = hasPopupIssues();
        
        // Estrategia basada en el navegador
        if (isIOS) {
            // iOS Safari: usar redirect con timeout
            showSuccess('Redirigiendo a Google...');
            
            const redirectTimeout = setTimeout(() => {
                showError('La autenticación tardó demasiado. Intenta de nuevo.');
                setLoading(false);
            }, 30000);
            
            try {
                await signInWithRedirect(auth, googleProvider);
                clearTimeout(redirectTimeout);
            } catch (error) {
                clearTimeout(redirectTimeout);
                throw error;
            }
            return;
        } else if (isChromeAndroid) {
            // Chrome Android: usar redirect (más confiable que popup)
            showSuccess('Redirigiendo a Google...');
            await signInWithRedirect(auth, googleProvider);
            return;
        } else if (isTelegram) {
            // Telegram: usar popup (funciona bien)
            result = await signInWithPopup(auth, googleProvider);
        } else if (hasIssues) {
            // Otros navegadores con problemas (incluye Safari desktop): usar redirect
            showSuccess('Redirigiendo a Google...');
            await signInWithRedirect(auth, googleProvider);
            return;
        } else {
            // Desktop y navegadores sin problemas: usar popup
            result = await signInWithPopup(auth, googleProvider);
        }
        
        // Procesar resultado (solo para desktop)
        if (result) {
            const user = result.user;
            
            // Verificar si es un usuario nuevo
            const isNewUser = result._tokenResponse?.isNewUser || false;
            
            if (isNewUser) {
                // Crear perfil en Firestore para usuario nuevo
                await createUserProfile(user, user.displayName || user.email.split('@')[0]);
                
                showSuccess('¡Bienvenido! Configuremos tu perfil.');
                setTimeout(() => {
                    window.loadPage('onboarding');
                }, 1500);
            } else {
                showSuccess('¡Bienvenido de vuelta!');
                setTimeout(() => {
                    window.loadPage('dashboard');
                }, 1500);
            }
            
            // Guardar datos del usuario en localStorage
            await saveUserToLocalStorage(user);
        }
        
    } catch (error) {
        // Manejo específico de errores comunes
        if (error.code === 'auth/operation-not-allowed') {
            showError('Google Sign-In no está habilitado. Contacta al administrador.');
        } else if (error.code === 'auth/popup-blocked') {
            showError('El popup fue bloqueado. Permite popups para este sitio e intenta de nuevo.');
        } else if (error.code === 'auth/unauthorized-domain') {
            showError('Este dominio no está autorizado para Google Sign-In.');
        } else if (error.code === 'auth/network-request-failed') {
            showError('Error de conexión. Verifica tu conexión a internet e intenta de nuevo.');
        } else if (error.code === 'auth/too-many-requests') {
            showError('Demasiados intentos. Espera un momento e intenta de nuevo.');
        } else if (error.code !== 'auth/popup-closed-by-user') {
            handleAuthError(error);
        }
    } finally {
        setLoading(false);
    }
}

// Manejar autenticación con Apple
async function handleAppleAuth() {
    setLoading(true);
    
    try {
        // Verificar si el dominio está autorizado
        const authorizedDomains = [
            'entrenoapp.netlify.app',
            'localhost',
            '127.0.0.1',
            'netlify.app' // Dominio base de Netlify
        ];
        
        const currentDomain = window.location.hostname;
        
        if (!authorizedDomains.some(domain => currentDomain.includes(domain))) {
            // No lanzar error, solo advertir
        }
        
        // Verificar HTTPS (requerido para Apple Sign-In)
        if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
            throw new Error('Apple Sign-In requiere HTTPS en producción.');
        }
        
        const result = await signInWithPopup(auth, appleProvider);
        const user = result.user;
        
        // Verificar si es un usuario nuevo
        const isNewUser = result._tokenResponse?.isNewUser || false;
        
        if (isNewUser) {
            // Crear perfil en Firestore para usuario nuevo
            const displayName = user.displayName || 
                               (result._tokenResponse?.fullName ? 
                                `${result._tokenResponse.fullName.givenName || ''} ${result._tokenResponse.fullName.familyName || ''}`.trim() : 
                                user.email.split('@')[0]);
            
            await createUserProfile(user, displayName);
            
            showSuccess('¡Bienvenido! Configuremos tu perfil.');
            setTimeout(() => {
                window.loadPage('onboarding');
            }, 1500);
        } else {
            showSuccess('¡Bienvenido de vuelta!');
            setTimeout(() => {
                window.loadPage('dashboard');
            }, 1500);
        }
        
        // Guardar datos del usuario en localStorage
        await saveUserToLocalStorage(user);
        
    } catch (error) {
        // Manejo específico de errores comunes
        if (error.code === 'auth/operation-not-allowed') {
            showError('Apple Sign-In no está habilitado. Contacta al administrador.');
        } else if (error.code === 'auth/popup-blocked') {
            showError('El popup fue bloqueado. Permite popups para este sitio e intenta de nuevo.');
        } else if (error.code === 'auth/unauthorized-domain') {
            showError('Este dominio no está autorizado para Apple Sign-In.');
        } else if (error.message.includes('HTTPS')) {
            showError('Apple Sign-In requiere HTTPS en producción.');
        } else if (error.code !== 'auth/popup-closed-by-user') {
            handleAuthError(error);
        }
    } finally {
        setLoading(false);
    }
}

// Reenviar email de verificación
async function resendVerificationEmail() {
    const user = auth.currentUser;
    if (!user) {
        showError('No hay usuario autenticado');
        return;
    }
    
    if (user.emailVerified) {
        showError('Tu email ya está verificado');
        return;
    }
    
    setLoading(true);
    
    try {
        await sendEmailVerification(user);
        showSuccess('Email de verificación reenviado. Revisa tu bandeja de entrada y spam.');
    } catch (error) {
        console.error('❌ Error reenviando email:', error);
        handleAuthError(error);
    } finally {
        setLoading(false);
    }
}

// Cerrar sesión
export async function logout() {
    try {
        
        // Cerrar sesión en Firebase
        await signOut(auth);
        
        // Limpiar localStorage
        clearUserFromLocalStorage();
        
        // Limpiar estado de la aplicación
        localStorage.removeItem('entrenoapp_active_plan');
        localStorage.removeItem('entrenoapp_onboarding');
        localStorage.removeItem('entrenoapp_remember_email');
        localStorage.removeItem('entrenoapp_remember_password');
        
        
        // Redirigir a la página de login
        window.loadPage('auth');
        
    } catch (error) {
        console.error('❌ Error cerrando sesión:', error);
        // Aún así, limpiar datos locales
        clearUserFromLocalStorage();
        window.loadPage('auth');
    }
}

// Manejar errores de autenticación
function handleAuthError(error) {
    let message = 'Ha ocurrido un error inesperado';
    
    switch (error.code) {
        case 'auth/user-not-found':
            message = 'No existe una cuenta con este email';
            break;
        case 'auth/wrong-password':
            message = 'Contraseña incorrecta';
            break;
        case 'auth/email-already-in-use':
            message = 'Ya existe una cuenta con este email';
            break;
        case 'auth/weak-password':
            message = 'La contraseña es muy débil';
            break;
        case 'auth/invalid-email':
            message = 'Email inválido';
            break;
        case 'auth/too-many-requests':
            message = 'Demasiados intentos. Intenta más tarde';
            break;
        case 'auth/network-request-failed':
            message = 'Error de conexión. Verifica tu internet';
            break;
        case 'auth/popup-closed-by-user':
            message = 'Autenticación cancelada';
            break;
        case 'auth/popup-blocked':
            message = 'El popup fue bloqueado. Permite popups para este sitio';
            break;
        case 'auth/operation-not-allowed':
            message = 'Este método de autenticación no está habilitado';
            break;
        case 'auth/account-exists-with-different-credential':
            message = 'Ya existe una cuenta con este email usando otro método';
            break;
        case 'auth/invalid-credential':
            message = 'Credenciales inválidas';
            break;
        case 'auth/user-disabled':
            message = 'Esta cuenta ha sido deshabilitada';
            break;
        case 'auth/requires-recent-login':
            message = 'Por seguridad, inicia sesión nuevamente';
            break;
        case 'auth/too-many-requests':
            message = 'Demasiados intentos. Espera un momento e intenta de nuevo';
            break;
        case 'auth/invalid-action-code':
            message = 'El enlace de recuperación no es válido o ha expirado';
            break;
        case 'auth/expired-action-code':
            message = 'El enlace de recuperación ha expirado. Solicita uno nuevo';
            break;
        case 'auth/user-disabled':
            message = 'Esta cuenta ha sido deshabilitada. Contacta al soporte';
            break;
        case 'auth/email-already-in-use':
            message = 'Ya existe una cuenta con este email. Intenta iniciar sesión';
            break;
        case 'auth/operation-not-allowed':
            message = 'Esta operación no está permitida. Contacta al administrador';
            break;
        case 'auth/network-request-failed':
            message = 'Error de conexión. Verifica tu internet e intenta de nuevo';
            break;
        default:
            console.error('Error code:', error.code);
            message = error.message || message;
    }
    
    showError(message);
}

// Mostrar error
function showError(message) {
    authState.error = message;
    renderAuthContent();
    
    // Auto-limpiar error después de 5 segundos
    setTimeout(() => {
        if (authState.error === message) {
            authState.error = null;
            renderAuthContent();
        }
    }, 5000);
}

// Mostrar éxito
function showSuccess(message) {
    authState.error = null;
    
    // Crear notificación de éxito
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message glass-card-success';
    successDiv.innerHTML = `<span>✅ ${message}</span>`;
    
    const authContent = document.getElementById('auth-content');
    authContent.insertBefore(successDiv, authContent.firstChild);
    
    // Remover después de 5 segundos
    setTimeout(() => {
        successDiv.remove();
    }, 5000);
}

// Establecer estado de carga
function setLoading(loading) {
    authState.isLoading = loading;
    renderAuthContent();
}

// ===============================
// FUNCIONES AUXILIARES
// ===============================

// Crear perfil de usuario en Firestore
async function createUserProfile(user, displayName) {
    try {
        const userDoc = doc(db, 'users', user.uid);
        
        const userData = {
            uid: user.uid,
            email: user.email,
            displayName: displayName || user.displayName || user.email.split('@')[0],
            photoURL: user.photoURL || null,
            username: generateUsername(displayName || user.email),
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            
            // Configuraciones iniciales
            preferences: {
                language: 'es',
                units: 'metric', // metric, imperial
                notifications: {
                    workouts: true,
                    challenges: true,
                    social: true,
                    achievements: true
                },
                privacy: {
                    showProfile: true,
                    showWorkouts: true,
                    showAchievements: true
                }
            },
            
            // Estadísticas iniciales
            stats: {
                totalWorkouts: 0,
                totalDistance: 0, // en km
                totalTime: 0, // en minutos
                challengesCompleted: 0,
                currentStreak: 0,
                longestStreak: 0,
                level: 1,
                experience: 0
            },
            
            // Estado de onboarding
            onboarding: {
                completed: false,
                currentStep: 0
            }
        };
        
        await setDoc(userDoc, userData);
        
        return userData;
        
    } catch (error) {
        console.error('❌ Error creando perfil de usuario:', error);
        throw error;
    }
}

// Guardar datos del usuario en localStorage
async function saveUserToLocalStorage(user) {
    try {
        const userData = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            emailVerified: user.emailVerified,
            lastLoginAt: new Date().toISOString()
        };
        
        localStorage.setItem('entrenoapp_user', JSON.stringify(userData));
        localStorage.setItem('entrenoapp_auth_token', await user.getIdToken());
        
        
    } catch (error) {
        console.error('❌ Error guardando en localStorage:', error);
    }
}

// Generar username único
function generateUsername(name) {
    if (!name) return `user_${Date.now()}`;
    
    // Limpiar el nombre
    const cleanName = name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '')
        .substring(0, 15);
    
    // Agregar números aleatorios para unicidad
    const randomSuffix = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
    
    return `${cleanName}_${randomSuffix}`;
}

// Cargar datos del usuario desde localStorage
export function loadUserFromLocalStorage() {
    try {
        const userData = localStorage.getItem('entrenoapp_user');
        return userData ? JSON.parse(userData) : null;
    } catch (error) {
        console.error('❌ Error cargando usuario desde localStorage:', error);
        return null;
    }
}

// Limpiar datos de localStorage
export function clearUserFromLocalStorage() {
    localStorage.removeItem('entrenoapp_user');
    localStorage.removeItem('entrenoapp_auth_token');
    localStorage.removeItem('entrenoapp_onboarding');
}

// Obtener datos del perfil desde Firestore
export async function getUserProfile(uid) {
    try {
        if (!uid) return null;
        
        const userDoc = doc(db, 'users', uid);
        const docSnap = await getDoc(userDoc);
        
        if (docSnap.exists()) {
            return docSnap.data();
        } else {
            return null;
        }
        
    } catch (error) {
        console.error('❌ Error obteniendo perfil de usuario:', error);
        return null;
    }
}

// Verificar si el usuario completó el onboarding
export async function checkOnboardingStatus(uid) {
    try {
        const profile = await getUserProfile(uid);
        return profile?.onboarding?.completed || false;
    } catch (error) {
        console.error('❌ Error verificando onboarding:', error);
        return false;
    }
}

// Verificar configuración de providers
window.checkAuthProviders = function() {
    // Verificar dominios autorizados
    const authorizedDomains = [
        'entrenoapp.netlify.app',
        'localhost',
        '127.0.0.1'
    ];
    
    const currentDomain = window.location.hostname;
    const isDomainAuthorized = authorizedDomains.some(domain => currentDomain.includes(domain));
    
    return {
        google: !!googleProvider,
        apple: !!appleProvider,
        auth: !!auth,
        https: window.location.protocol === 'https:' || window.location.hostname === 'localhost',
        domainAuthorized: isDomainAuthorized,
        currentDomain: currentDomain
    };
};

// Función para probar autenticación
window.testAuth = async function(provider = 'google') {
    try {
        if (provider === 'google') {
            await handleGoogleAuth();
        } else if (provider === 'apple') {
            await handleAppleAuth();
        }
    } catch (error) {
        // Error silencioso para testing
    }
};

// Función de debug para navegadores móviles
window.debugMobileAuth = function() {
    const isIOS = isIOSSafari();
    const isChromeAndroid = isChromeAndroid();
    const isTelegram = isTelegramBrowser();
    const isMobile = isMobileDevice();
    const hasIssues = hasPopupIssues();
    const userAgent = navigator.userAgent;
    const currentDomain = window.location.hostname;
    
    console.log('=== DEBUG MOBILE AUTH ===');
    console.log('Es iOS Safari:', isIOS);
    console.log('Es Chrome Android:', isChromeAndroid);
    console.log('Es Telegram Browser:', isTelegram);
    console.log('Es móvil:', isMobile);
    console.log('Tiene problemas con popups:', hasIssues);
    console.log('User Agent:', userAgent);
    console.log('Dominio actual:', currentDomain);
    console.log('Protocolo:', window.location.protocol);
    console.log('HTTPS:', window.location.protocol === 'https:');
    console.log('========================');
    
    return {
        isIOS,
        isChromeAndroid,
        isTelegram,
        isMobile,
        hasIssues,
        userAgent,
        currentDomain,
        protocol: window.location.protocol,
        isHTTPS: window.location.protocol === 'https:'
    };
};

// Función de debug para redirect
window.debugRedirectAuth = async function() {
    try {
        const result = await getRedirectResult(auth);
        console.log('=== DEBUG REDIRECT AUTH ===');
        console.log('Redirect result:', result);
        if (result) {
            console.log('User:', result.user);
            console.log('Provider:', result.providerId);
            console.log('Is New User:', result._tokenResponse?.isNewUser);
        } else {
            console.log('No redirect result found');
        }
        console.log('========================');
        return result;
    } catch (error) {
        console.error('Error en debug redirect:', error);
        return null;
    }
};

// Verificar estado del email
function checkEmailVerificationStatus() {
    const user = auth.currentUser;
    if (!user) return false;
    
    return user.emailVerified;
}

// Actualizar estado del email
function updateEmailVerificationStatus() {
    const user = auth.currentUser;
    if (!user) return;
    
    // Recargar el usuario para obtener el estado actualizado
    user.reload().then(() => {
        if (user.emailVerified) {
            console.log('✅ Email verificado');
        } else {
            console.log('⚠️ Email no verificado');
        }
    }).catch(error => {
        console.error('❌ Error recargando usuario:', error);
    });
}

// Función de debug para Firebase
window.debugFirebaseAuth = function() {
    const user = auth.currentUser;
    const debugInfo = {
        user: user,
        emailVerified: user?.emailVerified,
        provider: user?.providerData?.[0]?.providerId,
        config: firebaseConfig,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent
    };
    
    console.log('=== DEBUG FIREBASE AUTH ===');
    console.log('🕐 Timestamp:', debugInfo.timestamp);
    console.log('🌐 URL:', debugInfo.url);
    console.log('👤 Usuario actual:', user);
    console.log('✅ Email verificado:', user?.emailVerified);
    console.log('🔐 Proveedor:', user?.providerData);
    console.log('⚙️ Configuración Firebase:', {
        apiKey: firebaseConfig?.apiKey?.substring(0, 10) + '...',
        authDomain: firebaseConfig?.authDomain,
        projectId: firebaseConfig?.projectId,
        storageBucket: firebaseConfig?.storageBucket
    });
    console.log('========================');
    
    // Mostrar en pantalla también
    const debugDiv = document.getElementById('firebase-debug') || createDebugDiv();
    debugDiv.innerHTML = `
        <h3>🔧 Debug Firebase Auth</h3>
        <p><strong>Usuario:</strong> ${user ? user.email : 'No autenticado'}</p>
        <p><strong>Email verificado:</strong> ${user?.emailVerified ? '✅ Sí' : '❌ No'}</p>
        <p><strong>Proveedor:</strong> ${user?.providerData?.[0]?.providerId || 'N/A'}</p>
        <p><strong>Proyecto:</strong> ${firebaseConfig?.projectId}</p>
        <p><strong>Dominio:</strong> ${firebaseConfig?.authDomain}</p>
    `;
    
    return debugInfo;
};

// Crear div de debug si no existe
function createDebugDiv() {
    const debugDiv = document.createElement('div');
    debugDiv.id = 'firebase-debug';
    debugDiv.style.cssText = `
        position: fixed;
        top: 10px;
        right: 10px;
        background: rgba(0,0,0,0.8);
        color: white;
        padding: 15px;
        border-radius: 8px;
        font-family: monospace;
        font-size: 12px;
        z-index: 10000;
        max-width: 300px;
        border: 2px solid #00ff00;
    `;
    document.body.appendChild(debugDiv);
    return debugDiv;
}

// Función para probar envío de email
window.testEmailSending = async function() {
    const user = auth.currentUser;
    if (!user) {
        showError('No hay usuario autenticado');
        return;
    }
    
    try {
        console.log('📧 Probando envío de email de verificación...');
        console.log('👤 Usuario:', user.email);
        console.log('✅ Email verificado:', user.emailVerified);
        
        // Mostrar loading
        const loadingDiv = document.getElementById('email-test-loading') || createLoadingDiv();
        loadingDiv.style.display = 'block';
        loadingDiv.innerHTML = '📧 Enviando email de verificación...';
        
        await sendEmailVerification(user);
        
        console.log('✅ Email enviado exitosamente');
        showSuccess('✅ Email de verificación enviado exitosamente. Revisa tu bandeja de entrada y spam.');
        
        // Ocultar loading
        loadingDiv.style.display = 'none';
        
        // Actualizar estado del usuario
        await user.reload();
        console.log('🔄 Usuario recargado. Email verificado:', user.emailVerified);
        
    } catch (error) {
        console.error('❌ Error enviando email de prueba:', error);
        
        // Ocultar loading
        const loadingDiv = document.getElementById('email-test-loading');
        if (loadingDiv) loadingDiv.style.display = 'none';
        
        // Mostrar error específico
        let errorMessage = 'Error enviando email: ' + error.message;
        
        if (error.code === 'auth/operation-not-allowed') {
            errorMessage = '❌ Email/Password no está habilitado en Firebase Console';
        } else if (error.code === 'auth/unauthorized-domain') {
            errorMessage = '❌ Dominio no autorizado. Agrega ' + window.location.hostname + ' a dominios autorizados';
        } else if (error.code === 'auth/too-many-requests') {
            errorMessage = '❌ Demasiados intentos. Espera unos minutos antes de intentar de nuevo';
        }
        
        showError(errorMessage);
        
        // Mostrar en consola para debug
        console.log('🔍 Código de error:', error.code);
        console.log('🔍 Mensaje completo:', error.message);
    }
};

// Crear div de loading para pruebas
function createLoadingDiv() {
    const loadingDiv = document.createElement('div');
    loadingDiv.id = 'email-test-loading';
    loadingDiv.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0,0,0,0.9);
        color: white;
        padding: 20px;
        border-radius: 8px;
        font-family: monospace;
        font-size: 14px;
        z-index: 10001;
        border: 2px solid #ffaa00;
        display: none;
    `;
    document.body.appendChild(loadingDiv);
    return loadingDiv;
}

// Función para verificar configuración de Firebase
window.checkFirebaseConfig = function() {
    const config = firebaseConfig;
    const debugInfo = {
        apiKey: config?.apiKey ? '✅ Configurado' : '❌ Faltante',
        authDomain: config?.authDomain ? '✅ Configurado' : '❌ Faltante',
        projectId: config?.projectId ? '✅ Configurado' : '❌ Faltante',
        storageBucket: config?.storageBucket ? '✅ Configurado' : '❌ Faltante',
        messagingSenderId: config?.messagingSenderId ? '✅ Configurado' : '❌ Faltante',
        appId: config?.appId ? '✅ Configurado' : '❌ Faltante'
    };
    
    console.log('=== VERIFICACIÓN DE CONFIGURACIÓN FIREBASE ===');
    console.log('🔑 API Key:', debugInfo.apiKey);
    console.log('🌐 Auth Domain:', debugInfo.authDomain);
    console.log('📁 Project ID:', debugInfo.projectId);
    console.log('💾 Storage Bucket:', debugInfo.storageBucket);
    console.log('📱 Messaging Sender ID:', debugInfo.messagingSenderId);
    console.log('🆔 App ID:', debugInfo.appId);
    console.log('===============================================');
    
    // Mostrar en pantalla
    const configDiv = document.getElementById('firebase-config-check') || createConfigDiv();
    configDiv.innerHTML = `
        <h3>⚙️ Verificación Firebase</h3>
        <p><strong>API Key:</strong> ${debugInfo.apiKey}</p>
        <p><strong>Auth Domain:</strong> ${debugInfo.authDomain}</p>
        <p><strong>Project ID:</strong> ${debugInfo.projectId}</p>
        <p><strong>Storage Bucket:</strong> ${debugInfo.storageBucket}</p>
        <p><strong>Messaging Sender ID:</strong> ${debugInfo.messagingSenderId}</p>
        <p><strong>App ID:</strong> ${debugInfo.appId}</p>
    `;
    
    return debugInfo;
};

// Crear div de configuración
function createConfigDiv() {
    const configDiv = document.createElement('div');
    configDiv.id = 'firebase-config-check';
    configDiv.style.cssText = `
        position: fixed;
        top: 10px;
        left: 10px;
        background: rgba(0,0,0,0.8);
        color: white;
        padding: 15px;
        border-radius: 8px;
        font-family: monospace;
        font-size: 12px;
        z-index: 10000;
        max-width: 300px;
        border: 2px solid #0066ff;
    `;
    document.body.appendChild(configDiv);
    return configDiv;
}

// Función para ejecutar todas las pruebas
window.runAllTests = function() {
    console.log('🧪 Ejecutando todas las pruebas de Firebase...');
    
    // 1. Verificar configuración
    window.checkFirebaseConfig();
    
    // 2. Debug de autenticación
    window.debugFirebaseAuth();
    
    // 3. Probar envío de email (si hay usuario)
    if (auth.currentUser) {
        window.testEmailSending();
    } else {
        console.log('⚠️ No hay usuario autenticado para probar emails');
    }
    
    console.log('✅ Pruebas completadas. Revisa los resultados arriba.');
};

// Exportar funciones útiles
window.logout = logout;
window.loadUserFromLocalStorage = loadUserFromLocalStorage;
window.clearUserFromLocalStorage = clearUserFromLocalStorage;
window.getUserProfile = getUserProfile;
window.checkOnboardingStatus = checkOnboardingStatus;
window.checkEmailVerificationStatus = checkEmailVerificationStatus;
window.updateEmailVerificationStatus = updateEmailVerificationStatus;
window.resendVerificationEmail = resendVerificationEmail;

