// Sistema de Text-to-Speech (TTS) para EntrenoApp
import { appConfig } from '../config/firebase-config.js';

// Estado del sistema TTS
let ttsState = {
    isEnabled: true,
    volume: 0.8,
    rate: 1.0,
    pitch: 1.0,
    language: 'es-ES',
    userName: 'Usuario',
    isPlaying: false,
    queue: [],
    lastAnnouncement: 0,
    announcementInterval: 60000, // 1 minuto por defecto
    workoutCoaching: {
        enabled: true,
        restReminders: true,
        motivationalMessages: true,
        formTips: true,
        progressUpdates: true
    },
    runningCoaching: {
        enabled: true,
        distanceUpdates: true,
        paceAlerts: true,
        motivationalBoosts: true,
        intervalCoaching: true
    }
};

// Frases motivacionales
const motivationalPhrases = {
    es: {
        workout: [
            "¡Excelente trabajo!",
            "¡Sigue así!",
            "¡Tú puedes!",
            "¡Eres imparable!",
            "¡Cada repetición cuenta!",
            "¡Forma perfecta!",
            "¡Vamos, una más!",
            "¡Increíble esfuerzo!",
            "¡No te rindas!",
            "¡Lo estás haciendo genial!"
        ],
        running: [
            "¡Ritmo perfecto!",
            "¡Sigue corriendo!",
            "¡Un paso más!",
            "¡Eres una máquina!",
            "¡Mantén el ritmo!",
            "¡Casi llegamos!",
            "¡Increíble resistencia!",
            "¡Vamos, campeón!",
            "¡No pares ahora!",
            "¡Tu mejor versión!"
        ],
        challenges: [
            "¡Reto aceptado!",
            "¡Vas súper bien!",
            "¡Imparable!",
            "¡Sigue adelante!",
            "¡Casi lo tienes!",
            "¡Último esfuerzo!",
            "¡Eres increíble!",
            "¡A por todas!",
            "¡No hay límites!",
            "¡Misión cumplida!"
        ]
    },
    en: {
        workout: [
            "Great job!",
            "Keep it up!",
            "You can do it!",
            "You're unstoppable!",
            "Every rep counts!",
            "Perfect form!",
            "Come on, one more!",
            "Amazing effort!",
            "Don't give up!",
            "You're doing great!"
        ],
        running: [
            "Perfect pace!",
            "Keep running!",
            "One more step!",
            "You're a machine!",
            "Maintain the pace!",
            "Almost there!",
            "Incredible endurance!",
            "Come on, champion!",
            "Don't stop now!",
            "Your best version!"
        ],
        challenges: [
            "Challenge accepted!",
            "You're doing great!",
            "Unstoppable!",
            "Keep going!",
            "Almost got it!",
            "Final push!",
            "You're incredible!",
            "Go for it!",
            "No limits!",
            "Mission accomplished!"
        ]
    }
};

// Inicializar sistema TTS
export function initializeTTS() {
    console.log('🎵 Inicializando sistema TTS');
    
    // Cargar configuración guardada
    loadTTSSettings();
    
    // Verificar compatibilidad
    if (!('speechSynthesis' in window)) {
        console.warn('⚠️ TTS no soportado en este navegador');
        ttsState.isEnabled = false;
        return false;
    }
    
    // Configurar idioma basado en la configuración
    setLanguage(ttsState.language);
    
    // Obtener nombre del usuario
    updateUserName();
    
    console.log('✅ Sistema TTS inicializado');
    return true;
}

// Cargar configuración TTS
function loadTTSSettings() {
    try {
        const savedSettings = localStorage.getItem('entrenoapp_tts_settings');
        if (savedSettings) {
            const settings = JSON.parse(savedSettings);
            ttsState = { ...ttsState, ...settings };
        }
    } catch (error) {
        console.error('Error cargando configuración TTS:', error);
    }
}

// Guardar configuración TTS
function saveTTSSettings() {
    try {
        localStorage.setItem('entrenoapp_tts_settings', JSON.stringify(ttsState));
    } catch (error) {
        console.error('Error guardando configuración TTS:', error);
    }
}

