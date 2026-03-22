// Sistema de tracking mejorado para entrenamientos
// Guarda datos estructurados para gráficos y estadísticas

/**
 * Guardar entrenamiento completado de forma estructurada
 */
export function trackWorkoutCompletion(workoutData) {
    try {
        const today = new Date();
        const dateKey = today.toISOString().split('T')[0]; // YYYY-MM-DD
        
        // Obtener entrenamientos completados existentes
        const completedWorkouts = JSON.parse(
            localStorage.getItem('entrenoapp_completed_workouts') || '[]'
        );
        
        // Añadir nuevo entrenamiento
        const workout = {
            id: Date.now(),
            date: dateKey,
            timestamp: today.toISOString(),
            type: workoutData.type || 'general',
            duration: workoutData.duration || 0,
            exercises: workoutData.exercises || [],
            muscleGroups: workoutData.muscleGroups || [],
            totalVolume: workoutData.totalVolume || 0,
            points: workoutData.points || 10,
            notes: workoutData.notes || ''
        };
        
        completedWorkouts.push(workout);
        
        // Mantener solo los últimos 365 días
        const oneYearAgo = new Date(today);
        oneYearAgo.setDate(today.getDate() - 365);
        const filteredWorkouts = completedWorkouts.filter(w => {
            const workoutDate = new Date(w.date);
            return workoutDate >= oneYearAgo;
        });
        
        localStorage.setItem('entrenoapp_completed_workouts', JSON.stringify(filteredWorkouts));
        
        // Marcar día como completado
        const completedDays = JSON.parse(
            localStorage.getItem('entrenoapp_completed_days') || '[]'
        );
        if (!completedDays.includes(dateKey)) {
            completedDays.push(dateKey);
            localStorage.setItem('entrenoapp_completed_days', JSON.stringify(completedDays));
        }
        
        // Trigger celebración si hay milestone
        checkMilestones(workout, filteredWorkouts);
        
        console.log('✅ Entrenamiento trackeado:', workout);
        return workout;
        
    } catch (error) {
        console.error('❌ Error trackeando entrenamiento:', error);
        return null;
    }
}

/**
 * Verificar milestones y trigger celebraciones
 */
function checkMilestones(workout, allWorkouts) {
    const milestones = [
        { count: 1, type: 'first', message: '🎉 ¡Primer entrenamiento completado!' },
        { count: 5, type: 'week', message: '🔥 ¡5 entrenamientos completados!' },
        { count: 10, type: 'ten', message: '💪 ¡10 entrenamientos - vas genial!' },
        { count: 25, type: 'month', message: '🏆 ¡25 entrenamientos - eres constante!' },
        { count: 50, type: 'fifty', message: '⭐ ¡50 entrenamientos - nivel avanzado!' },
        { count: 100, type: 'century', message: '👑 ¡100 entrenamientos - ¡LEGENDARIO!' }
    ];
    
    const totalCount = allWorkouts.length;
    const milestone = milestones.find(m => m.count === totalCount);
    
    if (milestone) {
        // Trigger celebración
        if (window.showCelebration) {
            window.showCelebration(milestone.message, milestone.type);
        } else {
            // Fallback simple
            setTimeout(() => {
                if (window.showConfetti) {
                    window.showConfetti();
                }
            }, 500);
        }
    }
    
    // Verificar rachas
    const currentStreak = calculateCurrentStreak(allWorkouts);
    const streakMilestones = [3, 7, 14, 21, 30, 50, 100];
    if (streakMilestones.includes(currentStreak)) {
        if (window.showCelebration) {
            window.showCelebration(`🔥 ¡Racha de ${currentStreak} días! ¡Increíble!`, 'streak');
        }
    }
}

/**
 * Calcular racha actual
 */
function calculateCurrentStreak(workouts) {
    if (workouts.length === 0) return 0;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let streak = 0;
    let currentDate = new Date(today);
    
    // Obtener días únicos con entrenamientos
    const workoutDays = [...new Set(workouts.map(w => w.date))].sort().reverse();
    
    // Contar días consecutivos desde hoy hacia atrás
    for (const dayKey of workoutDays) {
        const dayDate = new Date(dayKey);
        dayDate.setHours(0, 0, 0, 0);
        
        const diffDays = Math.floor((today - dayDate) / (1000 * 60 * 60 * 24));
        
        if (diffDays === streak) {
            streak++;
        } else if (diffDays > streak) {
            break;
        }
    }
    
    return streak;
}

/**
 * Obtener estadísticas del usuario
 */
export function getUserStats() {
    const workouts = JSON.parse(
        localStorage.getItem('entrenoapp_completed_workouts') || '[]'
    );
    
    const totalWorkouts = workouts.length;
    const totalMinutes = workouts.reduce((sum, w) => sum + (w.duration || 0), 0);
    const totalVolume = workouts.reduce((sum, w) => sum + (w.totalVolume || 0), 0);
    const totalPoints = workouts.reduce((sum, w) => sum + (w.points || 10), 0);
    const currentStreak = calculateCurrentStreak(workouts);
    
    // Calcular mejor racha
    let bestStreak = 0;
    let currentRun = 0;
    const sortedDays = [...new Set(workouts.map(w => w.date))].sort();
    
    for (let i = 0; i < sortedDays.length; i++) {
        const currentDay = new Date(sortedDays[i]);
        const prevDay = i > 0 ? new Date(sortedDays[i - 1]) : null;
        
        if (prevDay) {
            const diffDays = Math.floor((currentDay - prevDay) / (1000 * 60 * 60 * 24));
            if (diffDays === 1) {
                currentRun++;
            } else {
                bestStreak = Math.max(bestStreak, currentRun);
                currentRun = 1;
            }
        } else {
            currentRun = 1;
        }
    }
    bestStreak = Math.max(bestStreak, currentRun);
    
    return {
        totalWorkouts,
        totalMinutes,
        totalVolume,
        totalPoints,
        currentStreak,
        bestStreak,
        averagePerWeek: calculateAveragePerWeek(workouts)
    };
}

/**
 * Calcular promedio por semana
 */
function calculateAveragePerWeek(workouts) {
    if (workouts.length === 0) return 0;
    
    const firstWorkout = new Date(workouts[0].date);
    const lastWorkout = new Date(workouts[workouts.length - 1].date);
    const diffDays = Math.floor((lastWorkout - firstWorkout) / (1000 * 60 * 60 * 24));
    const weeks = Math.max(1, Math.ceil(diffDays / 7));
    
    return (workouts.length / weeks).toFixed(1);
}


// Exportar funciones globales para uso en otros módulos
if (typeof window !== 'undefined') {
    window.trackWorkoutCompletion = trackWorkoutCompletion;
    window.getUserStats = getUserStats;
}
