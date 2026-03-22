// Dashboard de estadísticas de salud para EntrenoApp
class HealthDashboard {
    constructor() {
        this.healthData = {};
        this.achievements = [];
        this.goals = {};
        this.history = [];
        this.charts = {};
        this.init();
    }

    async init() {
        await this.loadData();
        this.render();
        this.setupEventListeners();
    }

    async loadData() {
        if (window.healthManager) {
            this.healthData = window.healthManager.getHealthData();
            this.achievements = window.healthManager.getAchievements();
            this.goals = window.healthManager.getGoals();
            this.history = window.healthManager.getHealthHistory(7);
        }
    }

    render() {
        const container = document.getElementById('health-dashboard-container');
        if (!container) return;

        container.innerHTML = `
            <div class="health-dashboard glass-fade-in">
                <!-- Header -->
                <div class="health-header glass-card">
                    <h2>🏥 Mi Salud</h2>
                    <p>Seguimiento completo de tu actividad y bienestar</p>
                    <div class="health-status">
                        <div class="status-indicator ${this.getHealthStatus().class}">
                            <span class="status-icon">${this.getHealthStatus().icon}</span>
                            <span class="status-text">${this.getHealthStatus().text}</span>
                        </div>
                    </div>
                </div>

                <!-- Métricas Principales -->
                <div class="health-metrics">
                    ${this.renderMainMetrics()}
                </div>

                <!-- Progreso de Objetivos -->
                <div class="goals-progress glass-card">
                    <h3>🎯 Progreso de Objetivos</h3>
                    ${this.renderGoalsProgress()}
                </div>

                <!-- Logros Recientes -->
                <div class="recent-achievements glass-card">
                    <h3>🏆 Logros Recientes</h3>
                    ${this.renderRecentAchievements()}
                </div>

                <!-- Gráficos de Tendencia -->
                <div class="health-trends glass-card">
                    <h3>📈 Tendencias de Salud</h3>
                    ${this.renderHealthTrends()}
                </div>

                <!-- Acciones -->
                <div class="health-actions">
                    <button class="glass-button glass-button-primary" onclick="window.healthDashboard.showDetailedStats()">
                        📊 Ver Estadísticas Detalladas
                    </button>
                    <button class="glass-button glass-button-secondary" onclick="window.healthDashboard.showAchievements()">
                        🏆 Todos los Logros
                    </button>
                    <button class="glass-button glass-button-secondary" onclick="window.healthDashboard.updateGoals()">
                        ⚙️ Configurar Objetivos
                    </button>
                </div>
            </div>
        `;
    }

    renderMainMetrics() {
        return `
            <div class="metrics-grid">
                <div class="metric-card steps-card">
                    <div class="metric-icon">👣</div>
                    <div class="metric-content">
                        <div class="metric-value">${this.healthData.steps.toLocaleString()}</div>
                        <div class="metric-label">Pasos</div>
                        <div class="metric-progress">
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${Math.min((this.healthData.steps / this.goals.dailySteps) * 100, 100)}%"></div>
                            </div>
                            <span class="progress-text">${Math.round((this.healthData.steps / this.goals.dailySteps) * 100)}% del objetivo</span>
                        </div>
                    </div>
                </div>

                <div class="metric-card distance-card">
                    <div class="metric-icon">🗺️</div>
                    <div class="metric-content">
                        <div class="metric-value">${this.healthData.distance} km</div>
                        <div class="metric-label">Distancia</div>
                        <div class="metric-subtitle">Hoy</div>
                    </div>
                </div>

                <div class="metric-card calories-card">
                    <div class="metric-icon">🔥</div>
                    <div class="metric-content">
                        <div class="metric-value">${this.healthData.caloriesBurned}</div>
                        <div class="metric-label">Calorías</div>
                        <div class="metric-subtitle">Quemadas hoy</div>
                    </div>
                </div>

                <div class="metric-card heart-card">
                    <div class="metric-icon">❤️</div>
                    <div class="metric-content">
                        <div class="metric-value">${this.healthData.heartRate}</div>
                        <div class="metric-label">BPM</div>
                        <div class="metric-subtitle">Promedio</div>
                    </div>
                </div>

                <div class="metric-card sleep-card">
                    <div class="metric-icon">😴</div>
                    <div class="metric-content">
                        <div class="metric-value">${this.healthData.sleepHours}h</div>
                        <div class="metric-label">Sueño</div>
                        <div class="metric-progress">
                            <div class="progress-bar">
                                <div class="progress-fill ${this.healthData.sleepHours >= this.goals.sleepHours ? 'good' : 'warning'}" 
                                     style="width: ${Math.min((this.healthData.sleepHours / this.goals.sleepHours) * 100, 100)}%"></div>
                            </div>
                            <span class="progress-text">${this.healthData.sleepHours >= this.goals.sleepHours ? 'Objetivo alcanzado' : 'Necesitas más sueño'}</span>
                        </div>
                    </div>
                </div>

                <div class="metric-card activity-card">
                    <div class="metric-icon">⚡</div>
                    <div class="metric-content">
                        <div class="metric-value">${this.healthData.activeMinutes}</div>
                        <div class="metric-label">Minutos</div>
                        <div class="metric-subtitle">Activos hoy</div>
                    </div>
                </div>
            </div>
        `;
    }