// Actualizar nombre del usuario
function updateUserName() {
    // Intentar obtener el nombre del usuario autenticado
    if (window.auth?.currentUser) {
        const user = window.auth.currentUser;
        ttsState.userName = user.displayName?.split(' ')[0] || 
                           user.email?.split('@')[0] || 
                           'Usuario';
    }
}

// Configurar idioma
export function setLanguage(language) {
    ttsState.language = language;
    saveTTSSettings();
}

// Función principal para hablar
export function speak(text, options = {}) {
    if (!ttsState.isEnabled || !('speechSynthesis' in window)) {
        return Promise.resolve();
    }
    
    return new Promise((resolve, reject) => {
        // Detener cualquier síntesis en curso si es necesario
        if (options.interrupt || speechSynthesis.speaking) {
            speechSynthesis.cancel();
        }
        
        const utterance = new SpeechSynthesisUtterance(text);
        
        // Configurar voz
        utterance.lang = options.language || ttsState.language;
        utterance.volume = options.volume !== undefined ? options.volume : ttsState.volume;
        utterance.rate = options.rate !== undefined ? options.rate : ttsState.rate;
        utterance.pitch = options.pitch !== undefined ? options.pitch : ttsState.pitch;
        
        // Eventos
        utterance.onstart = () => {
            ttsState.isPlaying = true;
            console.log('🎵 TTS iniciado:', text);
        };
        
        utterance.onend = () => {
            ttsState.isPlaying = false;
            console.log('🎵 TTS terminado');
            resolve();
        };
        
        utterance.onerror = (error) => {
            ttsState.isPlaying = false;
            console.error('❌ Error TTS:', error);
            reject(error);
        };
        
        // Reproducir
        speechSynthesis.speak(utterance);
    });
}

// === FUNCIONES DE COACHING ESPECÍFICAS ===

// Coaching para entrenamientos
export function announceWorkoutStart(workoutName) {
    if (!ttsState.workoutCoaching.enabled) return;
    
    const message = `¡Hola ${ttsState.userName}! Vamos a empezar con ${workoutName}. ¡Dale todo lo que tienes!`;
    speak(message);
}

export function announceExerciseStart(exerciseName, sets, reps) {
    if (!ttsState.workoutCoaching.enabled) return;
    
    const message = `Siguiente ejercicio: ${exerciseName}. ${sets} series de ${reps} repeticiones. ¡Vamos!`;
    speak(message);
}

export function announceRestPeriod(seconds) {
    if (!ttsState.workoutCoaching.restReminders) return;
    
    const message = `Descanso de ${seconds} segundos. Respira profundo y prepárate para la siguiente serie.`;
    speak(message);
}

export function announceRestWarning(seconds) {
    if (!ttsState.workoutCoaching.restReminders) return;
    
    const message = `${seconds} segundos para continuar. ¡Prepárate!`;
    speak(message);
}

export function announceSetComplete(setNumber, totalSets) {
    if (!ttsState.workoutCoaching.progressUpdates) return;
    
    const remaining = totalSets - setNumber;
    let message;
    
    if (remaining === 0) {
        message = `¡Serie completada! ¡Ejercicio terminado! ${getMotivationalPhrase('workout')}`;
    } else {
        message = `Serie ${setNumber} completada. Quedan ${remaining} series. ¡Sigue así!`;
    }
    
    speak(message);
}

export function announceWorkoutComplete(duration, exercises) {
    if (!ttsState.workoutCoaching.progressUpdates) return;
    
    const minutes = Math.floor(duration / 60);
    const message = `¡Entrenamiento completado en ${minutes} minutos! Realizaste ${exercises} ejercicios. ${getMotivationalPhrase('workout')} ¡Excelente trabajo, ${ttsState.userName}!`;
    speak(message);
}

// Coaching para running
export function announceRunStart() {
    if (!ttsState.runningCoaching.enabled) return;
    
    const message = `¡Empezamos a correr, ${ttsState.userName}! Mantén un ritmo cómodo y disfruta. ¡Tú puedes!`;
    speak(message);
}

