// Componente de retos diarios de EntrenoApp
import { auth, db } from '../config/firebase-config.js';

// Estado del componente de retos
let challengesState = {
    currentMode: 'daily', // 'daily', 'weekly', 'achievements', 'leaderboard'
    todayChallenge: null,
    weeklyChallenge: null,
    userProgress: null,
    completedChallenges: [],
    userLevel: 'principiante',
    userStats: {
        totalChallenges: 0,
        currentStreak: 0,
        longestStreak: 0,
        points: 0
    },
    leaderboard: []
};

// Base de datos de retos diarios
const challengeDatabase = {
    // Retos de cardio
    cardio: [
        {
            id: 'cardio_001',
            name: 'Caminata Energética',
            description: 'Camina a paso rápido durante el tiempo indicado',
            type: 'time',
            icon: '🚶',
            category: 'cardio',
            levels: {
                principiante: { target: 15, unit: 'minutos' },
                intermedio: { target: 25, unit: 'minutos' },
                avanzado: { target: 40, unit: 'minutos' }
            },
            points: {
                principiante: 10,
                intermedio: 15,
                avanzado: 25
            },
            instructions: [
                'Mantén un ritmo constante y enérgico',
                'Puedes hacerlo en exterior o cinta',
                'Respira profundamente durante toda la actividad'
            ]
        },
        {
            id: 'cardio_002',
            name: 'Carrera Continua',
            description: 'Corre sin parar durante el tiempo o distancia indicada',
            type: 'distance',
            icon: '🏃',
            category: 'cardio',
            levels: {
                principiante: { target: 1, unit: 'km' },
                intermedio: { target: 3, unit: 'km' },
                avanzado: { target: 5, unit: 'km' }
            },
            points: {
                principiante: 15,
                intermedio: 25,
                avanzado: 40
            },
            instructions: [
                'Mantén un ritmo que te permita respirar cómodamente',
                'Si necesitas parar, camina pero no te detengas',
                'Hidratate antes y después'
            ]
        },
        {
            id: 'cardio_003',
            name: 'Escaleras o Steps',
            description: 'Sube y baja escaleras o realiza steps',
            type: 'reps',
            icon: '🪜',
            category: 'cardio',
            levels: {
                principiante: { target: 50, unit: 'steps' },
                intermedio: { target: 100, unit: 'steps' },
                avanzado: { target: 200, unit: 'steps' }
            },
            points: {
                principiante: 12,
                intermedio: 20,
                avanzado: 35
            }
        }
    ],

    // Retos de fuerza
    strength: [
        {
            id: 'strength_001',
            name: 'Flexiones de Pecho',
            description: 'Realiza flexiones manteniendo buena forma',
            type: 'reps',
            icon: '💪',
            category: 'strength',
            levels: {
                principiante: { target: 10, unit: 'flexiones' },
                intermedio: { target: 25, unit: 'flexiones' },
                avanzado: { target: 50, unit: 'flexiones' }
            },
            points: {
                principiante: 10,
                intermedio: 18,
                avanzado: 30
            },
            instructions: [
                'Mantén el cuerpo recto como una tabla',
                'Baja hasta que el pecho casi toque el suelo',
                'Si es muy difícil, apoya las rodillas'
            ],
            modifications: {
                principiante: 'Puedes hacer flexiones con rodillas apoyadas',
                intermedio: 'Flexiones estándar completas',
                avanzado: 'Puedes intentar flexiones diamante o con palmada'
            }
        },
        {
            id: 'strength_002',
            name: 'Sentadillas',
            description: 'Realiza sentadillas con técnica perfecta',
            type: 'reps',
            icon: '🦵',
            category: 'strength',
            levels: {
                principiante: { target: 15, unit: 'sentadillas' },
                intermedio: { target: 40, unit: 'sentadillas' },
                avanzado: { target: 80, unit: 'sentadillas' }
            },
            points: {
                principiante: 8,
                intermedio: 15,
                avanzado: 25
            },
            instructions: [
                'Pies a ancho de hombros',
                'Baja como si fueras a sentarte',
                'Mantén el pecho erguido y peso en los talones'
            ]
        },
        {
            id: 'strength_003',
            name: 'Plancha',
            description: 'Mantén la posición de plancha',
            type: 'time',
            icon: '⭐',
            category: 'strength',
            levels: {
                principiante: { target: 30, unit: 'segundos' },
                intermedio: { target: 90, unit: 'segundos' },
                avanzado: { target: 180, unit: 'segundos' }
            },
            points: {
                principiante: 12,
                intermedio: 20,
                avanzado: 35
            },
            instructions: [
                'Cuerpo recto desde cabeza hasta pies',
                'Activa el core y mantén la respiración',
                'No hundas ni subas las caderas'
            ]
        },
        {
            id: 'strength_004',
            name: 'Burpees',
            description: 'El ejercicio completo más desafiante',
            type: 'reps',
            icon: '🔥',
            category: 'strength',
            levels: {
                principiante: { target: 5, unit: 'burpees' },
                intermedio: { target: 15, unit: 'burpees' },
                avanzado: { target: 30, unit: 'burpees' }
            },
            points: {
                principiante: 15,
                intermedio: 25,
                avanzado: 40
            },
            instructions: [
                'Posición de pie → Sentadilla → Plancha → Flexión → Salto',
                'Movimiento fluido y controlado',
                'Respira profundamente entre repeticiones'
            ]
        }
    ],

    // Retos de flexibilidad
    flexibility: [
        {
            id: 'flexibility_001',
            name: 'Estiramientos Matutinos',
            description: 'Rutina de estiramientos para despertar el cuerpo',
            type: 'time',
            icon: '🧘',
            category: 'flexibility',
            levels: {
                principiante: { target: 5, unit: 'minutos' },
                intermedio: { target: 10, unit: 'minutos' },
                avanzado: { target: 15, unit: 'minutos' }
            },
            points: {
                principiante: 8,
                intermedio: 12,
                avanzado: 18
            },
            instructions: [
                'Estira suavemente sin forzar',
                'Mantén cada posición 20-30 segundos',
                'Respira profundo durante cada estiramiento'
            ]
        }
    ]
};

