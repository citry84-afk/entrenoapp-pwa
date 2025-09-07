// Dashboard principal de EntrenoApp
import { auth, db } from '../config/firebase-config.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

// Estado del dashboard
let dashboardState = {
    user: null,
    currentPlan: null,
    weeklyProgress: 0,
    todayChallenge: null,
    achievements: [],
    ranking: {
        daily: null,
        weekly: null,
        monthly: null
    },
    availablePlans: []
};

// Inicializar dashboard
window.initDashboard = function() {
    console.log('🏠 Inicializando dashboard');
    loadDashboardData();
    renderDashboard();
    setupDashboardListeners();
};

// Cargar datos del dashboard
async function loadDashboardData() {
    try {
        const user = auth.currentUser;
        if (!user) return;
        
        dashboardState.user = user;
        
        // Simular datos (más tarde conectaremos con Firestore)
        dashboardState.currentPlan = {
            type: 'running',
            name: 'Plan 5K para Principiantes',
            week: 3,
            totalWeeks: 8,
            day: 2,
            totalDays: 5,
            nextWorkout: 'Correr 20 minutos'
        };
        
        dashboardState.weeklyProgress = 65;
        
        dashboardState.todayChallenge = {
            type: 'strength',
            title: 'Reto de Flexiones',
            description: '30 flexiones en tu nivel',
            completed: false,
            difficulty: 'intermedio'
        };
        
        dashboardState.achievements = [
            {
                id: 'first_week',
                title: 'Primera Semana',
                description: 'Completa tu primera semana de entrenamiento',
                progress: 85,
                unlocked: false,
                icon: '🏁'
            },
            {
                id: 'consistency',
                title: 'Consistencia',
                description: 'Entrena 5 días seguidos',
                progress: 60,
                unlocked: false,
                icon: '📅'
            }
        ];
        
        dashboardState.ranking = {
            daily: { position: 12, total: 156 },
            weekly: { position: 8, total: 156 },
            monthly: { position: 15, total: 156 }
        };
        
        dashboardState.availablePlans = [
            {
                id: 'gym_beginner',
                type: 'gym',
                name: 'Gym para Principiantes',
                duration: '6 semanas',
                description: 'Aprende lo básico del gimnasio',
                difficulty: 'principiante',
                icon: '🏋️'
            },
            {
                id: 'crossfit_intro',
                type: 'crossfit',
                name: 'Introducción a CrossFit',
                duration: '4 semanas',
                description: 'Movimientos funcionales básicos',
                difficulty: 'principiante',
                icon: '⚡'
            }
        ];
        
    } catch (error) {
        console.error('❌ Error cargando datos del dashboard:', error);
    }
}

// Renderizar dashboard
function renderDashboard() {
    const container = document.querySelector('.dashboard-container');
    if (!container) return;
    
    const user = dashboardState.user;
    const firstName = user?.displayName?.split(' ')[0] || user?.email?.split('@')[0] || 'Usuario';
    
    container.innerHTML = `
        ${renderWelcomeSection(firstName)}
        ${renderCurrentPlan()}
        ${renderTodayChallenge()}
        ${renderAchievements()}
        ${renderRanking()}
        ${renderAvailablePlans()}
        ${renderQuickActions()}
    `;
    
    // Añadir animaciones escalonadas
    const cards = container.querySelectorAll('.glass-card');
    cards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
        card.classList.add('glass-fade-in');
    });
}