export function announceDistance(distance, pace, isKilometer = false) {
    if (!ttsState.runningCoaching.distanceUpdates) return;
    
    // Evitar anuncios muy frecuentes
    const now = Date.now();
    if (now - ttsState.lastAnnouncement < ttsState.announcementInterval && !isKilometer) {
        return;
    }
    
    ttsState.lastAnnouncement = now;
    
    const distanceKm = (distance / 1000).toFixed(1);
    const paceMin = Math.floor(pace);
    const paceSec = Math.floor((pace - paceMin) * 60);
    
    let message;
    if (isKilometer) {
        message = `¡Kilómetro ${Math.floor(distance / 1000)} completado! Pace: ${paceMin} minutos ${paceSec} segundos por kilómetro. ${getMotivationalPhrase('running')}`;
    } else {
        message = `Llevas ${distanceKm} kilómetros. Pace actual: ${paceMin}:${paceSec.toString().padStart(2, '0')}. ¡Mantén el ritmo!`;
    }
    
    speak(message);
}

export function announcePaceAlert(currentPace, targetPace, type) {
    if (!ttsState.runningCoaching.paceAlerts) return;
    
    let message;
    switch (type) {
        case 'too_fast':
            message = `Vas un poco rápido. Reduce el ritmo para mantener la constancia.`;
            break;
        case 'too_slow':
            message = `Puedes acelerar un poco el ritmo. ¡Vamos, ${ttsState.userName}!`;
            break;
        case 'perfect':
            message = `¡Pace perfecto! Mantén este ritmo. ¡Excelente!`;
            break;
    }
    
    speak(message);
}

export function announceRunComplete(distance, duration, avgPace) {
    if (!ttsState.runningCoaching.progressUpdates) return;
    
    const distanceKm = (distance / 1000).toFixed(1);
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    const paceMin = Math.floor(avgPace);
    const paceSec = Math.floor((avgPace - paceMin) * 60);
    
    const message = `¡Carrera completada, ${ttsState.userName}! Corriste ${distanceKm} kilómetros en ${minutes} minutos y ${seconds} segundos. Pace promedio: ${paceMin}:${paceSec.toString().padStart(2, '0')}. ${getMotivationalPhrase('running')} ¡Increíble trabajo!`;
    speak(message);
}

// Coaching para intervalos
export function announceIntervalStart(intervalType, duration, intensity) {
    if (!ttsState.runningCoaching.intervalCoaching) return;
    
    let message;
    switch (intervalType) {
        case 'work':
            message = `Intervalo de trabajo: ${duration} segundos a intensidad ${intensity}. ¡Dale todo!`;
            break;
        case 'rest':
            message = `Intervalo de descanso: ${duration} segundos. Recupera y prepárate.`;
            break;
        case 'warmup':
            message = `Calentamiento: ${duration} segundos a ritmo suave.`;
            break;
        case 'cooldown':
            message = `Enfriamiento: ${duration} segundos reduciendo el ritmo.`;
            break;
    }
    
    speak(message);
}

// Coaching para retos
export function announceChallengeStart(challengeName, target, unit) {
    const message = `¡Reto aceptado, ${ttsState.userName}! ${challengeName}: ${target} ${unit}. ¡Vamos a por todas!`;
    speak(message);
}

export function announceChallengeProgress(current, target, unit) {
    const remaining = target - current;
    const percentage = Math.floor((current / target) * 100);
    
    let message;
    if (percentage >= 90) {
        message = `¡Casi terminado! Solo ${remaining} ${unit} más. ¡El último esfuerzo!`;
    } else if (percentage >= 50) {
        message = `¡Vas por la mitad! ${current} de ${target} ${unit}. ${getMotivationalPhrase('challenges')}`;
    } else {
        message = `Llevas ${current} de ${target} ${unit}. ¡Sigue así!`;
    }
    
    speak(message);
}

