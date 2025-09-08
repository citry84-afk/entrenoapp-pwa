// Sistema de autenticación para EntrenoApp
import { auth, db } from '../config/firebase-config.js';
import { 
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
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

// Estado de autenticación
let authState = {
    isLoading: false,
    currentView: 'login', // 'login', 'register', 'forgot-password'
    error: null
};

// Inicializar página de autenticación
window.initAuthPage = function() {
    console.log('🔐 Inicializando página de autenticación');
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
                
                <button 
                    id="apple-login" 
                    class="glass-button social-button apple-button btn-full"
                    ${authState.isLoading ? 'disabled' : ''}
                >
                    <span class="social-icon">🍎</span>
                    Continuar con Apple
                </button>
            </div>
            
            <div class="auth-links text-center">
                <button 
                    id="show-forgot-password" 
                    class="link-button mb-sm"
                >
                    ¿Olvidaste tu contraseña?
                </button>
                <br>
                <span class="text-secondary">¿No tienes cuenta? </span>
                <button id="show-register" class="link-button">
                    Regístrate aquí
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
                
                <button 
                    id="apple-register" 
                    class="glass-button social-button apple-button btn-full"
                    ${authState.isLoading ? 'disabled' : ''}
                >
                    <span class="social-icon">🍎</span>
                    Continuar con Apple
                </button>
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
        console.log('🔐 Intentando login con email...');
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        console.log('✅ Login exitoso:', userCredential.user.email);
        
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
        
        // Mostrar éxito y redirigir
        showSuccess('¡Bienvenido de vuelta!');
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
        console.log('🔐 Creando cuenta...');
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        
        // Actualizar perfil con el nombre
        await updateProfile(userCredential.user, { displayName: name });
        
        // Crear perfil inicial en Firestore
        await createUserProfile(userCredential.user, name);
        
        // Guardar datos del usuario en localStorage
        await saveUserToLocalStorage(userCredential.user);
        
        // Enviar verificación de email
        await sendEmailVerification(userCredential.user);
        
        console.log('✅ Cuenta creada exitosamente:', userCredential.user.email);
        
        // Mostrar mensaje y redirigir al onboarding
        showSuccess('¡Cuenta creada exitosamente! Configuremos tu perfil.');
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
        console.log('📧 Enviando email de recuperación...');
        await sendPasswordResetEmail(auth, email);
        
        showSuccess('Se ha enviado un enlace de recuperación a tu email');
        
        // Volver al login después de 3 segundos
        setTimeout(() => {
            showView('login');
        }, 3000);
        
    } catch (error) {
        console.error('❌ Error enviando email:', error);
        handleAuthError(error);
    } finally {
        setLoading(false);
    }
}

// Manejar autenticación con Google
async function handleGoogleAuth() {
    setLoading(true);
    
    try {
        console.log('🔍 Autenticación con Google...');
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;
        console.log('✅ Login con Google exitoso:', user.email);
        
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
        
    } catch (error) {
        console.error('❌ Error con Google Auth:', error);
        
        if (error.code !== 'auth/popup-closed-by-user') {
            handleAuthError(error);
        }
    } finally {
        setLoading(false);
    }
}

// Manejar autenticación con Apple (placeholder)
async function handleAppleAuth() {
    showError('Apple Sign-In estará disponible próximamente');
    
    // TODO: Implementar Apple Sign-In cuando se configure
    // const provider = new OAuthProvider('apple.com');
    // const result = await signInWithPopup(auth, provider);
}

// Cerrar sesión
export async function logout() {
    try {
        console.log('🚪 Cerrando sesión...');
        await signOut(auth);
        console.log('✅ Sesión cerrada');
    } catch (error) {
        console.error('❌ Error cerrando sesión:', error);
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
        console.log('✅ Perfil de usuario creado en Firestore');
        
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
        
        console.log('✅ Datos de usuario guardados en localStorage');
        
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
    console.log('🧹 Datos de usuario eliminados de localStorage');
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
            console.log('❌ No se encontró el perfil del usuario');
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

// Exportar funciones útiles
window.logout = logout;
window.loadUserFromLocalStorage = loadUserFromLocalStorage;
window.clearUserFromLocalStorage = clearUserFromLocalStorage;
window.getUserProfile = getUserProfile;
window.checkOnboardingStatus = checkOnboardingStatus;

console.log('🔐 Módulo de autenticación cargado');
