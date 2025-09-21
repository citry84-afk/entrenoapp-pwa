// Sistema de gestión de datos de salud para EntrenoApp
class HealthManager {
    constructor() {
        this.isSupported = false;
        this.permissions = {
            steps: false,
            heartRate: false,
            sleep: false,
            activity: false,
            distance: false
        };
        this.healthData = {
            steps: 0,
            heartRate: 0,
            sleepHours: 0,
            caloriesBurned: 0,
            distance: 0,
            activeMinutes: 0
        };
        this.achievements = [];
        this.goals = {
            dailySteps: 10000,
            weeklyWorkouts: 3,
            sleepHours: 8,
            monthlyDistance: 50 // km
        };
        this.init();
    }

    async init() {
        await this.checkSupport();
        if (this.isSupported) {
            await this.requestPermissions();
            await this.loadHealthData();
            this.startPeriodicSync();
        } else {
            console.log('Health API no soportada, usando datos simulados');
            this.loadMockData();
        }
    }

    async checkSupport() {
        // Verificar soporte de Web Health API
        if ('navigator' in window && 'permissions' in navigator) {
            try {
                // Verificar si podemos acceder a datos de salud
                const permission = await navigator.permissions.query({ name: 'health' });
                this.isSupported = true;
            } catch (error) {
                console.log('Web Health API no disponible:', error);
                this.isSupported = false;
            }
        }

        // Verificar si estamos en una app nativa (PWA instalada)
        if (window.matchMedia('(display-mode: standalone)').matches) {
            this.isSupported = true;
        }

        // Verificar soporte de sensores
        if ('DeviceMotionEvent' in window) {
            this.isSupported = true;
        }
    }

    async requestPermissions() {
        if (!this.isSupported) return;

        try {
            // Solicitar permisos para diferentes tipos de datos
            const permissions = [
                { name: 'steps', description: 'Pasos diarios' },
                { name: 'heartRate', description: 'Frecuencia cardíaca' },
                { name: 'sleep', description: 'Horas de sueño' },
                { name: 'activity', description: 'Minutos de actividad' },
                { name: 'distance', description: 'Distancia recorrida' }
            ];

            for (const permission of permissions) {
                try {
                    // En un entorno real, aquí se solicitarían los permisos nativos
                    // Por ahora simulamos la concesión de permisos
                    this.permissions[permission.name] = true;
                } catch (error) {
                    console.log(`Error solicitando permiso para ${permission.name}:`, error);
                }
            }

            console.log('Permisos de salud:', this.permissions);
        } catch (error) {
            console.error('Error solicitando permisos de salud:', error);
        }
    }

    async loadHealthData() {
        if (!this.isSupported) return;

        try {
            // Cargar datos de salud del día actual
            const today = new Date();
            const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

            // Simular carga de datos (en implementación real se conectaría con HealthKit/Google Fit)
            await this.loadStepsData(startOfDay, endOfDay);
            await this.loadHeartRateData(startOfDay, endOfDay);
            await this.loadSleepData();
            await this.loadActivityData(startOfDay, endOfDay);
            await this.loadDistanceData(startOfDay, endOfDay);

            // Guardar datos en localStorage
            this.saveHealthData();

            // Verificar logros
            this.checkAchievements();

        } catch (error) {
            console.error('Error cargando datos de salud:', error);
        }
    }

    async loadStepsData(startDate, endDate) {
        if (!this.permissions.steps) return;

        try {
            // En implementación real, se conectaría con la API de salud
            // Por ahora simulamos datos realistas
            const currentHour = new Date().getHours();
            const baseSteps = 5000; // Pasos base
            const hourlySteps = Math.floor(Math.random() * 200) + 50; // Pasos por hora
            const timeMultiplier = Math.min(currentHour / 12, 1); // Más pasos durante el día
            
            this.healthData.steps = Math.floor(baseSteps + (hourlySteps * currentHour * timeMultiplier));
            
            console.log(`Pasos cargados: ${this.healthData.steps}`);
        } catch (error) {
            console.error('Error cargando pasos:', error);
        }
    }

