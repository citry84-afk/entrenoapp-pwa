// Sistema de celebraciones y confetti para milestones

/**
 * Mostrar celebración con confetti y mensaje
 */
export function showCelebration(message, type = 'default') {
    // Crear overlay de celebración
    const overlay = document.createElement('div');
    overlay.id = 'celebration-overlay';
    overlay.className = 'celebration-overlay';
    overlay.innerHTML = `
        <div class="celebration-content">
            <div class="celebration-icon">${getIconForType(type)}</div>
            <h2 class="celebration-title">${message}</h2>
            <p class="celebration-subtitle">¡Sigue así! 🔥</p>
            <button class="glass-button glass-button-primary" onclick="closeCelebration()">
                ¡Genial!
            </button>
        </div>
    `;
    
    document.body.appendChild(overlay);
    
    // Trigger confetti
    showConfetti();
    
    // Auto-cerrar después de 5 segundos
    setTimeout(() => {
        closeCelebration();
    }, 5000);
}

/**
 * Mostrar confetti animado
 */
export function showConfetti() {
    const colors = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe'];
    const confettiCount = 100;
    const duration = 3000;
    
    for (let i = 0; i < confettiCount; i++) {
        createConfetti(colors[Math.floor(Math.random() * colors.length)]);
    }
}

/**
 * Crear un elemento de confetti
 */
function createConfetti(color) {
    const confetti = document.createElement('div');
    confetti.className = 'confetti';
    confetti.style.cssText = `
        position: fixed;
        width: 10px;
        height: 10px;
        background: ${color};
        left: ${Math.random() * 100}vw;
        top: -10px;
        border-radius: 2px;
        z-index: 9999;
        pointer-events: none;
        animation: confetti-fall ${2000 + Math.random() * 1000}ms linear forwards;
    `;
    
    document.body.appendChild(confetti);
    
    setTimeout(() => {
        confetti.remove();
    }, 3000);
}

/**
 * Cerrar celebración
 */
export function closeCelebration() {
    const overlay = document.getElementById('celebration-overlay');
    if (overlay) {
        overlay.style.animation = 'fadeOut 0.3s ease-out';
        setTimeout(() => overlay.remove(), 300);
    }
}

/**
 * Mostrar celebración al completar entrenamiento
 */
export function showWorkoutCompletion(message) {
    // Versión más simple y rápida para completar entrenamientos
    const notification = document.createElement('div');
    notification.className = 'workout-completion-notification';
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon">🎉</span>
            <span class="notification-text">${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Trigger confetti suave
    setTimeout(() => showConfetti(), 100);
    
    // Remover después de 3 segundos
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

/**
 * Obtener icono según tipo de milestone
 */
function getIconForType(type) {
    const icons = {
        'first': '🎉',
        'week': '🔥',
        'ten': '💪',
        'month': '🏆',
        'fifty': '⭐',
        'century': '👑',
        'streak': '🔥',
        'default': '🎉'
    };
    return icons[type] || icons.default;
}

// Exportar funciones globales
window.showCelebration = showCelebration;
window.showConfetti = showConfetti;
window.closeCelebration = closeCelebration;
window.showWorkoutCompletion = showWorkoutCompletion;

