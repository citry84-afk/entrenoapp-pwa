// Sistema de estadísticas de progreso para EntrenoApp
import { auth, db } from '../config/firebase-config.js';
import { 
    collection,
    query,
    where,
    orderBy,
    limit,
    getDocs,
    doc,
    getDoc
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

let progressStatsState = {
    isLoading: false,
    userStats: null,
    recentWorkouts: [],
    weeklyProgress: [],
    achievements: []
};

// ===================================
// INICIALIZACIÓN
// ===================================

window.renderProgressStats = async function() {
    console.log('📊 Renderizando estadísticas de progreso');
    
    try {
        progressStatsState.isLoading = true;
        
        // Cargar datos del usuario
        await loadUserStats();
        await loadRecentWorkouts();
        await loadWeeklyProgress();
        
        // Renderizar interfaz
        renderStatsPage();
        
    } catch (error) {
        console.error('❌ Error cargando estadísticas:', error);
        showError('Error cargando estadísticas');
    } finally {
        progressStatsState.isLoading = false;
    }
};

// ===================================
// CARGA DE DATOS
// ===================================

async function loadUserStats() {
    try {
        const user = auth.currentUser;
        if (!user) return;
        
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
            const userData = userDoc.data();
            progressStatsState.userStats = {
                totalWorkouts: userData.totalWorkouts || 0,
                totalPoints: userData.totalPoints || 0,
                currentStreak: userData.currentStreak || 0,
                level: userData.level || 1,
                joinDate: userData.joinDate?.toDate() || new Date()
            };
        }
    } catch (error) {
        console.error('❌ Error cargando estadísticas del usuario:', error);
    }
}

async function loadRecentWorkouts() {
    try {
        const user = auth.currentUser;
        if (!user) return;
        
        const workoutsQuery = query(
            collection(db, 'user-workouts'),
            where('userId', '==', user.uid),
            orderBy('date', 'desc'),
            limit(10)
        );
        
        const workoutsSnap = await getDocs(workoutsQuery);
        progressStatsState.recentWorkouts = [];
        
        workoutsSnap.forEach(doc => {
            const data = doc.data();
            progressStatsState.recentWorkouts.push({
                id: doc.id,
                type: data.type,
                title: data.title,
                date: data.date?.toDate() || new Date(),
                duration: data.duration || 0,
                points: data.points || 0
            });
        });
    } catch (error) {
        console.error('❌ Error cargando entrenamientos recientes:', error);
    }
}

async function loadWeeklyProgress() {
    try {
        // Generar datos de progreso semanal (placeholder)
        const today = new Date();
        const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
        
        progressStatsState.weeklyProgress = [
            { day: 'Lun', workouts: 1, points: 15 },
            { day: 'Mar', workouts: 0, points: 0 },
            { day: 'Mié', workouts: 1, points: 20 },
            { day: 'Jue', workouts: 1, points: 18 },
            { day: 'Vie', workouts: 0, points: 0 },
            { day: 'Sáb', workouts: 1, points: 25 },
            { day: 'Dom', workouts: 0, points: 0 }
        ];
    } catch (error) {
        console.error('❌ Error cargando progreso semanal:', error);
    }
}

// ===================================
// RENDERIZADO
// ===================================

function renderStatsPage() {
    const container = document.querySelector('.dashboard-container');
    if (!container) return;
    
    container.innerHTML = `
        <div class="progress-stats-container">
            <!-- Botón atrás -->
            <div class="back-button-container">
                <button class="back-button glass-button" onclick="window.navigateBack()">
                    <span class="back-icon">←</span>
                    <span class="back-text">Atrás</span>
                </button>
            </div>
            
            <!-- Header -->
            <div class="stats-header text-center mb-lg">
                <h1 class="page-title">📊 Mis Estadísticas</h1>
                <p class="page-subtitle text-secondary">Tu progreso y rendimiento</p>
            </div>
            
            <!-- Estadísticas generales -->
            <div class="stats-overview glass-card mb-lg">
                <h3 class="section-title mb-md">📈 Resumen General</h3>
                <div class="stats-grid">
                    <div class="stat-item">
                        <div class="stat-icon">🏋️‍♂️</div>
                        <div class="stat-value">${progressStatsState.userStats?.totalWorkouts || 0}</div>
                        <div class="stat-label">Entrenamientos</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-icon">⭐</div>
                        <div class="stat-value">${progressStatsState.userStats?.totalPoints || 0}</div>
                        <div class="stat-label">Puntos</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-icon">🔥</div>
                        <div class="stat-value">${progressStatsState.userStats?.currentStreak || 0}</div>
                        <div class="stat-label">Racha</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-icon">📅</div>
                        <div class="stat-value">${getDaysAsMember(progressStatsState.userStats?.joinDate)}</div>
                        <div class="stat-label">Días activo</div>
                    </div>
                </div>
            </div>
            
            <!-- Progreso semanal -->
            <div class="weekly-progress glass-card mb-lg">
                <h3 class="section-title mb-md">📅 Progreso Semanal</h3>
                <div class="progress-chart">
                    ${renderWeeklyChart()}
                </div>
            </div>
            
            <!-- Entrenamientos recientes -->
            <div class="recent-workouts glass-card">
                <h3 class="section-title mb-md">🏃‍♂️ Entrenamientos Recientes</h3>
                <div class="workouts-list">
                    ${renderRecentWorkoutsList()}
                </div>
            </div>
        </div>
    `;
}

function renderWeeklyChart() {
    const maxWorkouts = Math.max(...progressStatsState.weeklyProgress.map(d => d.workouts));
    
    return `
        <div class="chart-container">
            ${progressStatsState.weeklyProgress.map(day => `
                <div class="chart-day">
                    <div class="chart-bar" style="height: ${maxWorkouts > 0 ? (day.workouts / maxWorkouts) * 100 : 0}%"></div>
                    <div class="chart-label">${day.day}</div>
                    <div class="chart-value">${day.workouts}</div>
                </div>
            `).join('')}
        </div>
    `;
}

function renderRecentWorkoutsList() {
    if (progressStatsState.recentWorkouts.length === 0) {
        return '<div class="empty-state text-center">No hay entrenamientos recientes</div>';
    }
    
    return `
        <div class="workouts-timeline">
            ${progressStatsState.recentWorkouts.map(workout => `
                <div class="workout-item">
                    <div class="workout-icon">${getWorkoutIcon(workout.type)}</div>
                    <div class="workout-info">
                        <div class="workout-title">${workout.title}</div>
                        <div class="workout-meta">
                            <span class="workout-date">${formatDate(workout.date)}</span>
                            <span class="workout-duration">${formatDuration(workout.duration)}</span>
                        </div>
                    </div>
                    <div class="workout-points">+${workout.points}</div>
                </div>
            `).join('')}
        </div>
    `;
}

// ===================================
// FUNCIONES AUXILIARES
// ===================================

function getWorkoutIcon(type) {
    const icons = {
        'gym': '🏋️‍♂️',
        'functional': '⚡',
        'running': '🏃‍♂️'
    };
    return icons[type] || '💪';
}

function formatDate(date) {
    return date.toLocaleDateString('es-ES', { 
        day: 'numeric', 
        month: 'short' 
    });
}

function formatDuration(ms) {
    const minutes = Math.floor(ms / 60000);
    return `${minutes}min`;
}

function getDaysAsMember(joinDate) {
    if (!joinDate) return 0;
    const today = new Date();
    const diffTime = Math.abs(today - joinDate);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

function showError(message) {
    console.error('❌ Error:', message);
    alert(message);
}

console.log('📊 Sistema de estadísticas cargado');
