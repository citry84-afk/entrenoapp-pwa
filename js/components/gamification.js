// Sistema de Gamificación y Recompensas para EntrenoApp
class GamificationSystem {
    constructor() {
        this.userLevel = 1;
        this.userXP = 0;
        this.totalXP = 0;
        this.streaks = {
            daily: 0,
            weekly: 0,
            monthly: 0
        };
        this.badges = [];
        this.rewards = [];
        this.leaderboard = [];
        this.dailyQuests = [];
        this.weeklyChallenges = [];
        this.init();
    }

    async init() {
        this.loadUserProgress();
        this.generateDailyQuests();
        this.generateWeeklyChallenges();
        this.calculateLevel();
        this.setupEventListeners();
    }

    loadUserProgress() {
        // Cargar progreso del usuario desde localStorage
        const savedProgress = JSON.parse(localStorage.getItem('entrenoapp_gamification') || '{}');
        
        this.userLevel = savedProgress.level || 1;
        this.userXP = savedProgress.xp || 0;
        this.totalXP = savedProgress.totalXP || 0;
        this.streaks = savedProgress.streaks || { daily: 0, weekly: 0, monthly: 0 };
        this.badges = savedProgress.badges || [];
        this.rewards = savedProgress.rewards || [];

        // Calcular XP necesario para el próximo nivel
        this.xpForNextLevel = this.calculateXPForLevel(this.userLevel + 1);
        this.xpForCurrentLevel = this.calculateXPForLevel(this.userLevel);
    }

    saveUserProgress() {
        const progress = {
            level: this.userLevel,
            xp: this.userXP,
            totalXP: this.totalXP,
            streaks: this.streaks,
            badges: this.badges,
            rewards: this.rewards,
            lastUpdate: new Date().toISOString()
        };

        localStorage.setItem('entrenoapp_gamification', JSON.stringify(progress));
    }

    calculateLevel() {
        // Sistema de niveles basado en XP
        // Nivel 1: 0-99 XP
        // Nivel 2: 100-299 XP
        // Nivel 3: 300-599 XP
        // etc...
        
        let level = 1;
        let xpNeeded = 0;
        
        while (this.totalXP >= xpNeeded) {
            level++;
            xpNeeded += level * 100; // Incremento exponencial
        }
        
        this.userLevel = level - 1;
        this.xpForCurrentLevel = this.calculateXPForLevel(this.userLevel);
        this.xpForNextLevel = this.calculateXPForLevel(this.userLevel + 1);
        this.userXP = this.totalXP - this.xpForCurrentLevel;
    }

    calculateXPForLevel(level) {
        if (level <= 1) return 0;
        
        let totalXP = 0;
        for (let i = 1; i < level; i++) {
            totalXP += i * 100;
        }
        return totalXP;
    }

    addXP(amount, source = 'general') {
        this.userXP += amount;
        this.totalXP += amount;
        
        const oldLevel = this.userLevel;
        this.calculateLevel();
        
        // Verificar si subió de nivel
        if (this.userLevel > oldLevel) {
            this.levelUp();
        }
        
        this.saveUserProgress();
        
        // Mostrar notificación de XP
        this.showXPNotification(amount, source);
        
        // Trackear evento
        this.trackXPEvent(amount, source);
    }

    levelUp() {
        const levelUpRewards = this.getLevelUpRewards(this.userLevel);
        
        // Aplicar recompensas
        levelUpRewards.forEach(reward => {
            this.giveReward(reward);
        });
        
        // Mostrar notificación de subida de nivel
        this.showLevelUpNotification(levelUpRewards);
        
        // Trackear evento
        if (window.gtag) {
            gtag('event', 'level_up', {
                level: this.userLevel,
                rewards_count: levelUpRewards.length
            });
        }
    }

    getLevelUpRewards(level) {
        const rewards = [];
        
        // Recompensas por nivel
        if (level % 5 === 0) {
            rewards.push({
                type: 'badge',
                id: `level_${level}`,
                title: `🏆 Nivel ${level}`,
                description: `Has alcanzado el nivel ${level}`,
                rarity: level >= 25 ? 'legendary' : level >= 15 ? 'epic' : level >= 10 ? 'rare' : 'common'
            });
        }
        
        if (level % 10 === 0) {
            rewards.push({
                type: 'premium_days',
                amount: Math.min(level / 10, 30), // Máximo 30 días
                title: `⭐ ${Math.min(level / 10, 30)} Días Premium`,
                description: 'Recompensa especial por tu dedicación'
            });
        }
        
        // XP bonus
        rewards.push({
            type: 'xp_bonus',
            amount: level * 50,
            title: `✨ Bonus de XP`,
            description: `+${level * 50} XP extra`
        });
        
        return rewards;
    }