    renderGoalsProgress() {
        const stepsProgress = Math.min((this.healthData.steps / this.goals.dailySteps) * 100, 100);
        const sleepProgress = Math.min((this.healthData.sleepHours / this.goals.sleepHours) * 100, 100);
        
        return `
            <div class="goals-grid">
                <div class="goal-item">
                    <div class="goal-header">
                        <span class="goal-icon">👣</span>
                        <span class="goal-name">Pasos Diarios</span>
                    </div>
                    <div class="goal-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${stepsProgress}%"></div>
                        </div>
                        <span class="goal-text">${this.healthData.steps.toLocaleString()} / ${this.goals.dailySteps.toLocaleString()}</span>
                    </div>
                </div>

                <div class="goal-item">
                    <div class="goal-header">
                        <span class="goal-icon">😴</span>
                        <span class="goal-name">Horas de Sueño</span>
                    </div>
                    <div class="goal-progress">
                        <div class="progress-bar">
                            <div class="progress-fill ${sleepProgress >= 100 ? 'good' : 'warning'}" style="width: ${sleepProgress}%"></div>
                        </div>
                        <span class="goal-text">${this.healthData.sleepHours}h / ${this.goals.sleepHours}h</span>
                    </div>
                </div>

                <div class="goal-item">
                    <div class="goal-header">
                        <span class="goal-icon">🏋️‍♂️</span>
                        <span class="goal-name">Entrenamientos Semanales</span>
                    </div>
                    <div class="goal-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${Math.min((this.getWeeklyWorkouts() / this.goals.weeklyWorkouts) * 100, 100)}%"></div>
                        </div>
                        <span class="goal-text">${this.getWeeklyWorkouts()} / ${this.goals.weeklyWorkouts}</span>
                    </div>
                </div>
            </div>
        `;
    }