// Inicializar componente de retos
window.initChallenges = function() {
    console.log('🏆 Inicializando retos diarios');
    loadChallengesData();
    renderChallengesPage();
    setupChallengesListeners();
};

// Cargar datos de retos
async function loadChallengesData() {
    try {
        // Generar reto del día
        generateTodayChallenge();
        
        // Cargar progreso del usuario
        loadUserProgress();
        
        // Cargar estadísticas
        loadUserStats();
        
        // Cargar leaderboard
        loadLeaderboard();
        
    } catch (error) {
        console.error('❌ Error cargando datos de retos:', error);
    }
}

// Renderizar página de retos
function renderChallengesPage() {
    const container = document.querySelector('.challenges-container');
    if (!container) return;
    
    let content = '';
    
    switch (challengesState.currentMode) {
        case 'daily':
            content = renderDailyChallenges();
            break;
        case 'weekly':
            content = renderWeeklyChallenges();
            break;
        case 'achievements':
            content = renderAchievements();
            break;
        case 'leaderboard':
            content = renderLeaderboard();
            break;
        default:
            content = renderDailyChallenges();
    }
    
    container.innerHTML = content;
    
    // Añadir animaciones
    const cards = container.querySelectorAll('.glass-card');
    cards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
        card.classList.add('glass-fade-in');
    });
}

// Retos diarios
function renderDailyChallenges() {
    return `
        <div class="challenges-daily">
            <div class="challenges-header">
                <h2 class="challenges-title">🏆 Retos Diarios</h2>
                <div class="challenges-nav">
                    <button class="glass-button nav-btn active" data-mode="daily">Diario</button>
                    <button class="glass-button nav-btn" data-mode="weekly">Semanal</button>
                    <button class="glass-button nav-btn" data-mode="achievements">Logros</button>
                    <button class="glass-button nav-btn" data-mode="leaderboard">Ranking</button>
                </div>
            </div>
            
            ${renderTodayChallenge()}
            ${renderUserStats()}
            ${renderChallengeCategories()}
            ${renderRecentChallenges()}
        </div>
    `;
}