export function announceChallengeComplete(challengeName, points) {
    const message = `¡Reto completado, ${ttsState.userName}! ${challengeName} terminado. Ganaste ${points} puntos. ${getMotivationalPhrase('challenges')} ¡Eres increíble!`;
    speak(message);
}

// === FUNCIONES DE UTILIDAD ===

// Obtener frase motivacional aleatoria
function getMotivationalPhrase(category) {
    const lang = ttsState.language.startsWith('en') ? 'en' : 'es';
    const phrases = motivationalPhrases[lang][category];
    const randomIndex = Math.floor(Math.random() * phrases.length);
    return phrases[randomIndex];
}

// Configuraciones específicas
export function enableWorkoutCoaching(enabled = true) {
    ttsState.workoutCoaching.enabled = enabled;
    saveTTSSettings();
}

export function enableRunningCoaching(enabled = true) {
    ttsState.runningCoaching.enabled = enabled;
    saveTTSSettings();
}

export function setVolume(volume) {
    ttsState.volume = Math.max(0, Math.min(1, volume));
    saveTTSSettings();
}

export function setRate(rate) {
    ttsState.rate = Math.max(0.1, Math.min(2.0, rate));
    saveTTSSettings();
}

export function setPitch(pitch) {
    ttsState.pitch = Math.max(0.0, Math.min(2.0, pitch));
    saveTTSSettings();
}

export function setAnnouncementInterval(milliseconds) {
    ttsState.announcementInterval = milliseconds;
    saveTTSSettings();
}

// Control general
export function enableTTS(enabled = true) {
    ttsState.isEnabled = enabled;
    saveTTSSettings();
    
    if (!enabled) {
        stopSpeaking();
    }
}

export function stopSpeaking() {
    if ('speechSynthesis' in window) {
        speechSynthesis.cancel();
        ttsState.isPlaying = false;
    }
}

export function pauseSpeaking() {
    if ('speechSynthesis' in window && speechSynthesis.speaking) {
        speechSynthesis.pause();
    }
}

export function resumeSpeaking() {
    if ('speechSynthesis' in window && speechSynthesis.paused) {
        speechSynthesis.resume();
    }
}

// Información del estado
export function isTTSEnabled() {
    return ttsState.isEnabled && ('speechSynthesis' in window);
}

export function isSpeaking() {
    return ttsState.isPlaying;
}

export function getTTSSettings() {
    return { ...ttsState };
}

// Configuración avanzada
export function updateTTSSettings(newSettings) {
    ttsState = { ...ttsState, ...newSettings };
    saveTTSSettings();
}

// === FUNCIONES ESPECÍFICAS PARA ENTRENOAPP ===

// Anuncios contextuales
export function announceFormTip(exerciseName, tip) {
    if (!ttsState.workoutCoaching.formTips) return;
    
    const message = `Consejo para ${exerciseName}: ${tip}`;
    speak(message, { rate: 0.9 }); // Más lento para consejos
}

export function announceMotivationalBoost() {
    if (!ttsState.workoutCoaching.motivationalMessages) return;
    
    const phrase = getMotivationalPhrase('workout');
    speak(`¡${phrase}, ${ttsState.userName}!`, { pitch: 1.1 });
}

export function announceWorkoutMilestone(milestone) {
    const message = `¡Felicidades, ${ttsState.userName}! ${milestone}`;
    speak(message, { volume: 0.9, pitch: 1.1 });
}

// Test de TTS
export function testTTS() {
    const message = `Hola ${ttsState.userName}, soy tu entrenador virtual de EntrenoApp. ¡Vamos a entrenar juntos!`;
    return speak(message);
}

// Inicialización automática
if (typeof window !== 'undefined') {
    // Inicializar cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeTTS);
    } else {
        initializeTTS();
    }
}

// Exportar para uso global
window.EntrenoTTS = {
    speak,
    enableTTS,
    setVolume,
    setRate,
    testTTS,
    announceWorkoutStart,
    announceRunStart,
    announceChallengeStart,
    // ... otras funciones según necesidad
};

console.log('🎵 Módulo TTS cargado');
