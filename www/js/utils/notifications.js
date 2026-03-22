// Sistema de notificaciones y recordatorios personalizados

let notificationSettings = {
    enabled: true,
    workoutReminder: true,
    reminderTime: '09:00', // Hora por defecto: 9 AM
    reminderDays: [1, 2, 3, 4, 5, 6, 7], // Todos los días
    challengeReminder: true,
    milestoneNotifications: true
};

/**
 * Inicializar sistema de notificaciones
 */
export function initNotifications() {
    // Cargar preferencias desde localStorage
    const saved = localStorage.getItem('entrenoapp_notification_settings');
    if (saved) {
        notificationSettings = { ...notificationSettings, ...JSON.parse(saved) };
    }
    
    // Solicitar permisos de notificaciones
    requestNotificationPermission();
    
    // Configurar recordatorios
    setupWorkoutReminders();
    
    console.log('✅ Sistema de notificaciones inicializado');
}

/**
 * Solicitar permisos de notificaciones
 */
async function requestNotificationPermission() {
    if (!('Notification' in window)) {
        console.warn('⚠️ Notificaciones no soportadas en este navegador');
        return false;
    }
    
    if (Notification.permission === 'granted') {
        return true;
    }
    
    if (Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
    }
    
    return false;
}

/**
 * Configurar recordatorios de entrenamiento
 */
function setupWorkoutReminders() {
    if (!notificationSettings.enabled || !notificationSettings.workoutReminder) {
        return;
    }
    
    // Calcular tiempo hasta próximo recordatorio
    const [hours, minutes] = notificationSettings.reminderTime.split(':').map(Number);
    const now = new Date();
    const reminderTime = new Date();
    reminderTime.setHours(hours, minutes, 0, 0);
    
    // Si ya pasó la hora de hoy, programar para mañana
    if (reminderTime <= now) {
        reminderTime.setDate(reminderTime.getDate() + 1);
    }
    
    const timeUntilReminder = reminderTime.getTime() - now.getTime();
    
    setTimeout(() => {
        checkAndSendReminder();
        
        // Programar recordatorio diario
        setInterval(checkAndSendReminder, 24 * 60 * 60 * 1000);
    }, timeUntilReminder);
}

/**
 * Verificar y enviar recordatorio
 */
function checkAndSendReminder() {
    const today = new Date().getDay(); // 0 = Domingo, 1 = Lunes, etc.
    
    // Verificar si hoy es un día de recordatorio
    if (!notificationSettings.reminderDays.includes(today)) {
        return;
    }
    
    // Verificar si ya se completó el entrenamiento de hoy
    const completedToday = checkIfWorkoutCompletedToday();
    if (completedToday) {
        return; // No enviar si ya está completado
    }
    
    // Verificar si hay plan activo
    const activePlan = localStorage.getItem('entrenoapp_active_plan');
    if (!activePlan) {
        return; // No hay plan, no enviar recordatorio
    }
    
    // Enviar notificación
    sendWorkoutReminder();
}

/**
 * Verificar si el entrenamiento de hoy está completado
 */
function checkIfWorkoutCompletedToday() {
    const today = new Date().toISOString().split('T')[0];
    const completedDays = JSON.parse(localStorage.getItem('entrenoapp_completed_days') || '[]');
    return completedDays.includes(today);
}

/**
 * Enviar recordatorio de entrenamiento
 */
async function sendWorkoutReminder() {
    const permission = await requestNotificationPermission();
    if (!permission) {
        return;
    }
    
    const plan = JSON.parse(localStorage.getItem('entrenoapp_active_plan') || '{}');
    const planName = plan.name || 'tu plan';
    
    const notification = new Notification('💪 ¡Hora de entrenar!', {
        body: `No olvides tu entrenamiento de hoy. ¡Sigue con ${planName}!`,
        icon: '/assets/icons/icon-192x192.png',
        badge: '/assets/icons/icon-192x192.png',
        tag: 'workout-reminder',
        requireInteraction: false,
        silent: false
    });
    
    notification.onclick = () => {
        window.focus();
        window.navigateToPage?.('dashboard');
        notification.close();
    };
    
    // Cerrar automáticamente después de 5 segundos
    setTimeout(() => notification.close(), 5000);
}

/**
 * Enviar notificación de milestone
 */
export async function sendMilestoneNotification(message, icon = '🎉') {
    const permission = await requestNotificationPermission();
    if (!permission) {
        return;
    }
    
    const notification = new Notification(`¡Logro desbloqueado! ${icon}`, {
        body: message,
        icon: '/assets/icons/icon-192x192.png',
        badge: '/assets/icons/icon-192x192.png',
        tag: 'milestone',
        requireInteraction: true
    });
    
    notification.onclick = () => {
        window.focus();
        window.navigateToPage?.('dashboard');
        notification.close();
    };
}

/**
 * Guardar preferencias de notificaciones
 */
export function saveNotificationSettings(settings) {
    notificationSettings = { ...notificationSettings, ...settings };
    localStorage.setItem('entrenoapp_notification_settings', JSON.stringify(notificationSettings));
}

/**
 * Obtener preferencias de notificaciones
 */
export function getNotificationSettings() {
    return { ...notificationSettings };
}

// Inicializar automáticamente
if (typeof window !== 'undefined') {
    // Esperar a que el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initNotifications);
    } else {
        initNotifications();
    }
    
    // Exportar funciones globales
    window.initNotifications = initNotifications;
    window.sendMilestoneNotification = sendMilestoneNotification;
    window.saveNotificationSettings = saveNotificationSettings;
    window.getNotificationSettings = getNotificationSettings;
}

