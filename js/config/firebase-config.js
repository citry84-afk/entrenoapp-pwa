// Configuración de Firebase para EntrenoApp (Auth deshabilitado para AdSense)
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
// import { getAuth, connectAuthEmulator } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getFirestore, connectFirestoreEmulator } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { getStorage } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js';
import { getAnalytics } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js';

// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDXy4N8vSLMYvHmet-kVPSwjkv5_QrURpo",
    authDomain: "entrenoapp-c0f30.firebaseapp.com",
    projectId: "entrenoapp-c0f30",
    storageBucket: "entrenoapp-c0f30.firebasestorage.app",
    messagingSenderId: "134508093169",
    appId: "1:134508093169:web:715058bda4f30804395350",
    measurementId: "G-5XL1W8RNTP"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar servicios (Auth deshabilitado para AdSense)
export const auth = null; // getAuth(app) - Deshabilitado para AdSense
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = getAnalytics(app);

// Configuración para desarrollo local (comentar en producción)
// if (window.location.hostname === 'localhost') {
//     connectAuthEmulator(auth, "http://localhost:9099");
//     connectFirestoreEmulator(db, 'localhost', 8080);
// }

// Configuración de Firestore
export const collections = {
    users: 'users',
    workouts: 'workouts',
    exercises: 'exercises',
    runningPlans: 'running-plans',
    crossfitWods: 'crossfit-wods',
    challenges: 'challenges',
    achievements: 'achievements',
    userProgress: 'user-progress',
    userWorkouts: 'user-workouts',
    leaderboard: 'leaderboard',
    friends: 'friends'
};

// Configuración de la app
export const appConfig = {
    name: 'EntrenoApp',
    version: '1.0.0',
    developer: 'LIPA Studios',
    supportedLanguages: ['es', 'en'],
    defaultLanguage: 'es',
    offlineDataDays: 7, // Días de datos offline
    adSettings: {
        bannerEnabled: true
    },
    tts: {
        enabled: true,
        languages: {
            es: 'es-ES',
            en: 'en-US'
        },
        rate: 1.0,
        pitch: 1.0,
        volume: 0.8
    },
    maps: {
        provider: 'OpenStreetMap',
        tileServer: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        attribution: '© OpenStreetMap contributors',
        defaultZoom: 15,
        maxZoom: 18
    },
    workout: {
        keepScreenOn: true,
        autoSaveInterval: 30000, // 30 segundos
        defaultRestTime: 60, // segundos
        maxWeightKg: 500,
        maxDistanceKm: 50,
        maxDurationMinutes: 300
    }
};

// Función para verificar la configuración
export function checkFirebaseConfig() {
    if (firebaseConfig.apiKey === "tu-api-key-aqui") {
        console.warn('⚠️ Firebase no está configurado correctamente. Usando modo demo.');
        return false;
    }
    return true;
}

// Función para inicializar la app
export async function initializeEntrenoApp() {
    try {
        console.log('🔥 Inicializando EntrenoApp...');
        
        // Verificar configuración
        const isConfigured = checkFirebaseConfig();
        
        if (isConfigured) {
            console.log('✅ Firebase configurado correctamente');
        } else {
            console.log('📱 Ejecutando en modo demo');
        }
        
        // Registrar eventos de analytics
        if (isConfigured && analytics) {
            // Evento de inicialización de la app
            // logEvent(analytics, 'app_initialized', {
            //     version: appConfig.version,
            //     platform: 'web'
            // });
        }
        
        return { app, auth, db, analytics, isConfigured };
        
    } catch (error) {
        console.error('❌ Error inicializando Firebase:', error);
        throw error;
    }
}

// Exportar la app inicializada
export default app;
export { firebaseConfig };