    giveReward(reward) {
        this.rewards.push({
            ...reward,
            date: new Date().toISOString(),
            claimed: false
        });
        
        // Aplicar efectos inmediatos
        if (reward.type === 'xp_bonus') {
            this.addXP(reward.amount, 'level_up_bonus');
        } else if (reward.type === 'premium_days') {
            // Activar días premium
            this.activatePremiumDays(reward.amount);
        }
    }

    activatePremiumDays(days) {
        const currentPremium = JSON.parse(localStorage.getItem('entrenoapp_premium') || '{}');
        const premiumUntil = new Date();
        premiumUntil.setDate(premiumUntil.getDate() + days);
        
        currentPremium.isPremium = true;
        currentPremium.premiumUntil = premiumUntil.toISOString();
        currentPremium.source = 'gamification_reward';
        
        localStorage.setItem('entrenoapp_premium', JSON.stringify(currentPremium));
        
        // Notificar al sistema premium
        if (window.premiumManager) {
            window.premiumManager.checkPremiumStatus();
        }
    }

    generateDailyQuests() {
        const quests = [
            {
                id: 'daily_steps_10000',
                title: '👣 Camina 10,000 pasos',
                description: 'Completa tu objetivo diario de pasos',
                target: 10000,
                current: 0,
                xp: 50,
                type: 'steps'
            },
            {
                id: 'daily_workout',
                title: '🏋️‍♂️ Haz un entrenamiento',
                description: 'Completa cualquier tipo de entrenamiento',
                target: 1,
                current: 0,
                xp: 100,
                type: 'workout'
            },
            {
                id: 'daily_sleep_8h',
                title: '😴 Duerme 8 horas',
                description: 'Mantén un sueño reparador',
                target: 8,
                current: 0,
                xp: 30,
                type: 'sleep'
            },
            {
                id: 'daily_active_60min',
                title: '⚡ 60 minutos activos',
                description: 'Mantente activo durante una hora',
                target: 60,
                current: 0,
                xp: 75,
                type: 'activity'
            }
        ];
        
        this.dailyQuests = quests;
        this.updateQuestProgress();
    }

    generateWeeklyChallenges() {
        const challenges = [
            {
                id: 'weekly_5_workouts',
                title: '🔥 5 Entrenamientos',
                description: 'Completa 5 entrenamientos esta semana',
                target: 5,
                current: 0,
                xp: 300,
                badge: 'workout_warrior'
            },
            {
                id: 'weekly_50km',
                title: '🗺️ 50km Recorridos',
                description: 'Recorre 50 kilómetros esta semana',
                target: 50,
                current: 0,
                xp: 400,
                badge: 'distance_runner'
            },
            {
                id: 'weekly_streak_7',
                title: '📅 Racha de 7 días',
                description: 'Mantén tu racha diaria por 7 días',
                target: 7,
                current: 0,
                xp: 500,
                badge: 'consistency_champion'
            }
        ];
        
        this.weeklyChallenges = challenges;
        this.updateChallengeProgress();
    }

    updateQuestProgress() {
        if (!window.healthManager) return;
        
        const healthData = window.healthManager.getHealthData();
        
        this.dailyQuests.forEach(quest => {
            switch (quest.type) {
                case 'steps':
                    quest.current = healthData.steps;
                    break;
                case 'sleep':
                    quest.current = healthData.sleepHours;
                    break;
                case 'activity':
                    quest.current = healthData.activeMinutes;
                    break;
                case 'workout':
                    // Simular entrenamientos del día
                    quest.current = parseInt(localStorage.getItem('todays_workouts') || '0');
                    break;
            }
        });
    }