    renderRecentAchievements() {
        const recentAchievements = this.achievements.slice(-3).reverse();
        
        if (recentAchievements.length === 0) {
            return `
                <div class="no-achievements">
                    <div class="no-achievements-icon">🏆</div>
                    <p>Aún no tienes logros. ¡Sigue entrenando para desbloquearlos!</p>
                </div>
            `;
        }

        return `
            <div class="achievements-list">
                ${recentAchievements.map(achievement => `
                    <div class="achievement-item">
                        <div class="achievement-icon">${achievement.title.split(' ')[0]}</div>
                        <div class="achievement-info">
                            <h4>${achievement.title}</h4>
                            <p>${achievement.description}</p>
                            <div class="achievement-date">${new Date(achievement.date).toLocaleDateString()}</div>
                        </div>
                        <div class="achievement-points">+${achievement.points}</div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    renderHealthTrends() {
        if (this.history.length < 2) {
            return `
                <div class="no-trends">
                    <p>Necesitas más datos para mostrar tendencias. ¡Sigue usando la app!</p>
                </div>
            `;
        }

        return `
            <div class="trends-grid">
                <div class="trend-chart">
                    <h4>👣 Pasos (7 días)</h4>
                    <div class="mini-chart" id="steps-chart">
                        ${this.createMiniChart('steps')}
                    </div>
                </div>

                <div class="trend-chart">
                    <h4>😴 Sueño (7 días)</h4>
                    <div class="mini-chart" id="sleep-chart">
                        ${this.createMiniChart('sleepHours')}
                    </div>
                </div>

                <div class="trend-chart">
                    <h4>⚡ Actividad (7 días)</h4>
                    <div class="mini-chart" id="activity-chart">
                        ${this.createMiniChart('activeMinutes')}
                    </div>
                </div>
            </div>
        `;
    }

    createMiniChart(dataType) {
        const maxValue = Math.max(...this.history.map(h => h[dataType]));
        const minValue = Math.min(...this.history.map(h => h[dataType]));
        const range = maxValue - minValue || 1;

        return `
            <div class="chart-bars">
                ${this.history.map((day, index) => {
                    const height = ((day[dataType] - minValue) / range) * 100;
                    const date = new Date(day.date);
                    const dayName = date.toLocaleDateString('es', { weekday: 'short' });
                    
                    return `
                        <div class="chart-bar" style="height: ${height}%">
                            <div class="bar-value">${Math.round(day[dataType])}</div>
                            <div class="bar-label">${dayName}</div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    getHealthStatus() {
        const score = this.calculateHealthScore();
        
        if (score >= 80) {
            return { class: 'excellent', icon: '🌟', text: 'Excelente' };
        } else if (score >= 60) {
            return { class: 'good', icon: '👍', text: 'Bueno' };
        } else if (score >= 40) {
            return { class: 'average', icon: '😐', text: 'Regular' };
        } else {
            return { class: 'poor', icon: '😟', text: 'Necesita Mejora' };
        }
    }

    calculateHealthScore() {
        let score = 0;
        
        // Pasos (30% del score)
        const stepsScore = Math.min((this.healthData.steps / this.goals.dailySteps) * 100, 100);
        score += stepsScore * 0.3;
        
        // Sueño (25% del score)
        const sleepScore = Math.min((this.healthData.sleepHours / this.goals.sleepHours) * 100, 100);
        score += sleepScore * 0.25;
        
        // Actividad (25% del score)
        const activityScore = Math.min((this.healthData.activeMinutes / 60) * 100, 100);
        score += activityScore * 0.25;
        
        // Frecuencia cardíaca (20% del score)
        const heartRateScore = this.healthData.heartRate >= 60 && this.healthData.heartRate <= 100 ? 100 : 50;
        score += heartRateScore * 0.2;
        
        return Math.round(score);
    }

    getWeeklyWorkouts() {
        // Simular entrenamientos de la semana (en implementación real se obtendría de Firebase)
        return Math.floor(Math.random() * 5) + 1;
    }

    setupEventListeners() {
        // Escuchar actualizaciones de datos de salud
        document.addEventListener('health_data_updated', () => {
            this.loadData();
            this.render();
        });

        // Escuchar nuevos logros
        document.addEventListener('achievement_unlocked', (event) => {
            this.loadData();
            this.render();
        });
    }

    // Métodos públicos
    showDetailedStats() {
        const modal = document.createElement('div');
        modal.className = 'detailed-stats-modal';
        modal.innerHTML = `
            <div class="modal-content glass-effect">
                <div class="modal-header">
                    <h2>📊 Estadísticas Detalladas</h2>
                    <button class="modal-close" onclick="this.closest('.detailed-stats-modal').remove()">×</button>
                </div>
                <div class="modal-body">
                    <div class="stats-tabs">
                        <button class="tab-button active" onclick="window.healthDashboard.switchTab('overview')">Resumen</button>
                        <button class="tab-button" onclick="window.healthDashboard.switchTab('trends')">Tendencias</button>
                        <button class="tab-button" onclick="window.healthDashboard.switchTab('achievements')">Logros</button>
                    </div>
                    <div class="tab-content" id="stats-content">
                        ${this.renderDetailedOverview()}
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    }

    showAchievements() {
        const modal = document.createElement('div');
        modal.className = 'achievements-modal';
        modal.innerHTML = `
            <div class="modal-content glass-effect">
                <div class="modal-header">
                    <h2>🏆 Todos los Logros</h2>
                    <button class="modal-close" onclick="this.closest('.achievements-modal').remove()">×</button>
                </div>
                <div class="modal-body">
                    <div class="achievements-grid">
                        ${this.achievements.map(achievement => `
                            <div class="achievement-card">
                                <div class="achievement-icon">${achievement.title.split(' ')[0]}</div>
                                <h3>${achievement.title}</h3>
                                <p>${achievement.description}</p>
                                <div class="achievement-meta">
                                    <span class="achievement-points">+${achievement.points} puntos</span>
                                    <span class="achievement-date">${new Date(achievement.date).toLocaleDateString()}</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    }

    updateGoals() {
        const modal = document.createElement('div');
        modal.className = 'goals-modal';
        modal.innerHTML = `
            <div class="modal-content glass-effect">
                <div class="modal-header">
                    <h2>⚙️ Configurar Objetivos</h2>
                    <button class="modal-close" onclick="this.closest('.goals-modal').remove()">×</button>
                </div>
                <div class="modal-body">
                    <div class="goals-form">
                        <div class="form-group">
                            <label>Pasos diarios:</label>
                            <input type="number" id="daily-steps" value="${this.goals.dailySteps}" min="1000" max="50000">
                        </div>
                        <div class="form-group">
                            <label>Horas de sueño:</label>
                            <input type="number" id="sleep-hours" value="${this.goals.sleepHours}" min="4" max="12" step="0.5">
                        </div>
                        <div class="form-group">
                            <label>Entrenamientos semanales:</label>
                            <input type="number" id="weekly-workouts" value="${this.goals.weeklyWorkouts}" min="1" max="7">
                        </div>
                        <div class="form-group">
                            <label>Distancia mensual (km):</label>
                            <input type="number" id="monthly-distance" value="${this.goals.monthlyDistance}" min="10" max="500">
                        </div>
                        <button class="glass-button glass-button-primary" onclick="window.healthDashboard.saveGoals()">
                            💾 Guardar Objetivos
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    }

    saveGoals() {
        const newGoals = {
            dailySteps: parseInt(document.getElementById('daily-steps').value),
            sleepHours: parseFloat(document.getElementById('sleep-hours').value),
            weeklyWorkouts: parseInt(document.getElementById('weekly-workouts').value),
            monthlyDistance: parseInt(document.getElementById('monthly-distance').value)
        };

        if (window.healthManager) {
            window.healthManager.updateGoals(newGoals);
        }

        this.loadData();
        this.render();
        
        // Cerrar modal
        document.querySelector('.goals-modal').remove();
        
        // Mostrar confirmación
        alert('✅ Objetivos actualizados correctamente');
    }

    renderDetailedOverview() {
        return `
            <div class="detailed-overview">
                <div class="overview-grid">
                    <div class="overview-card">
                        <h3>📊 Resumen del Día</h3>
                        <div class="overview-stats">
                            <div class="stat-item">
                                <span class="stat-label">Pasos:</span>
                                <span class="stat-value">${this.healthData.steps.toLocaleString()}</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">Distancia:</span>
                                <span class="stat-value">${this.healthData.distance} km</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">Calorías:</span>
                                <span class="stat-value">${this.healthData.caloriesBurned}</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">Actividad:</span>
                                <span class="stat-value">${this.healthData.activeMinutes} min</span>
                            </div>
                        </div>
                    </div>

                    <div class="overview-card">
                        <h3>❤️ Salud Cardiovascular</h3>
                        <div class="heart-rate-info">
                            <div class="heart-rate-value">${this.healthData.heartRate} BPM</div>
                            <div class="heart-rate-status">${this.getHeartRateStatus()}</div>
                        </div>
                    </div>

                    <div class="overview-card">
                        <h3>😴 Calidad del Sueño</h3>
                        <div class="sleep-info">
                            <div class="sleep-value">${this.healthData.sleepHours} horas</div>
                            <div class="sleep-status">${this.getSleepStatus()}</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    getHeartRateStatus() {
        if (this.healthData.heartRate < 60) return 'Bajo (Bradicardia)';
        if (this.healthData.heartRate > 100) return 'Alto (Taquicardia)';
        return 'Normal';
    }

    getSleepStatus() {
        if (this.healthData.sleepHours < 6) return 'Insuficiente';
        if (this.healthData.sleepHours > 9) return 'Excesivo';
        return 'Óptimo';
    }
}

// Instancia global
window.healthDashboard = new HealthDashboard();

// CSS para el dashboard de salud
const healthDashboardStyles = `
<style>
.health-dashboard {
    padding: 20px;
    max-width: 1200px;
    margin: 0 auto;
}

.health-header {
    text-align: center;
    margin-bottom: 30px;
}

.health-header h2 {
    color: #00D4FF;
    margin: 0 0 10px 0;
    font-size: 2rem;
}

.health-status {
    margin-top: 20px;
}

.status-indicator {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 10px 20px;
    border-radius: 25px;
    font-weight: bold;
}

.status-indicator.excellent {
    background: linear-gradient(45deg, #4CAF50, #8BC34A);
    color: white;
}

.status-indicator.good {
    background: linear-gradient(45deg, #2196F3, #00BCD4);
    color: white;
}

.status-indicator.average {
    background: linear-gradient(45deg, #FF9800, #FFC107);
    color: white;
}

.status-indicator.poor {
    background: linear-gradient(45deg, #F44336, #E91E63);
    color: white;
}

.metrics-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
    margin-bottom: 30px;
}

.metric-card {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 15px;
    padding: 20px;
    display: flex;
    align-items: center;
    gap: 15px;
    transition: all 0.3s ease;
}

.metric-card:hover {
    transform: translateY(-5px);
    background: rgba(255, 255, 255, 0.08);
}

.metric-icon {
    font-size: 2.5rem;
    width: 60px;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 212, 255, 0.1);
    border-radius: 15px;
}

.metric-content {
    flex: 1;
}

.metric-value {
    font-size: 1.8rem;
    font-weight: bold;
    color: #00D4FF;
    margin: 0;
}

.metric-label {
    color: #ccc;
    font-size: 0.9rem;
    margin: 5px 0;
}

.metric-subtitle {
    color: #888;
    font-size: 0.8rem;
}

.metric-progress {
    margin-top: 10px;
}

.progress-bar {
    width: 100%;
    height: 6px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
    overflow: hidden;
    margin-bottom: 5px;
}

.progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #00D4FF, #2196F3);
    transition: width 0.3s ease;
}

.progress-fill.good {
    background: linear-gradient(90deg, #4CAF50, #8BC34A);
}

.progress-fill.warning {
    background: linear-gradient(90deg, #FF9800, #FFC107);
}

.progress-text {
    font-size: 0.8rem;
    color: #ccc;
}

.goals-progress, .recent-achievements, .health-trends {
    margin-bottom: 30px;
}

.goals-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 20px;
}

.goal-item {
    padding: 15px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 10px;
}

.goal-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 10px;
}

.goal-icon {
    font-size: 1.5rem;
}

.goal-name {
    font-weight: bold;
    color: #00D4FF;
}

.goal-progress {
    display: flex;
    align-items: center;
    gap: 15px;
}

.goal-progress .progress-bar {
    flex: 1;
    height: 8px;
}

.goal-text {
    font-size: 0.9rem;
    color: #ccc;
    white-space: nowrap;
}

.achievements-list {
    display: flex;
    flex-direction: column;
    gap: 15px;
}

.achievement-item {
    display: flex;
    align-items: center;
    gap: 15px;
    padding: 15px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 10px;
}

.achievement-icon {
    font-size: 2rem;
    width: 50px;
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.achievement-info {
    flex: 1;
}

.achievement-info h4 {
    margin: 0 0 5px 0;
    color: #00D4FF;
}

.achievement-info p {
    margin: 0 0 5px 0;
    color: #ccc;
    font-size: 0.9rem;
}

.achievement-date {
    font-size: 0.8rem;
    color: #888;
}

.achievement-points {
    background: linear-gradient(45deg, #FFD700, #FFA500);
    color: #000;
    padding: 5px 10px;
    border-radius: 15px;
    font-weight: bold;
    font-size: 0.9rem;
}

.trends-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
}

.trend-chart h4 {
    margin: 0 0 15px 0;
    color: #00D4FF;
}

.mini-chart {
    height: 100px;
}

.chart-bars {
    display: flex;
    align-items: end;
    justify-content: space-between;
    height: 100%;
    gap: 5px;
}

.chart-bar {
    flex: 1;
    background: linear-gradient(to top, #00D4FF, #2196F3);
    border-radius: 3px 3px 0 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-end;
    padding: 5px 2px;
    min-height: 20px;
}

.bar-value {
    font-size: 0.7rem;
    color: white;
    font-weight: bold;
    margin-bottom: 2px;
}

.bar-label {
    font-size: 0.6rem;
    color: #ccc;
}

.health-actions {
    display: flex;
    gap: 15px;
    justify-content: center;
    flex-wrap: wrap;
}

.no-achievements, .no-trends {
    text-align: center;
    padding: 40px 20px;
    color: #ccc;
}

.no-achievements-icon {
    font-size: 3rem;
    margin-bottom: 15px;
    opacity: 0.5;
}

/* Modal styles */
.detailed-stats-modal, .achievements-modal, .goals-modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
}

.modal-content {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(20px);
    border-radius: 20px;
    padding: 30px;
    max-width: 90%;
    max-height: 90%;
    overflow-y: auto;
    border: 1px solid rgba(0, 212, 255, 0.3);
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
}

.modal-header h2 {
    color: #00D4FF;
    margin: 0;
}

.modal-close {
    background: none;
    border: none;
    color: white;
    font-size: 24px;
    cursor: pointer;
}

.stats-tabs {
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
}

.tab-button {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: white;
    padding: 10px 20px;
    border-radius: 25px;
    cursor: pointer;
    transition: all 0.3s ease;
}

.tab-button.active {
    background: rgba(0, 212, 255, 0.3);
    border-color: #00D4FF;
}

.goals-form {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.form-group label {
    color: #00D4FF;
    font-weight: bold;
}

.form-group input {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(0, 212, 255, 0.3);
    border-radius: 10px;
    padding: 12px;
    color: white;
    font-size: 1rem;
}

.form-group input:focus {
    outline: none;
    border-color: #00D4FF;
    background: rgba(255, 255, 255, 0.15);
}

.achievements-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
}

.achievement-card {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 15px;
    padding: 20px;
    text-align: center;
    transition: all 0.3s ease;
}

.achievement-card:hover {
    transform: translateY(-5px);
    background: rgba(255, 255, 255, 0.08);
}

.achievement-card .achievement-icon {
    font-size: 3rem;
    margin-bottom: 15px;
}

.achievement-card h3 {
    color: #00D4FF;
    margin: 0 0 10px 0;
}

.achievement-card p {
    color: #ccc;
    margin: 0 0 15px 0;
    font-size: 0.9rem;
}

.achievement-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.achievement-points {
    background: linear-gradient(45deg, #FFD700, #FFA500);
    color: #000;
    padding: 5px 10px;
    border-radius: 15px;
    font-weight: bold;
    font-size: 0.8rem;
}

.achievement-date {
    font-size: 0.8rem;
    color: #888;
}

.detailed-overview {
    margin-top: 20px;
}

.overview-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 20px;
}

.overview-card {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 15px;
    padding: 20px;
}

.overview-card h3 {
    color: #00D4FF;
    margin: 0 0 15px 0;
}

.overview-stats {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.stat-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.stat-label {
    color: #ccc;
}

.stat-value {
    color: #00D4FF;
    font-weight: bold;
}

.heart-rate-info, .sleep-info {
    text-align: center;
}

.heart-rate-value, .sleep-value {
    font-size: 2rem;
    font-weight: bold;
    color: #00D4FF;
    margin-bottom: 10px;
}

.heart-rate-status, .sleep-status {
    color: #ccc;
    font-size: 1rem;
}

@media (max-width: 768px) {
    .metrics-grid {
        grid-template-columns: 1fr;
    }
    
    .goals-grid {
        grid-template-columns: 1fr;
    }
    
    .trends-grid {
        grid-template-columns: 1fr;
    }
    
    .health-actions {
        flex-direction: column;
    }
    
    .achievements-grid {
        grid-template-columns: 1fr;
    }
}
</style>
`;

// Añadir estilos al head
document.head.insertAdjacentHTML('beforeend', healthDashboardStyles);
