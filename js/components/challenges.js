// Sistema completo de retos diarios para EntrenoApp
import { auth, db } from '../config/firebase-config.js';
import { 
    doc, 
    collection,
    addDoc,
    updateDoc,
    getDoc,
    setDoc,
    query,
    where,
    orderBy,
    limit,
    getDocs,
    serverTimestamp,
    increment
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// Estado global del sistema de retos
let challengesState = {
    currentMode: 'daily',
    todayChallenge: null,
    userLevel: 'beginner',
    userGender: null,
    userStats: {
        totalChallenges: 0,
        challengesCompleted: 0,
        currentStreak: 0,
        longestStreak: 0,
        totalPoints: 0,
        level: 1
    },
    isActive: false,
    isPaused: false,
    currentProgress: 0,
    targetValue: 0,
    challengeTimer: 0,
    intervalId: null,
    isVoiceEnabled: true,
    completedChallenges: []
};

// Base de datos de retos diarios
const DAILY_CHALLENGES = {
    cardio: [
        {
            id: 'jumping_jacks',
            name: 'Jumping Jacks',
            description: 'Salta abriendo y cerrando brazos y piernas',
            type: 'reps',
            icon: '🤸‍♂️',
            category: 'cardio',
            difficulty: {
                beginner: { target: 30, points: 10 },
                intermediate: { target: 50, points: 15 },
                advanced: { target: 80, points: 20 }
            },
            instructions: [
                'Comienza de pie con los pies juntos',
                'Salta separando las piernas y levantando los brazos',
                'Vuelve a la posición inicial',
                'Mantén un ritmo constante'
            ],
            tips: 'Aterriza suavemente para proteger las articulaciones'
        },
        {
            id: 'burpees',
            name: 'Burpees',
            description: 'Ejercicio completo de cuerpo',
            type: 'reps',
            icon: '🤸',
            category: 'cardio',
            difficulty: {
                beginner: { target: 5, points: 15 },
                intermediate: { target: 10, points: 25 },
                advanced: { target: 15, points: 35 }
            },
            instructions: [
                'Comienza de pie',
                'Baja en cuclillas y apoya las manos',
                'Salta hacia atrás en plancha',
                'Salta hacia adelante y salta arriba'
            ],
            tips: 'Mantén el core activado durante todo el movimiento'
        }
    ],
    strength: [
        {
            id: 'push_ups',
            name: 'Flexiones',
            description: 'Flexiones de pecho tradicionales',
            type: 'reps',
            icon: '💪',
            category: 'strength',
            difficulty: {
                beginner: { target: 8, points: 12 },
                intermediate: { target: 15, points: 20 },
                advanced: { target: 25, points: 30 }
            },
            instructions: [
                'Comienza en posición de plancha',
                'Baja el pecho hacia el suelo',
                'Empuja hacia arriba manteniendo el cuerpo recto',
                'Mantén el core activado'
            ],
            tips: 'Si es muy difícil, apoya las rodillas en el suelo'
        },
        {
            id: 'squats',
            name: 'Sentadillas',
            description: 'Sentadillas con peso corporal',
            type: 'reps',
            icon: '🦵',
            category: 'strength',
            difficulty: {
                beginner: { target: 15, points: 10 },
                intermediate: { target: 25, points: 15 },
                advanced: { target: 40, points: 25 }
            },
            instructions: [
                'Pies separados al ancho de hombros',
                'Baja como si te fueras a sentar',
                'Mantén la espalda recta',
                'Sube empujando con los talones'
            ],
            tips: 'Las rodillas deben seguir la dirección de los pies'
        },
        {
            id: 'plank',
            name: 'Plancha',
            description: 'Mantén la posición de plancha',
            type: 'time',
            icon: '⚡',
            category: 'strength',
            difficulty: {
                beginner: { target: 20, points: 10 },
                intermediate: { target: 45, points: 18 },
                advanced: { target: 75, points: 30 }
            },
            instructions: [
                'Apoya antebrazos y puntas de pies',
                'Mantén el cuerpo en línea recta',
                'Activa el core y glúteos',
                'Respira normalmente'
            ],
            tips: 'No dejes que las caderas suban o bajen'
        }
    ],
    endurance: [
        {
            id: 'mountain_climbers',
            name: 'Escaladores',
            description: 'Simula escalar una montaña',
            type: 'reps',
            icon: '🏔️',
            category: 'endurance',
            difficulty: {
                beginner: { target: 20, points: 12 },
                intermediate: { target: 35, points: 20 },
                advanced: { target: 50, points: 28 }
            },
            instructions: [
                'Comienza en posición de plancha',
                'Alterna llevando las rodillas al pecho',
                'Mantén las caderas estables',
                'Ritmo rápido y controlado'
            ],
            tips: 'Mantén el peso en las manos, no en los pies'
        }
    ]
};

// Inicializar componente
window.initChallenges = function() {
    console.log('🎯 Inicializando sistema de retos diarios');
    loadUserChallengeData();
    generateTodayChallenge();
    renderChallengesPage();
    setupChallengeListeners();
};

// Cargar datos del usuario
async function loadUserChallengeData() {
    try {
        const user = auth.currentUser;
        if (!user) return;
        
        if (window.getUserProfile) {
            const profile = await window.getUserProfile(user.uid);
            if (profile) {
                challengesState.userLevel = profile.preferences?.experience || 'beginner';
                challengesState.userGender = profile.preferences?.gender || null;
                challengesState.isVoiceEnabled = profile.preferences?.ttsEnabled !== false;
                challengesState.userStats = {
                    ...challengesState.userStats,
                    ...profile.stats
                };
            }
        }
        
        await loadTodayProgress();
        
    } catch (error) {
        console.error('❌ Error cargando datos de retos:', error);
    }
}

// Cargar progreso de hoy
async function loadTodayProgress() {
    try {
        const user = auth.currentUser;
        if (!user) return;
        
        const today = new Date().toISOString().split('T')[0];
        const progressDoc = doc(db, 'daily-challenges', `${user.uid}_${today}`);
        const progressSnap = await getDoc(progressDoc);
        
        if (progressSnap.exists()) {
            const data = progressSnap.data();
            challengesState.completedChallenges = data.completed || [];
        }
        
    } catch (error) {
        console.error('❌ Error cargando progreso del día:', error);
    }
}

// Generar reto del día
function generateTodayChallenge() {
    const today = new Date();
    const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
    
    const categories = Object.keys(DAILY_CHALLENGES);
    const selectedCategory = categories[dayOfYear % categories.length];
    const categoryExercises = DAILY_CHALLENGES[selectedCategory];
    const selectedExercise = categoryExercises[dayOfYear % categoryExercises.length];
    
    const userDifficulty = selectedExercise.difficulty[challengesState.userLevel];
    
    challengesState.todayChallenge = {
        ...selectedExercise,
        target: userDifficulty.target,
        points: userDifficulty.points,
        date: today.toISOString().split('T')[0],
        completed: challengesState.completedChallenges.includes(selectedExercise.id)
    };
    
    console.log('🎯 Reto del día generado:', challengesState.todayChallenge);
}

// Renderizar página principal
function renderChallengesPage() {
    const container = document.querySelector('.challenges-container');
    if (!container) return;
    
    let content = '';
    
    switch (challengesState.currentMode) {
        case 'daily':
            content = renderDailyChallenge();
            break;
        case 'weekly':
            content = renderWeeklyProgress();
            break;
        case 'ranking':
            content = renderRanking();
            break;
        case 'history':
            content = renderHistory();
            break;
        default:
            content = renderDailyChallenge();
    }
    
    container.innerHTML = content;
}

// Renderizar reto diario
function renderDailyChallenge() {
    const challenge = challengesState.todayChallenge;
    if (!challenge) {
        return '<div class="error">❌ No se pudo cargar el reto del día</div>';
    }
    
    return `
        <div class="daily-challenge glass-fade-in">
            <div class="challenge-header text-center mb-lg">
                <h2 class="page-title">🎯 Reto Diario</h2>
                <p class="page-subtitle text-secondary">${new Date().toLocaleDateString('es-ES', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                })}</p>
            </div>
            
            <div class="challenge-tabs glass-card mb-lg">
                <div class="tabs-nav">
                    <button class="tab-btn active" data-tab="daily">
                        <span class="tab-icon">🎯</span>
                        <span class="tab-text">Hoy</span>
                    </button>
                    <button class="tab-btn" data-tab="weekly">
                        <span class="tab-icon">📊</span>
                        <span class="tab-text">Semana</span>
                    </button>
                    <button class="tab-btn" data-tab="ranking">
                        <span class="tab-icon">🏆</span>
                        <span class="tab-text">Ranking</span>
                    </button>
                    <button class="tab-btn" data-tab="history">
                        <span class="tab-icon">📝</span>
                        <span class="tab-text">Historial</span>
                    </button>
                </div>
            </div>
            
            ${challenge.completed ? renderCompletedChallenge() : renderActiveChallenge()}
            
            <div class="user-stats glass-card mb-lg">
                <h3 class="section-title mb-md">📊 Tus Estadísticas</h3>
                <div class="stats-grid">
                    <div class="stat-item">
                        <div class="stat-value">${challengesState.userStats.currentStreak}</div>
                        <div class="stat-label">Racha Actual</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${challengesState.userStats.challengesCompleted}</div>
                        <div class="stat-label">Completados</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${challengesState.userStats.totalPoints}</div>
                        <div class="stat-label">Puntos</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${challengesState.userStats.level}</div>
                        <div class="stat-label">Nivel</div>
                    </div>
                </div>
            </div>
            
            ${renderDifficultySelector()}
            ${renderUpcomingChallenges()}
        </div>
    `;
}

// Renderizar reto completado
function renderCompletedChallenge() {
    const challenge = challengesState.todayChallenge;
    
    return `
        <div class="completed-challenge glass-card mb-lg">
            <div class="completion-header text-center mb-lg">
                <div class="completion-icon mb-md">🏆</div>
                <h3 class="completion-title">¡Reto Completado!</h3>
                <p class="completion-subtitle text-secondary">¡Excelente trabajo hoy!</p>
            </div>
            
            <div class="challenge-summary">
                <div class="challenge-card completed">
                    <div class="challenge-icon">${challenge.icon}</div>
                    <div class="challenge-info">
                        <h4 class="challenge-name">${challenge.name}</h4>
                        <p class="challenge-description">${challenge.description}</p>
                        <div class="challenge-target">
                            ${challenge.type === 'reps' ? 
                                `✅ ${challenge.target} repeticiones` : 
                                `✅ ${formatTime(challenge.target)}`
                            }
                        </div>
                    </div>
                    <div class="challenge-points">
                        <span class="points-value">+${challenge.points}</span>
                        <span class="points-label">puntos</span>
                    </div>
                </div>
            </div>
            
            <div class="next-challenge-info text-center">
                <p class="text-secondary">Tu próximo reto estará disponible mañana</p>
                <div class="countdown-timer">
                    ${getTimeUntilNextChallenge()}
                </div>
            </div>
        </div>
    `;
}

// Renderizar reto activo
function renderActiveChallenge() {
    const challenge = challengesState.todayChallenge;
    
    return `
        <div class="active-challenge glass-card mb-lg">
            <div class="challenge-info-card">
                <div class="challenge-header-info">
                    <div class="challenge-icon-large">${challenge.icon}</div>
                    <div class="challenge-details">
                        <h3 class="challenge-name">${challenge.name}</h3>
                        <p class="challenge-description">${challenge.description}</p>
                        <div class="challenge-category">
                            <span class="category-tag ${challenge.category}">${challenge.category}</span>
                            <span class="difficulty-tag ${challengesState.userLevel}">${challengesState.userLevel}</span>
                        </div>
                    </div>
                </div>
                
                <div class="challenge-target-info">
                    <div class="target-display">
                        <span class="target-label">Objetivo:</span>
                        <span class="target-value">
                            ${challenge.type === 'reps' ? 
                                `${challenge.target} repeticiones` : 
                                `${formatTime(challenge.target)}`
                            }
                        </span>
                    </div>
                    <div class="points-display">
                        <span class="points-icon">⭐</span>
                        <span class="points-text">${challenge.points} puntos</span>
                    </div>
                </div>
            </div>
            
            ${challengesState.isActive ? renderChallengeProgress() : ''}
            
            <div class="challenge-instructions">
                <h4 class="instructions-title">📋 Instrucciones</h4>
                <ol class="instructions-list">
                    ${challenge.instructions.map(instruction => 
                        `<li class="instruction-item">${instruction}</li>`
                    ).join('')}
                </ol>
                ${challenge.tips ? `
                    <div class="challenge-tip">
                        <span class="tip-icon">💡</span>
                        <span class="tip-text">${challenge.tips}</span>
                    </div>
                ` : ''}
            </div>
            
            <div class="challenge-controls">
                ${!challengesState.isActive ? `
                    <button id="start-challenge" class="glass-button glass-button-primary btn-full">
                        🚀 Iniciar Reto
                    </button>
                ` : `
                    <div class="active-controls">
                        <button id="pause-challenge" class="glass-button glass-button-secondary">
                            ${challengesState.isPaused ? '▶️ Reanudar' : '⏸️ Pausar'}
                        </button>
                        <button id="complete-challenge" class="glass-button glass-button-primary">
                            ✅ Completar
                        </button>
                        <button id="stop-challenge" class="glass-button glass-button-danger">
                            ❌ Parar
                        </button>
                    </div>
                `}
            </div>
        </div>
    `;
}

// Renderizar progreso del reto
function renderChallengeProgress() {
    const challenge = challengesState.todayChallenge;
    const progressPercentage = (challengesState.currentProgress / challengesState.targetValue) * 100;
    
    return `
        <div class="challenge-progress">
            <div class="progress-header">
                <h4 class="progress-title">📊 Progreso en Tiempo Real</h4>
                <div class="progress-timer" id="challenge-timer">
                    ${formatTime(challengesState.challengeTimer)}
                </div>
            </div>
            
            <div class="progress-display">
                <div class="progress-bar-container">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${Math.min(progressPercentage, 100)}%"></div>
                    </div>
                    <div class="progress-text">
                        ${challenge.type === 'reps' ? 
                            `${challengesState.currentProgress} / ${challengesState.targetValue}` :
                            `${formatTime(challengesState.currentProgress)} / ${formatTime(challengesState.targetValue)}`
                        }
                    </div>
                </div>
                
                ${challenge.type === 'reps' ? `
                    <div class="rep-counter">
                        <button id="add-rep" class="rep-btn glass-button">+1</button>
                        <div class="current-reps">${challengesState.currentProgress}</div>
                        <button id="subtract-rep" class="rep-btn glass-button">-1</button>
                    </div>
                ` : ''}
            </div>
        </div>
    `;
}

// Renderizar selector de dificultad
function renderDifficultySelector() {
    const challenge = challengesState.todayChallenge;
    
    return `
        <div class="difficulty-selector glass-card mb-lg">
            <h3 class="section-title mb-md">⚙️ Niveles Disponibles</h3>
            <div class="difficulty-options">
                ${Object.entries(challenge.difficulty).map(([level, data]) => `
                    <div class="difficulty-option ${level === challengesState.userLevel ? 'selected' : ''}" 
                         data-level="${level}">
                        <div class="difficulty-header">
                            <span class="difficulty-name">${level}</span>
                            <span class="difficulty-points">+${data.points} pts</span>
                        </div>
                        <div class="difficulty-target">
                            ${challenge.type === 'reps' ? 
                                `${data.target} reps` : 
                                `${formatTime(data.target)}`
                            }
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// Renderizar próximos retos
function renderUpcomingChallenges() {
    const upcomingChallenges = generateUpcomingChallenges(3);
    
    return `
        <div class="upcoming-challenges glass-card">
            <h3 class="section-title mb-md">🔮 Próximos Retos</h3>
            <div class="upcoming-list">
                ${upcomingChallenges.map((challenge, index) => `
                    <div class="upcoming-item">
                        <div class="upcoming-date">
                            ${new Date(Date.now() + (index + 1) * 24 * 60 * 60 * 1000).toLocaleDateString('es-ES', { 
                                weekday: 'short', 
                                month: 'short', 
                                day: 'numeric' 
                            })}
                        </div>
                        <div class="upcoming-challenge">
                            <span class="upcoming-icon">${challenge.icon}</span>
                            <span class="upcoming-name">${challenge.name}</span>
                        </div>
                        <div class="upcoming-category">
                            <span class="category-tag ${challenge.category}">${challenge.category}</span>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// ===================================
// FUNCIONES DE CONTROL DEL RETO
// ===================================

// Iniciar reto
async function startChallenge() {
    try {
        console.log('🚀 Iniciando reto del día');
        
        const challenge = challengesState.todayChallenge;
        if (!challenge) throw new Error('No hay reto disponible');
        
        challengesState.isActive = true;
        challengesState.isPaused = false;
        challengesState.challengeStartTime = Date.now();
        challengesState.currentProgress = 0;
        challengesState.targetValue = challenge.target;
        challengesState.challengeTimer = 0;
        
        if (challenge.type === 'time') {
            startChallengeTimer();
        }
        
        if (challengesState.isVoiceEnabled && window.EntrenoTTS) {
            window.EntrenoTTS.speak(`¡Reto iniciado! ${challenge.name}.`);
        }
        
        renderChallengesPage();
        
    } catch (error) {
        console.error('❌ Error iniciando reto:', error);
        showError('Error iniciando el reto');
    }
}

// Completar reto
async function completeChallenge() {
    try {
        console.log('✅ Función completeChallenge llamada');
        console.log('✅ Completando reto del día');
        
        const challenge = challengesState.todayChallenge;
        if (!challenge) return;
        
        challengesState.isActive = false;
        challengesState.challengeEndTime = Date.now();
        
        const completionData = {
            challengeId: challenge.id,
            completed: true,
            points: challenge.points,
            level: challengesState.userLevel,
            date: new Date().toISOString().split('T')[0]
        };
        
        await saveChallengeCompletion(completionData);
        
        challenge.completed = true;
        challengesState.completedChallenges.push(challenge.id);
        challengesState.userStats.challengesCompleted++;
        challengesState.userStats.totalPoints += challenge.points;
        challengesState.userStats.currentStreak++;
        
        if (challengesState.isVoiceEnabled && window.EntrenoTTS) {
            window.EntrenoTTS.speak(`¡Reto completado! Has ganado ${challenge.points} puntos.`);
        }
        
        if (challengesState.intervalId) {
            clearInterval(challengesState.intervalId);
            challengesState.intervalId = null;
        }
        
        renderChallengesPage();
        
    } catch (error) {
        console.error('❌ Error completando reto:', error);
        showError('Error guardando el reto completado');
    }
}

// Guardar completación del reto
async function saveChallengeCompletion(completionData) {
    try {
        const user = auth.currentUser;
        if (!user) throw new Error('Usuario no autenticado');
        
        const today = new Date().toISOString().split('T')[0];
        const dailyDoc = doc(db, 'daily-challenges', `${user.uid}_${today}`);
        
        await setDoc(dailyDoc, {
            userId: user.uid,
            date: today,
            challenge: completionData,
            completed: [completionData.challengeId],
            totalPoints: completionData.points,
            createdAt: serverTimestamp()
        }, { merge: true });
        
        const userDoc = doc(db, 'users', user.uid);
        await updateDoc(userDoc, {
            'stats.challengesCompleted': increment(1),
            'stats.totalPoints': increment(completionData.points),
            'stats.currentStreak': increment(1),
            'updatedAt': serverTimestamp()
        });
        
        console.log('✅ Reto guardado en Firestore');
        
    } catch (error) {
        console.error('❌ Error guardando reto:', error);
        throw error;
    }
}

// ===================================
// FUNCIONES AUXILIARES
// ===================================

// Configurar listeners
function setupChallengeListeners() {
    document.addEventListener('click', (e) => {
        const target = e.target.closest('button, .tab-btn, .difficulty-option');
        if (!target) return;
        
        if (target.classList.contains('tab-btn')) {
            e.preventDefault();
            switchTab(target.dataset.tab);
        }
        
        if (target.id === 'start-challenge') {
            e.preventDefault();
            startChallenge();
        } else if (target.id === 'complete-challenge') {
            e.preventDefault();
            console.log('🎯 Botón completar reto presionado');
            completeChallenge();
        } else if (target.id === 'add-rep') {
            e.preventDefault();
            addRep();
        } else if (target.id === 'subtract-rep') {
            e.preventDefault();
            subtractRep();
        }
        
        if (target.classList.contains('difficulty-option')) {
            e.preventDefault();
            selectDifficulty(target.dataset.level);
        }
    });
}

function switchTab(tab) {
    challengesState.currentMode = tab;
    renderChallengesPage();
}

function selectDifficulty(level) {
    if (challengesState.isActive) return;
    challengesState.userLevel = level;
    generateTodayChallenge();
    renderChallengesPage();
}

function addRep() {
    if (!challengesState.isActive) return;
    challengesState.currentProgress++;
    
    if (challengesState.currentProgress >= challengesState.targetValue) {
        completeChallenge();
    } else {
        updateProgressDisplay();
    }
}

function subtractRep() {
    if (!challengesState.isActive || challengesState.currentProgress <= 0) return;
    challengesState.currentProgress--;
    updateProgressDisplay();
}

function startChallengeTimer() {
    challengesState.intervalId = setInterval(() => {
        if (!challengesState.isPaused) {
            challengesState.challengeTimer++;
            challengesState.currentProgress = challengesState.challengeTimer;
            
            if (challengesState.currentProgress >= challengesState.targetValue) {
                completeChallenge();
                return;
            }
            
            updateProgressDisplay();
        }
    }, 1000);
}

function updateProgressDisplay() {
    const progressFill = document.querySelector('.progress-fill');
    const progressText = document.querySelector('.progress-text');
    const currentReps = document.querySelector('.current-reps');
    
    const challenge = challengesState.todayChallenge;
    const progressPercentage = (challengesState.currentProgress / challengesState.targetValue) * 100;
    
    if (progressFill) {
        progressFill.style.width = `${Math.min(progressPercentage, 100)}%`;
    }
    
    if (progressText) {
        progressText.textContent = challenge.type === 'reps' ? 
            `${challengesState.currentProgress} / ${challengesState.targetValue}` :
            `${formatTime(challengesState.currentProgress)} / ${formatTime(challengesState.targetValue)}`;
    }
    
    if (currentReps) {
        currentReps.textContent = challengesState.currentProgress;
    }
}

function generateUpcomingChallenges(days) {
    const upcoming = [];
    const categories = Object.keys(DAILY_CHALLENGES);
    
    for (let i = 1; i <= days; i++) {
        const futureDate = new Date(Date.now() + i * 24 * 60 * 60 * 1000);
        const dayOfYear = Math.floor((futureDate - new Date(futureDate.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
        
        const selectedCategory = categories[dayOfYear % categories.length];
        const categoryExercises = DAILY_CHALLENGES[selectedCategory];
        const selectedExercise = categoryExercises[dayOfYear % categoryExercises.length];
        
        upcoming.push(selectedExercise);
    }
    
    return upcoming;
}

function formatTime(seconds) {
    if (seconds < 60) {
        return `${seconds}s`;
    } else {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
    }
}

function getTimeUntilNextChallenge() {
    const now = new Date();
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const timeDiff = tomorrow - now;
    
    const hours = Math.floor(timeDiff / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
}

// Funciones placeholder para otras vistas
function renderWeeklyProgress() {
    return `
        <div class="weekly-progress glass-fade-in">
            <div class="placeholder-content">
                <h2 class="page-title">📊 Progreso Semanal</h2>
                <p class="text-secondary">Próximamente: análisis semanal detallado</p>
            </div>
        </div>
    `;
}

function renderRanking() {
    return `
        <div class="ranking-view glass-fade-in">
            <div class="placeholder-content">
                <h2 class="page-title">🏆 Ranking Global</h2>
                <p class="text-secondary">Próximamente: ranking en tiempo real</p>
            </div>
        </div>
    `;
}

function renderHistory() {
    return `
        <div class="history-view glass-fade-in">
            <div class="placeholder-content">
                <h2 class="page-title">📝 Historial</h2>
                <p class="text-secondary">Próximamente: historial completo de retos</p>
            </div>
        </div>
    `;
}

function showError(message) {
    console.error('❌', message);
    alert(message);
}

console.log('🎯 Módulo de retos diarios cargado');