// Sección de bienvenida
function renderWelcomeSection(firstName) {
    const currentHour = new Date().getHours();
    let greeting = 'Buenas tardes';
    let icon = '☀️';
    
    if (currentHour < 12) {
        greeting = 'Buenos días';
        icon = '🌅';
    } else if (currentHour < 18) {
        greeting = 'Buenas tardes';
        icon = '☀️';
    } else {
        greeting = 'Buenas noches';
        icon = '🌙';
    }
    
    return `
        <div class="welcome-section glass-card glass-gradient-blue mb-lg">
            <div class="welcome-content">
                <div class="welcome-text">
                    <h2 class="welcome-greeting">
                        ${icon} ${greeting}, ${firstName}
                    </h2>
                    <p class="welcome-message">
                        ¡Listo para entrenar hoy? 💪
                    </p>
                </div>
                <div class="welcome-avatar">
                    <div class="avatar-circle">
                        ${firstName.charAt(0).toUpperCase()}
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Plan activo actual
function renderCurrentPlan() {
    const plan = dashboardState.currentPlan;
    if (!plan) return '';
    
    const progressPercentage = ((plan.week - 1) / plan.totalWeeks) * 100;
    
    return `
        <div class="current-plan glass-card glass-card-active mb-lg">
            <div class="card-header">
                <h3 class="card-title">📋 Plan Activo</h3>
                <span class="plan-badge ${plan.type}">${getPlanTypeIcon(plan.type)} ${plan.type}</span>
            </div>
            
            <div class="plan-info">
                <h4 class="plan-name">${plan.name}</h4>
                <p class="plan-progress-text">
                    Semana ${plan.week} de ${plan.totalWeeks} • Día ${plan.day} de ${plan.totalDays}
                </p>
                
                <div class="progress-bar-container">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progressPercentage}%"></div>
                    </div>
                    <span class="progress-text">${Math.round(progressPercentage)}%</span>
                </div>
                
                <div class="next-workout">
                    <p class="next-workout-label">Próximo entrenamiento:</p>
                    <p class="next-workout-description">${plan.nextWorkout}</p>
                </div>
                
                <div class="plan-actions">
                    <button class="glass-button glass-button-primary" onclick="startWorkout()">
                        ▶️ Comenzar Ahora
                    </button>
                    <button class="glass-button" onclick="viewPlan()">
                        👁️ Ver Plan Completo
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Reto del día
function renderTodayChallenge() {
    const challenge = dashboardState.todayChallenge;
    if (!challenge) return '';
    
    return `
        <div class="today-challenge glass-card glass-gradient-orange mb-lg">
            <div class="card-header">
                <h3 class="card-title">🏆 Reto de Hoy</h3>
                <span class="challenge-difficulty ${challenge.difficulty}">
                    ${getDifficultyIcon(challenge.difficulty)} ${challenge.difficulty}
                </span>
            </div>
            
            <div class="challenge-content">
                <h4 class="challenge-title">${challenge.title}</h4>
                <p class="challenge-description">${challenge.description}</p>
                
                <div class="challenge-actions">
                    ${challenge.completed ? `
                        <div class="challenge-completed">
                            <span class="completed-icon">✅</span>
                            <span>¡Reto completado!</span>
                        </div>
                    ` : `
                        <button class="glass-button glass-button-primary" onclick="startChallenge()">
                            🚀 Aceptar Reto
                        </button>
                    `}
                </div>
            </div>
        </div>
    `;
}