    async loadHeartRateData(startDate, endDate) {
        if (!this.permissions.heartRate) return;

        try {
            // Simular frecuencia cardíaca promedio
            const restingHR = 65 + Math.floor(Math.random() * 20); // 65-85 bpm
            const activityMultiplier = 1 + (this.healthData.activeMinutes / 60) * 0.3;
            
            this.healthData.heartRate = Math.floor(restingHR * activityMultiplier);
            
            console.log(`Frecuencia cardíaca cargada: ${this.healthData.heartRate} bpm`);
        } catch (error) {
            console.error('Error cargando frecuencia cardíaca:', error);
        }
    }

    async loadSleepData() {
        if (!this.permissions.sleep) return;

        try {
            // Simular horas de sueño (6-9 horas)
            const sleepHours = 6.5 + Math.random() * 2.5;
            this.healthData.sleepHours = Math.round(sleepHours * 10) / 10;
            
            console.log(`Horas de sueño cargadas: ${this.healthData.sleepHours} horas`);
        } catch (error) {
            console.error('Error cargando datos de sueño:', error);
        }
    }

    async loadActivityData(startDate, endDate) {
        if (!this.permissions.activity) return;

        try {
            // Simular minutos activos basados en entrenamientos
            const workoutMinutes = parseInt(localStorage.getItem('todays_workout_minutes') || '0');
            const additionalActivity = Math.floor(Math.random() * 30) + 10;
            
            this.healthData.activeMinutes = workoutMinutes + additionalActivity;
            this.healthData.caloriesBurned = Math.floor(this.healthData.activeMinutes * 8.5 + this.healthData.steps * 0.04);
            
            console.log(`Actividad cargada: ${this.healthData.activeMinutes} min, ${this.healthData.caloriesBurned} calorías`);
        } catch (error) {
            console.error('Error cargando datos de actividad:', error);
        }
    }

    async loadDistanceData(startDate, endDate) {
        if (!this.permissions.distance) return;

        try {
            // Calcular distancia basada en pasos (promedio 0.7m por paso)
            this.healthData.distance = Math.round((this.healthData.steps * 0.7) / 1000 * 10) / 10;
            
            console.log(`Distancia cargada: ${this.healthData.distance} km`);
        } catch (error) {
            console.error('Error cargando distancia:', error);
        }
    }

    loadMockData() {
        // Datos simulados para testing
        this.healthData = {
            steps: 8500 + Math.floor(Math.random() * 3000),
            heartRate: 72 + Math.floor(Math.random() * 20),
            sleepHours: 7.2 + Math.random() * 1.5,
            caloriesBurned: 450 + Math.floor(Math.random() * 200),
            distance: 6.2 + Math.random() * 2,
            activeMinutes: 45 + Math.floor(Math.random() * 30)
        };
        
        console.log('Datos de salud simulados cargados:', this.healthData);
        this.saveHealthData();
        this.checkAchievements();
    }

    saveHealthData() {
        const healthDataWithTimestamp = {
            ...this.healthData,
            timestamp: new Date().toISOString(),
            date: new Date().toDateString()
        };
        
        localStorage.setItem('entrenoapp_health_data', JSON.stringify(healthDataWithTimestamp));
        
        // Guardar historial
        this.saveHealthHistory(healthDataWithTimestamp);
    }

    saveHealthHistory(todayData) {
        let history = JSON.parse(localStorage.getItem('entrenoapp_health_history') || '[]');
        
        // Agregar datos de hoy
        const existingIndex = history.findIndex(entry => entry.date === todayData.date);
        if (existingIndex >= 0) {
            history[existingIndex] = todayData;
        } else {
            history.push(todayData);
        }
        
        // Mantener solo últimos 30 días
        history = history.slice(-30);
        
        localStorage.setItem('entrenoapp_health_history', JSON.stringify(history));
    }