    updateChallengeProgress() {
        // Simular progreso de desafíos semanales
        this.weeklyChallenges.forEach(challenge => {
            switch (challenge.id) {
                case 'weekly_5_workouts':
                    challenge.current = Math.min(parseInt(localStorage.getItem('weekly_workouts') || '0'), 5);
                    break;
                case 'weekly_50km':
                    challenge.current = Math.min(parseInt(localStorage.getItem('weekly_distance') || '0'), 50);
                    break;
                case 'weekly_streak_7':
                    challenge.current = Math.min(this.streaks.daily, 7);
                    break;
            }
        });
    }

    checkQuestCompletion() {
        this.updateQuestProgress();
        
        this.dailyQuests.forEach(quest => {
            if (quest.current >= quest.target && !quest.completed) {
                quest.completed = true;
                this.addXP(quest.xp, `quest_${quest.id}`);
                this.showQuestCompletionNotification(quest);
            }
        });
    }

    checkChallengeCompletion() {
        this.updateChallengeProgress();
        
        this.weeklyChallenges.forEach(challenge => {
            if (challenge.current >= challenge.target && !challenge.completed) {
                challenge.completed = true;
                this.addXP(challenge.xp, `challenge_${challenge.id}`);
                this.giveBadge(challenge.badge);
                this.showChallengeCompletionNotification(challenge);
            }
        });
    }

    giveBadge(badgeId) {
        const badge = this.getBadgeById(badgeId);
        if (badge && !this.hasBadge(badgeId)) {
            this.badges.push({
                ...badge,
                earnedDate: new Date().toISOString()
            });
            
            this.showBadgeNotification(badge);
            this.saveUserProgress();
        }
    }

    getBadgeById(badgeId) {
        const badgeDatabase = {
            workout_warrior: {
                id: 'workout_warrior',
                title: '🔥 Guerrero del Entrenamiento',
                description: 'Completa 5 entrenamientos en una semana',
                rarity: 'rare',
                icon: '🔥'
            },
            distance_runner: {
                id: 'distance_runner',
                title: '🗺️ Corredor de Distancia',
                description: 'Recorre 50km en una semana',
                rarity: 'rare',
                icon: '🗺️'
            },
            consistency_champion: {
                id: 'consistency_champion',
                title: '📅 Campeón de la Constancia',
                description: 'Mantén una racha de 7 días',
                rarity: 'epic',
                icon: '📅'
            },
            early_bird: {
                id: 'early_bird',
                title: '🐦 Madrugador',
                description: 'Haz tu primer entrenamiento antes de las 8 AM',
                rarity: 'common',
                icon: '🐦'
            },
            night_owl: {
                id: 'night_owl',
                title: '🦉 Noctámbulo',
                description: 'Completa un entrenamiento después de las 10 PM',
                rarity: 'common',
                icon: '🦉'
            },
            speed_demon: {
                id: 'speed_demon',
                title: '⚡ Demonio de la Velocidad',
                description: 'Corre 5km en menos de 25 minutos',
                rarity: 'epic',
                icon: '⚡'
            }
        };
        
        return badgeDatabase[badgeId];
    }

    hasBadge(badgeId) {
        return this.badges.some(badge => badge.id === badgeId);
    }