// Reto de hoy
function renderTodayChallenge() {
    if (!challengesState.todayChallenge) return '';
    
    const challenge = challengesState.todayChallenge;
    const isCompleted = isChallengeCompleted(challenge.id);
    const userLevel = challengesState.userLevel;
    const levelData = challenge.levels[userLevel];
    
    return `
        <div class="today-challenge glass-card glass-gradient-orange">
            <div class="challenge-header">
                <div class="challenge-icon">${challenge.icon}</div>
                <div class="challenge-info">
                    <h3 class="challenge-name">${challenge.name}</h3>
                    <p class="challenge-description">${challenge.description}</p>
                </div>
                <div class="challenge-level">
                    <span class="level-badge ${userLevel}">${getUserLevelIcon(userLevel)} ${userLevel}</span>
                </div>
            </div>
            
            <div class="challenge-target">
                <div class="target-value">${levelData.target}</div>
                <div class="target-unit">${levelData.unit}</div>
            </div>
            
            <div class="challenge-progress">
                <div class="progress-info">
                    <span class="progress-label">Progreso de hoy</span>
                    <span class="progress-points">+${challenge.points[userLevel]} puntos</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${isCompleted ? 100 : 0}%"></div>
                </div>
            </div>
            
            <div class="challenge-instructions">
                <h4>📝 Instrucciones:</h4>
                <ul>
                    ${challenge.instructions?.map(instruction => `<li>${instruction}</li>`).join('') || ''}
                </ul>
                ${challenge.modifications?.[userLevel] ? `
                    <div class="challenge-modification">
                        <strong>Para tu nivel:</strong> ${challenge.modifications[userLevel]}
                    </div>
                ` : ''}
            </div>
            
            <div class="challenge-actions">
                ${!isCompleted ? `
                    <button class="glass-button glass-button-primary btn-full" onclick="startChallenge('${challenge.id}')">
                        🚀 Comenzar Reto
                    </button>
                ` : `
                    <div class="challenge-completed">
                        <span class="completed-icon">✅</span>
                        <span class="completed-text">¡Reto completado!</span>
                        <span class="completed-points">+${challenge.points[userLevel]} puntos</span>
                    </div>
                `}
                
                <div class="challenge-secondary-actions">
                    <button class="glass-button" onclick="shareChallenge('${challenge.id}')">
                        📤 Compartir
                    </button>
                    <button class="glass-button" onclick="skipChallenge('${challenge.id}')">
                        ⏭️ Cambiar Reto
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Estadísticas del usuario
function renderUserStats() {
    const stats = challengesState.userStats;
    
    return `
        <div class="user-stats glass-card">
            <div class="card-header">
                <h3 class="card-title">📊 Tus Estadísticas</h3>
            </div>
            
            <div class="stats-grid">
                <div class="stat-item">
                    <div class="stat-icon">🏆</div>
                    <div class="stat-value">${stats.totalChallenges}</div>
                    <div class="stat-label">Retos Completados</div>
                </div>
                <div class="stat-item">
                    <div class="stat-icon">🔥</div>
                    <div class="stat-value">${stats.currentStreak}</div>
                    <div class="stat-label">Racha Actual</div>
                </div>
                <div class="stat-item">
                    <div class="stat-icon">⭐</div>
                    <div class="stat-value">${stats.longestStreak}</div>
                    <div class="stat-label">Mejor Racha</div>
                </div>
                <div class="stat-item">
                    <div class="stat-icon">💎</div>
                    <div class="stat-value">${stats.points}</div>
                    <div class="stat-label">Puntos Totales</div>
                </div>
            </div>
        </div>
    `;
}

// Categorías de retos
function renderChallengeCategories() {
    return `
        <div class="challenge-categories glass-card">
            <div class="card-header">
                <h3 class="card-title">🎯 Categorías de Retos</h3>
            </div>
            
            <div class="categories-grid">
                <div class="category-card" onclick="exploreCategory('cardio')">
                    <div class="category-icon">🏃</div>
                    <h4 class="category-name">Cardio</h4>
                    <p class="category-description">Mejora tu resistencia cardiovascular</p>
                    <div class="category-count">${challengeDatabase.cardio.length} retos</div>
                </div>
                
                <div class="category-card" onclick="exploreCategory('strength')">
                    <div class="category-icon">💪</div>
                    <h4 class="category-name">Fuerza</h4>
                    <p class="category-description">Desarrolla fuerza y músculo</p>
                    <div class="category-count">${challengeDatabase.strength.length} retos</div>
                </div>
                
                <div class="category-card" onclick="exploreCategory('flexibility')">
                    <div class="category-icon">🧘</div>
                    <h4 class="category-name">Flexibilidad</h4>
                    <p class="category-description">Mejora movilidad y bienestar</p>
                    <div class="category-count">${challengeDatabase.flexibility.length} retos</div>
                </div>
            </div>
        </div>
    `;
}

// Retos recientes
function renderRecentChallenges() {
    const recentChallenges = getRecentCompletedChallenges();
    
    return `
        <div class="recent-challenges glass-card">
            <div class="card-header">
                <h3 class="card-title">📅 Retos Recientes</h3>
                <button class="glass-button glass-button-sm" onclick="viewAllChallenges()">
                    Ver Todos
                </button>
            </div>
            
            <div class="recent-challenges-list">
                ${recentChallenges.length > 0 ? 
                    recentChallenges.map(challenge => `
                        <div class="recent-challenge-item">
                            <div class="challenge-date">${formatDate(challenge.completedAt)}</div>
                            <div class="challenge-details">
                                <span class="challenge-icon">${challenge.icon}</span>
                                <span class="challenge-name">${challenge.name}</span>
                                <span class="challenge-points">+${challenge.points} pts</span>
                            </div>
                        </div>
                    `).join('') :
                    `<div class="no-recent-challenges">
                        <p>Aún no has completado ningún reto</p>
                        <p class="encouragement">¡Empieza con el reto de hoy! 💪</p>
                    </div>`
                }
            </div>
        </div>
    `;
}

// Configurar listeners
function setupChallengesListeners() {
    // Navegación entre secciones
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('nav-btn')) {
            const mode = e.target.dataset.mode;
            switchChallengesMode(mode);
        }
    });
}

// Funciones de navegación
function switchChallengesMode(mode) {
    challengesState.currentMode = mode;
    
    // Actualizar botones activos
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-mode="${mode}"]`).classList.add('active');
    
    renderChallengesPage();
}