    getHealthHistory(days = 7) {
        const history = JSON.parse(localStorage.getItem('entrenoapp_health_history') || '[]');
        return history.slice(-days);
    }

    startPeriodicSync() {
        // Sincronizar datos cada hora
        setInterval(() => {
            this.loadHealthData();
        }, 60 * 60 * 1000);

        // Sincronizar cuando la app vuelve a estar activa
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                this.loadHealthData();
            }
        });
    }

    // Sistema de Logros
    checkAchievements() {
        const newAchievements = [];
        
        // Logros de pasos
        if (this.healthData.steps >= 10000 && !this.hasAchievement('steps_10000')) {
            newAchievements.push({
                id: 'steps_10000',
                title: '🏃‍♂️ Campeón de Pasos',
                description: 'Camina 10,000 pasos en un día',
                points: 50,
                type: 'steps',
                date: new Date().toISOString()
            });
        }

        if (this.healthData.steps >= 15000 && !this.hasAchievement('steps_15000')) {
            newAchievements.push({
                id: 'steps_15000',
                title: '🚀 Máquina de Pasos',
                description: 'Camina 15,000 pasos en un día',
                points: 100,
                type: 'steps',
                date: new Date().toISOString()
            });
        }

        // Logros de sueño
        if (this.healthData.sleepHours >= 8 && !this.hasAchievement('sleep_8h')) {
            newAchievements.push({
                id: 'sleep_8h',
                title: '😴 Durmiente Perfecto',
                description: 'Duerme 8 horas en una noche',
                points: 30,
                type: 'sleep',
                date: new Date().toISOString()
            });
        }

        // Logros de actividad
        if (this.healthData.activeMinutes >= 60 && !this.hasAchievement('active_60min')) {
            newAchievements.push({
                id: 'active_60min',
                title: '⚡ Activo por Naturaleza',
                description: 'Mantente activo 60 minutos en un día',
                points: 75,
                type: 'activity',
                date: new Date().toISOString()
            });
        }

        // Logros de distancia
        if (this.healthData.distance >= 10 && !this.hasAchievement('distance_10km')) {
            newAchievements.push({
                id: 'distance_10km',
                title: '🗺️ Explorador',
                description: 'Recorre 10 km en un día',
                points: 100,
                type: 'distance',
                date: new Date().toISOString()
            });
        }

        // Logros de frecuencia cardíaca
        if (this.healthData.heartRate >= 120 && this.healthData.activeMinutes >= 30 && !this.hasAchievement('cardio_zone')) {
            newAchievements.push({
                id: 'cardio_zone',
                title: '❤️ Zona Cardio',
                description: 'Mantén tu frecuencia cardíaca en zona de entrenamiento',
                points: 60,
                type: 'heart_rate',
                date: new Date().toISOString()
            });
        }

        // Agregar nuevos logros
        newAchievements.forEach(achievement => {
            this.addAchievement(achievement);
        });

        return newAchievements;
    }

    hasAchievement(achievementId) {
        const achievements = JSON.parse(localStorage.getItem('entrenoapp_achievements') || '[]');
        return achievements.some(achievement => achievement.id === achievementId);
    }

    addAchievement(achievement) {
        let achievements = JSON.parse(localStorage.getItem('entrenoapp_achievements') || '[]');
        achievements.push(achievement);
        localStorage.setItem('entrenoapp_achievements', JSON.stringify(achievements));

        // Mostrar notificación
        this.showAchievementNotification(achievement);

        // Trackear evento
        this.trackAchievementEvent(achievement);
    }

    showAchievementNotification(achievement) {
        const notification = document.createElement('div');
        notification.className = 'achievement-notification';
        notification.innerHTML = `
            <div class="achievement-content">
                <div class="achievement-icon">${achievement.title.split(' ')[0]}</div>
                <div class="achievement-info">
                    <h3>¡Logro Desbloqueado!</h3>
                    <h4>${achievement.title}</h4>
                    <p>${achievement.description}</p>
                    <div class="achievement-points">+${achievement.points} puntos</div>
                </div>
            </div>
        `;

        // Estilos
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #FFD700, #FFA500);
            color: #000;
            padding: 20px;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(255, 215, 0, 0.3);
            z-index: 10000;
            animation: slideInRight 0.5s ease-out;
            max-width: 300px;
        `;

        document.body.appendChild(notification);

        // Auto-remover después de 5 segundos
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.5s ease-in';
            setTimeout(() => notification.remove(), 500);
        }, 5000);
    }

    trackAchievementEvent(achievement) {
        if (window.gtag) {
            gtag('event', 'achievement_unlocked', {
                achievement_id: achievement.id,
                achievement_type: achievement.type,
                points: achievement.points
            });
        }

        // Emitir evento personalizado
        document.dispatchEvent(new CustomEvent('achievement_unlocked', {
            detail: achievement
        }));
    }

    // Métodos públicos
    getHealthData() {
        return { ...this.healthData };
    }

    getAchievements() {
        return JSON.parse(localStorage.getItem('entrenoapp_achievements') || '[]');
    }

    getGoals() {
        return { ...this.goals };
    }

    updateGoals(newGoals) {
        this.goals = { ...this.goals, ...newGoals };
        localStorage.setItem('entrenoapp_health_goals', JSON.stringify(this.goals));
    }

    // Método para simular actualización de datos (para testing)
    simulateDataUpdate() {
        const variation = 0.2; // 20% de variación
        
        this.healthData.steps = Math.max(0, this.healthData.steps + Math.floor(Math.random() * 1000 - 500));
        this.healthData.heartRate = Math.max(60, Math.min(180, this.healthData.heartRate + Math.floor(Math.random() * 10 - 5)));
        this.healthData.activeMinutes = Math.max(0, this.healthData.activeMinutes + Math.floor(Math.random() * 10 - 5));
        this.healthData.caloriesBurned = Math.max(0, this.healthData.caloriesBurned + Math.floor(Math.random() * 50 - 25));
        this.healthData.distance = Math.max(0, this.healthData.distance + Math.round((Math.random() * 0.5 - 0.25) * 10) / 10);
        
        this.saveHealthData();
        this.checkAchievements();
    }
}

// Instancia global
window.healthManager = new HealthManager();

// CSS para notificaciones de logros
const achievementStyles = `
<style>
@keyframes slideInRight {
    from {
        transform: translateX(100%);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}

@keyframes slideOutRight {
    from {
        transform: translateX(0);
        opacity: 1;
    }
    to {
        transform: translateX(100%);
        opacity: 0;
    }
}

.achievement-content {
    display: flex;
    align-items: center;
    gap: 15px;
}

.achievement-icon {
    font-size: 2.5rem;
    animation: bounce 1s infinite;
}

.achievement-info h3 {
    margin: 0 0 5px 0;
    font-size: 1rem;
    font-weight: bold;
}

.achievement-info h4 {
    margin: 0 0 5px 0;
    font-size: 1.2rem;
    font-weight: bold;
}

.achievement-info p {
    margin: 0 0 10px 0;
    font-size: 0.9rem;
    opacity: 0.8;
}

.achievement-points {
    background: rgba(0, 0, 0, 0.2);
    padding: 5px 10px;
    border-radius: 10px;
    font-weight: bold;
    font-size: 0.9rem;
}

@keyframes bounce {
    0%, 20%, 50%, 80%, 100% {
        transform: translateY(0);
    }
    40% {
        transform: translateY(-10px);
    }
    60% {
        transform: translateY(-5px);
    }
}
</style>
`;

// Añadir estilos al head
document.head.insertAdjacentHTML('beforeend', achievementStyles);