// Logros en progreso
function renderAchievements() {
    const achievements = dashboardState.achievements;
    if (!achievements.length) return '';
    
    return `
        <div class="achievements glass-card glass-gradient-purple mb-lg">
            <div class="card-header">
                <h3 class="card-title">🎯 Logros en Progreso</h3>
                <button class="glass-button glass-button-sm" onclick="viewAllAchievements()">
                    Ver Todos
                </button>
            </div>
            
            <div class="achievements-list">
                ${achievements.map(achievement => `
                    <div class="achievement-item">
                        <div class="achievement-icon">${achievement.icon}</div>
                        <div class="achievement-info">
                            <h5 class="achievement-title">${achievement.title}</h5>
                            <p class="achievement-description">${achievement.description}</p>
                            <div class="achievement-progress">
                                <div class="progress-bar small">
                                    <div class="progress-fill" style="width: ${achievement.progress}%"></div>
                                </div>
                                <span class="progress-text">${achievement.progress}%</span>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// Ranking
function renderRanking() {
    const ranking = dashboardState.ranking;
    
    return `
        <div class="ranking glass-card glass-gradient-green mb-lg">
            <div class="card-header">
                <h3 class="card-title">📊 Tu Posición</h3>
                <button class="glass-button glass-button-sm" onclick="viewLeaderboard()">
                    Ver Ranking
                </button>
            </div>
            
            <div class="ranking-grid">
                <div class="ranking-item">
                    <div class="ranking-period">Diario</div>
                    <div class="ranking-position">#${ranking.daily.position}</div>
                    <div class="ranking-total">de ${ranking.daily.total}</div>
                </div>
                <div class="ranking-item">
                    <div class="ranking-period">Semanal</div>
                    <div class="ranking-position">#${ranking.weekly.position}</div>
                    <div class="ranking-total">de ${ranking.weekly.total}</div>
                </div>
                <div class="ranking-item">
                    <div class="ranking-period">Mensual</div>
                    <div class="ranking-position">#${ranking.monthly.position}</div>
                    <div class="ranking-total">de ${ranking.monthly.total}</div>
                </div>
            </div>
        </div>
    `;
}

// Planes disponibles
function renderAvailablePlans() {
    const plans = dashboardState.availablePlans;
    if (!plans.length) return '';
    
    return `
        <div class="available-plans glass-card mb-lg">
            <div class="card-header">
                <h3 class="card-title">📚 Planes Disponibles</h3>
                <button class="glass-button glass-button-sm" onclick="viewAllPlans()">
                    Ver Todos
                </button>
            </div>
            
            <div class="plans-grid">
                ${plans.map(plan => `
                    <div class="plan-item glass-effect" onclick="selectPlan('${plan.id}')">
                        <div class="plan-icon">${plan.icon}</div>
                        <div class="plan-info">
                            <h5 class="plan-name">${plan.name}</h5>
                            <p class="plan-duration">${plan.duration}</p>
                            <p class="plan-description">${plan.description}</p>
                            <span class="plan-difficulty ${plan.difficulty}">
                                ${getDifficultyIcon(plan.difficulty)} ${plan.difficulty}
                            </span>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// Acciones rápidas
function renderQuickActions() {
    return `
        <div class="quick-actions glass-card">
            <div class="card-header">
                <h3 class="card-title">⚡ Acciones Rápidas</h3>
            </div>
            
            <div class="actions-grid">
                <button class="action-button glass-effect" onclick="navigateToPage('workouts')">
                    <div class="action-icon">💪</div>
                    <div class="action-label">Entrenar</div>
                </button>
                <button class="action-button glass-effect" onclick="navigateToPage('running')">
                    <div class="action-icon">🏃</div>
                    <div class="action-label">Correr</div>
                </button>
                <button class="action-button glass-effect" onclick="navigateToPage('challenges')">
                    <div class="action-icon">🏆</div>
                    <div class="action-label">Retos</div>
                </button>
                <button class="action-button glass-effect" onclick="viewProgress()">
                    <div class="action-icon">📈</div>
                    <div class="action-label">Progreso</div>
                </button>
            </div>
        </div>
    `;
}

// Configurar listeners del dashboard
function setupDashboardListeners() {
    // Refresh de datos cada 5 minutos
    setInterval(loadDashboardData, 5 * 60 * 1000);
    
    // Pull to refresh (para móviles)
    let isRefreshing = false;
    let startY = 0;
    
    document.addEventListener('touchstart', (e) => {
        startY = e.touches[0].clientY;
    });
    
    document.addEventListener('touchmove', (e) => {
        const currentY = e.touches[0].clientY;
        const pullDistance = currentY - startY;
        
        if (pullDistance > 100 && window.scrollY === 0 && !isRefreshing) {
            isRefreshing = true;
            refreshDashboard();
        }
    });
}

// Refresh del dashboard
async function refreshDashboard() {
    console.log('🔄 Actualizando dashboard...');
    
    try {
        await loadDashboardData();
        renderDashboard();
        
        // Mostrar feedback
        showToast('Dashboard actualizado', 'success');
        
    } catch (error) {
        console.error('❌ Error actualizando dashboard:', error);
        showToast('Error actualizando datos', 'error');
    } finally {
        isRefreshing = false;
    }
}

// Funciones de utilidad
function getPlanTypeIcon(type) {
    const icons = {
        'running': '🏃',
        'gym': '🏋️',
        'crossfit': '⚡',
        'functional': '💪'
    };
    return icons[type] || '📋';
}

function getDifficultyIcon(difficulty) {
    const icons = {
        'principiante': '🟢',
        'intermedio': '🟡',
        'avanzado': '🔴'
    };
    return icons[difficulty] || '⚪';
}

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast glass-effect ${type}`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Funciones de navegación (placeholders)
window.startWorkout = function() {
    console.log('🏋️ Iniciando entrenamiento...');
    navigateToPage('workouts');
};

window.viewPlan = function() {
    console.log('👁️ Viendo plan completo...');
    // Implementar vista detallada del plan
};

window.startChallenge = function() {
    console.log('🏆 Iniciando reto...');
    navigateToPage('challenges');
};

window.viewAllAchievements = function() {
    console.log('🎯 Viendo todos los logros...');
    // Implementar vista de logros
};

window.viewLeaderboard = function() {
    console.log('📊 Viendo ranking...');
    // Implementar leaderboard
};

window.viewAllPlans = function() {
    console.log('📚 Viendo todos los planes...');
    navigateToPage('workouts');
};

window.selectPlan = function(planId) {
    console.log('📋 Seleccionando plan:', planId);
    // Implementar selección de plan
};

window.viewProgress = function() {
    console.log('📈 Viendo progreso...');
    // Implementar vista de progreso
};

console.log('🏠 Módulo Dashboard cargado');