// Generar reto del día
function generateTodayChallenge() {
    const today = new Date().toDateString();
    const savedChallenge = localStorage.getItem(`challenge_${today}`);
    
    if (savedChallenge) {
        challengesState.todayChallenge = JSON.parse(savedChallenge);
        return;
    }
    
    // Generar nuevo reto aleatorio
    const allChallenges = [
        ...challengeDatabase.cardio,
        ...challengeDatabase.strength,
        ...challengeDatabase.flexibility
    ];
    
    const randomIndex = Math.floor(Math.random() * allChallenges.length);
    const selectedChallenge = { ...allChallenges[randomIndex] };
    
    challengesState.todayChallenge = selectedChallenge;
    
    // Guardar para que sea consistente durante el día
    localStorage.setItem(`challenge_${today}`, JSON.stringify(selectedChallenge));
}

// Funciones de control de retos
window.startChallenge = function(challengeId) {
    console.log('🚀 Iniciando reto:', challengeId);
    
    const challenge = challengesState.todayChallenge;
    if (!challenge || challenge.id !== challengeId) return;
    
    // Anuncio TTS de inicio de reto
    if (window.EntrenoTTS) {
        const userLevel = challengesState.userLevel;
        const levelData = challenge.levels[userLevel];
        window.EntrenoTTS.announceChallengeStart(
            challenge.name,
            levelData.target,
            levelData.unit
        );
    }
    
    // Abrir modal de reto activo
    showChallengeModal(challenge);
};