    // Notificaciones
    showXPNotification(amount, source) {
        const notification = document.createElement('div');
        notification.className = 'xp-notification';
        notification.innerHTML = `
            <div class="xp-content">
                <div class="xp-icon">✨</div>
                <div class="xp-info">
                    <div class="xp-amount">+${amount} XP</div>
                    <div class="xp-source">${this.getSourceName(source)}</div>
                </div>
            </div>
        `;

        notification.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            background: linear-gradient(135deg, #FFD700, #FFA500);
            color: #000;
            padding: 15px;
            border-radius: 12px;
            box-shadow: 0 5px 20px rgba(255, 215, 0, 0.3);
            z-index: 9999;
            animation: slideInRight 0.5s ease-out;
            font-weight: bold;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.5s ease-in';
            setTimeout(() => notification.remove(), 500);
        }, 3000);
    }

    showLevelUpNotification(rewards) {
        const modal = document.createElement('div');
        modal.className = 'level-up-modal';
        modal.innerHTML = `
            <div class="modal-content glass-effect">
                <div class="level-up-header">
                    <div class="level-up-icon">🎉</div>
                    <h2>¡Nivel ${this.userLevel}!</h2>
                    <p>¡Felicidades! Has subido de nivel</p>
                </div>
                
                ${rewards.length > 0 ? `
                    <div class="level-up-rewards">
                        <h3>🎁 Recompensas:</h3>
                        ${rewards.map(reward => `
                            <div class="reward-item">
                                <div class="reward-icon">${reward.title.split(' ')[0]}</div>
                                <div class="reward-info">
                                    <div class="reward-title">${reward.title}</div>
                                    <div class="reward-description">${reward.description}</div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
                
                <div class="level-up-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${(this.userXP / (this.xpForNextLevel - this.xpForCurrentLevel)) * 100}%"></div>
                    </div>
                    <div class="progress-text">${this.userXP} / ${this.xpForNextLevel - this.xpForCurrentLevel} XP para el siguiente nivel</div>
                </div>
                
                <button class="glass-button glass-button-primary" onclick="this.closest('.level-up-modal').remove()">
                    ¡Genial!
                </button>
            </div>
        `;

        document.body.appendChild(modal);
    }

    showQuestCompletionNotification(quest) {
        const notification = document.createElement('div');
        notification.className = 'quest-notification';
        notification.innerHTML = `
            <div class="quest-content">
                <div class="quest-icon">✅</div>
                <div class="quest-info">
                    <div class="quest-title">Misión Completada!</div>
                    <div class="quest-name">${quest.title}</div>
                    <div class="quest-xp">+${quest.xp} XP</div>
                </div>
            </div>
        `;

        notification.style.cssText = `
            position: fixed;
            top: 120px;
            right: 20px;
            background: linear-gradient(135deg, #4CAF50, #8BC34A);
            color: white;
            padding: 15px;
            border-radius: 12px;
            box-shadow: 0 5px 20px rgba(76, 175, 80, 0.3);
            z-index: 9999;
            animation: slideInRight 0.5s ease-out;
            font-weight: bold;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.5s ease-in';
            setTimeout(() => notification.remove(), 500);
        }, 4000);
    }

    showChallengeCompletionNotification(challenge) {
        const notification = document.createElement('div');
        notification.className = 'challenge-notification';
        notification.innerHTML = `
            <div class="challenge-content">
                <div class="challenge-icon">🏆</div>
                <div class="challenge-info">
                    <div class="challenge-title">Desafío Completado!</div>
                    <div class="challenge-name">${challenge.title}</div>
                    <div class="challenge-xp">+${challenge.xp} XP</div>
                </div>
            </div>
        `;

        notification.style.cssText = `
            position: fixed;
            top: 160px;
            right: 20px;
            background: linear-gradient(135deg, #FF9800, #FFC107);
            color: white;
            padding: 15px;
            border-radius: 12px;
            box-shadow: 0 5px 20px rgba(255, 152, 0, 0.3);
            z-index: 9999;
            animation: slideInRight 0.5s ease-out;
            font-weight: bold;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.5s ease-in';
            setTimeout(() => notification.remove(), 500);
        }, 5000);
    }

    showBadgeNotification(badge) {
        const notification = document.createElement('div');
        notification.className = 'badge-notification';
        notification.innerHTML = `
            <div class="badge-content">
                <div class="badge-icon">${badge.icon}</div>
                <div class="badge-info">
                    <div class="badge-title">¡Nueva Insignia!</div>
                    <div class="badge-name">${badge.title}</div>
                    <div class="badge-description">${badge.description}</div>
                </div>
            </div>
        `;

        notification.style.cssText = `
            position: fixed;
            top: 200px;
            right: 20px;
            background: linear-gradient(135deg, #9C27B0, #E91E63);
            color: white;
            padding: 15px;
            border-radius: 12px;
            box-shadow: 0 5px 20px rgba(156, 39, 176, 0.3);
            z-index: 9999;
            animation: slideInRight 0.5s ease-out;
            font-weight: bold;
            max-width: 250px;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.5s ease-in';
            setTimeout(() => notification.remove(), 500);
        }, 6000);
    }

    getSourceName(source) {
        const sourceNames = {
            'quest_daily_steps_10000': 'Misión Diaria',
            'quest_daily_workout': 'Entrenamiento',
            'quest_daily_sleep_8h': 'Sueño',
            'quest_daily_active_60min': 'Actividad',
            'challenge_weekly_5_workouts': 'Desafío Semanal',
            'challenge_weekly_50km': 'Desafío de Distancia',
            'challenge_weekly_streak_7': 'Desafío de Racha',
            'level_up_bonus': 'Bonus de Nivel',
            'achievement_unlocked': 'Logro',
            'general': 'Actividad'
        };
        
        return sourceNames[source] || source;
    }

    setupEventListeners() {
        // Escuchar eventos de entrenamiento
        document.addEventListener('workout_completed', (event) => {
            this.addXP(100, 'workout_completed');
            this.checkQuestCompletion();
            this.checkChallengeCompletion();
        });

        // Escuchar logros desbloqueados
        document.addEventListener('achievement_unlocked', (event) => {
            this.addXP(event.detail.points, 'achievement_unlocked');
        });

        // Actualizar progreso cada minuto
        setInterval(() => {
            this.checkQuestCompletion();
            this.checkChallengeCompletion();
        }, 60000);
    }

    // Métodos públicos
    getUserProgress() {
        return {
            level: this.userLevel,
            xp: this.userXP,
            totalXP: this.totalXP,
            xpForNextLevel: this.xpForNextLevel,
            xpForCurrentLevel: this.xpForCurrentLevel,
            streaks: this.streaks,
            badges: this.badges,
            rewards: this.rewards,
            dailyQuests: this.dailyQuests,
            weeklyChallenges: this.weeklyChallenges
        };
    }

    getProgressPercentage() {
        const currentLevelXP = this.xpForNextLevel - this.xpForCurrentLevel;
        return (this.userXP / currentLevelXP) * 100;
    }

    // Simular actualización de datos (para testing)
    simulateProgress() {
        // Simular entrenamiento completado
        this.addXP(100, 'workout_completed');
        
        // Simular completar una misión
        const randomQuest = this.dailyQuests[Math.floor(Math.random() * this.dailyQuests.length)];
        randomQuest.completed = true;
        this.addXP(randomQuest.xp, `quest_${randomQuest.id}`);
    }
}

// Instancia global
window.gamificationSystem = new GamificationSystem();

// CSS para gamificación
const gamificationStyles = `
<style>
.xp-notification, .quest-notification, .challenge-notification, .badge-notification {
    animation: slideInRight 0.5s ease-out;
}

.level-up-modal {
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

.level-up-header {
    text-align: center;
    margin-bottom: 30px;
}

.level-up-icon {
    font-size: 4rem;
    margin-bottom: 15px;
    animation: bounce 1s infinite;
}

.level-up-header h2 {
    color: #FFD700;
    margin: 0 0 10px 0;
    font-size: 2.5rem;
}

.level-up-rewards {
    margin: 30px 0;
}

.level-up-rewards h3 {
    color: #00D4FF;
    margin-bottom: 20px;
    text-align: center;
}

.reward-item {
    display: flex;
    align-items: center;
    gap: 15px;
    padding: 15px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 10px;
    margin-bottom: 10px;
}

.reward-icon {
    font-size: 2rem;
}

.reward-title {
    font-weight: bold;
    color: #00D4FF;
    margin-bottom: 5px;
}

.reward-description {
    color: #ccc;
    font-size: 0.9rem;
}

.level-up-progress {
    margin: 30px 0;
}

.progress-bar {
    width: 100%;
    height: 10px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 5px;
    overflow: hidden;
    margin-bottom: 10px;
}

.progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #FFD700, #FFA500);
    transition: width 0.3s ease;
}

.progress-text {
    text-align: center;
    color: #ccc;
    font-size: 0.9rem;
}

.xp-content, .quest-content, .challenge-content, .badge-content {
    display: flex;
    align-items: center;
    gap: 10px;
}

.xp-icon, .quest-icon, .challenge-icon, .badge-icon {
    font-size: 1.5rem;
}

.xp-info, .quest-info, .challenge-info, .badge-info {
    flex: 1;
}

.xp-amount, .quest-xp, .challenge-xp {
    font-size: 1.2rem;
    font-weight: bold;
}

.xp-source, .quest-title, .challenge-title, .badge-title {
    font-size: 0.8rem;
    opacity: 0.8;
}

.quest-name, .challenge-name, .badge-name {
    font-size: 1rem;
    font-weight: bold;
    margin: 2px 0;
}

.badge-description {
    font-size: 0.8rem;
    opacity: 0.8;
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
document.head.insertAdjacentHTML('beforeend', gamificationStyles);