function showChallengeModal(challenge) {
    const userLevel = challengesState.userLevel;
    const levelData = challenge.levels[userLevel];
    
    const modal = document.createElement('div');
    modal.className = 'challenge-modal';
    modal.innerHTML = `
        <div class="challenge-modal-content glass-card">
            <div class="challenge-modal-header">
                <h3>${challenge.icon} ${challenge.name}</h3>
                <button class="close-modal" onclick="closeChallengeModal()">&times;</button>
            </div>
            
            <div class="challenge-modal-body">
                <div class="challenge-target-display">
                    <div class="target-number">${levelData.target}</div>
                    <div class="target-unit">${levelData.unit}</div>
                </div>
                
                <div class="challenge-timer" id="challenge-timer">
                    <div class="timer-display">00:00</div>
                    <button class="glass-button timer-btn" onclick="toggleChallengeTimer()">
                        ▶️ Comenzar
                    </button>
                </div>
                
                <div class="challenge-counter" id="challenge-counter" style="display: none;">
                    <div class="counter-display">
                        <span class="counter-value" id="counter-value">0</span>
                        <span class="counter-target">/ ${levelData.target}</span>
                    </div>
                    <div class="counter-controls">
                        <button class="glass-button counter-btn" onclick="decrementCounter()">-</button>
                        <button class="glass-button counter-btn primary" onclick="incrementCounter()">+</button>
                    </div>
                </div>
                
                <div class="challenge-actions">
                    <button class="glass-button glass-button-primary" onclick="completeChallengeFromModal('${challenge.id}')">
                        ✅ Completar Reto
                    </button>
                    <button class="glass-button" onclick="closeChallengeModal()">
                        ❌ Cancelar
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Mostrar contador o timer según el tipo
    if (challenge.type === 'reps') {
        document.getElementById('challenge-timer').style.display = 'none';
        document.getElementById('challenge-counter').style.display = 'block';
    }
    
    // Animación de entrada
    setTimeout(() => {
        modal.classList.add('show');
    }, 100);
}

window.closeChallengeModal = function() {
    const modal = document.querySelector('.challenge-modal');
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.remove();
        }, 300);
    }
};

// Control de timer y contador
let challengeTimer = null;
let challengeStartTime = null;
let challengeCounter = 0;

window.toggleChallengeTimer = function() {
    const timerBtn = document.querySelector('.timer-btn');
    const timerDisplay = document.querySelector('.timer-display');
    
    if (!challengeTimer) {
        // Iniciar timer
        challengeStartTime = Date.now();
        challengeTimer = setInterval(() => {
            const elapsed = Math.floor((Date.now() - challengeStartTime) / 1000);
            const minutes = Math.floor(elapsed / 60);
            const seconds = elapsed % 60;
            timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }, 1000);
        timerBtn.innerHTML = '⏸️ Pausar';
    } else {
        // Pausar timer
        clearInterval(challengeTimer);
        challengeTimer = null;
        timerBtn.innerHTML = '▶️ Continuar';
    }
};

window.incrementCounter = function() {
    challengeCounter++;
    document.getElementById('counter-value').textContent = challengeCounter;
};

window.decrementCounter = function() {
    if (challengeCounter > 0) {
        challengeCounter--;
        document.getElementById('counter-value').textContent = challengeCounter;
    }
};

window.completeChallengeFromModal = function(challengeId) {
    completeChallenge(challengeId);
    closeChallengeModal();
};

// Completar reto
function completeChallenge(challengeId) {
    const challenge = challengesState.todayChallenge;
    if (!challenge || challenge.id !== challengeId) return;
    
    const userLevel = challengesState.userLevel;
    const points = challenge.points[userLevel];
    
    // Guardar en completados
    const completedChallenge = {
        ...challenge,
        completedAt: Date.now(),
        level: userLevel,
        points: points
    };
    
    saveChallengeCompletion(completedChallenge);
    updateUserStats(points);
    
    // Anuncio TTS de reto completado
    if (window.EntrenoTTS) {
        window.EntrenoTTS.announceChallengeComplete(challenge.name, points);
    }
    
    // Mostrar celebración
    showChallengeCompletionCelebration(completedChallenge);
    
    // Actualizar UI
    renderChallengesPage();
    
    console.log('✅ Reto completado:', completedChallenge);
}

function saveChallengeCompletion(completedChallenge) {
    try {
        const completedChallenges = JSON.parse(localStorage.getItem('entrenoapp_completed_challenges') || '[]');
        completedChallenges.push(completedChallenge);
        localStorage.setItem('entrenoapp_completed_challenges', JSON.stringify(completedChallenges));
        
        // Marcar el reto de hoy como completado
        const today = new Date().toDateString();
        localStorage.setItem(`challenge_completed_${today}`, 'true');
        
    } catch (error) {
        console.error('Error guardando reto completado:', error);
    }
}

function updateUserStats(points) {
    challengesState.userStats.totalChallenges++;
    challengesState.userStats.points += points;
    challengesState.userStats.currentStreak++;
    
    if (challengesState.userStats.currentStreak > challengesState.userStats.longestStreak) {
        challengesState.userStats.longestStreak = challengesState.userStats.currentStreak;
    }
    
    // Guardar estadísticas
    localStorage.setItem('entrenoapp_user_stats', JSON.stringify(challengesState.userStats));
}

function showChallengeCompletionCelebration(challenge) {
    const celebration = document.createElement('div');
    celebration.className = 'challenge-celebration';
    celebration.innerHTML = `
        <div class="celebration-content glass-card glass-gradient-green">
            <div class="celebration-icon">🎉</div>
            <h3 class="celebration-title">¡Reto Completado!</h3>
            <p class="celebration-challenge">${challenge.icon} ${challenge.name}</p>
            <div class="celebration-points">+${challenge.points} puntos</div>
            <div class="celebration-streak">Racha: ${challengesState.userStats.currentStreak} días</div>
        </div>
    `;
    
    document.body.appendChild(celebration);
    
    setTimeout(() => {
        celebration.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        celebration.classList.remove('show');
        setTimeout(() => {
            celebration.remove();
        }, 300);
    }, 3000);
}

// Funciones de utilidad
function isChallengeCompleted(challengeId) {
    const today = new Date().toDateString();
    return localStorage.getItem(`challenge_completed_${today}`) === 'true';
}

function getUserLevelIcon(level) {
    const icons = {
        'principiante': '🟢',
        'intermedio': '🟡',
        'avanzado': '🔴'
    };
    return icons[level] || '⚪';
}

function loadUserProgress() {
    // Cargar desde localStorage
    const progress = localStorage.getItem('entrenoapp_user_progress');
    if (progress) {
        challengesState.userProgress = JSON.parse(progress);
    }
}

function loadUserStats() {
    // Cargar estadísticas desde localStorage
    const stats = localStorage.getItem('entrenoapp_user_stats');
    if (stats) {
        challengesState.userStats = { ...challengesState.userStats, ...JSON.parse(stats) };
    }
}

function loadLeaderboard() {
    // Simular leaderboard
    challengesState.leaderboard = [
        { name: 'Ana García', points: 1250, streak: 15 },
        { name: 'Carlos López', points: 980, streak: 8 },
        { name: 'María Rodríguez', points: 875, streak: 12 },
        { name: 'Tú', points: challengesState.userStats.points, streak: challengesState.userStats.currentStreak }
    ].sort((a, b) => b.points - a.points);
}

function getRecentCompletedChallenges() {
    try {
        const completed = JSON.parse(localStorage.getItem('entrenoapp_completed_challenges') || '[]');
        return completed.slice(-5).reverse(); // Últimos 5
    } catch (error) {
        console.error('Error cargando retos completados:', error);
        return [];
    }
}

function formatDate(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short'
    });
}

// Funciones adicionales
window.shareChallenge = function(challengeId) {
    const challenge = challengesState.todayChallenge;
    if (!challenge) return;
    
    const userLevel = challengesState.userLevel;
    const levelData = challenge.levels[userLevel];
    
    const text = `🏆 Mi reto de hoy en EntrenoApp:\n${challenge.icon} ${challenge.name}\nObjetivo: ${levelData.target} ${levelData.unit}\n\n¿Te animas a intentarlo? #EntrenoApp #RetosDiarios`;
    
    if (navigator.share) {
        navigator.share({
            title: 'Reto Diario - EntrenoApp',
            text: text
        });
    } else {
        navigator.clipboard.writeText(text).then(() => {
            showToast('Reto copiado al portapapeles', 'success');
        });
    }
};

window.skipChallenge = function(challengeId) {
    // Generar nuevo reto
    generateTodayChallenge();
    renderChallengesPage();
    showToast('Nuevo reto generado', 'info');
};

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

console.log('🏆 Componente de retos diarios cargado');
