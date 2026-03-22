// Sistema de Calendario de Entrenamientos con Heatmap para EntrenoApp
// Inspirado en Strava y GitHub contributions

class WorkoutCalendarManager {
    constructor() {
        this.workouts = [];
        this.currentMonth = new Date();
        this.viewMode = 'month'; // 'month', 'year'
        console.log('📅 WorkoutCalendarManager: Constructor llamado');
        this.init();
    }

    async init() {
        console.log('📅 WorkoutCalendarManager: Inicializando...');
        this.loadWorkouts();
        this.setupEventListeners();
        console.log('📅 WorkoutCalendarManager: Inicialización completa');
    }

    loadWorkouts() {
        try {
            // Cargar desde localStorage (modo guest)
            const saved = localStorage.getItem('entrenoapp_workout_history');
            this.workouts = saved ? JSON.parse(saved) : [];
            
            // También cargar desde otros lugares donde se guardan entrenamientos
            this.loadWorkoutsFromOtherSources();
            
            // También intentar cargar desde Firestore si hay usuario
            if (window.appState && window.appState.currentUser && !window.appState.currentUser.isGuest) {
                this.loadWorkoutsFromFirestore();
            }
            
            console.log('📅 Calendario: Cargados', this.workouts.length, 'entrenamientos');
        } catch (error) {
            console.error('Error cargando entrenamientos:', error);
            this.workouts = [];
        }
    }
    
    loadWorkoutsFromOtherSources() {
        try {
            console.log('📅 Calendario: Cargando entrenamientos de otras fuentes...');
            
            // Cargar entrenamientos completados desde otros lugares
            const completedWorkouts = JSON.parse(localStorage.getItem('entrenoapp_completed_workouts') || '[]');
            console.log('📅 Encontrados', completedWorkouts.length, 'entrenamientos en entrenoapp_completed_workouts');
            
            completedWorkouts.forEach(workout => {
                // Convertir formato si es necesario
                if (workout.date && !this.workouts.find(w => w.id === workout.id)) {
                    this.workouts.push({
                        id: workout.id || Date.now().toString(),
                        date: workout.date || workout.completedAt || new Date().toISOString(),
                        type: workout.type || 'general',
                        duration: workout.duration || 0,
                        intensity: workout.intensity || 'medium',
                        exercises: workout.exercises || [],
                        notes: workout.notes || ''
                    });
                }
            });
            
            // Cargar entrenamientos de gym completados (últimos 30 días)
            const today = new Date();
            for (let i = 0; i < 30; i++) {
                const checkDate = new Date(today);
                checkDate.setDate(today.getDate() - i);
                const dateKey = checkDate.toDateString();
                const gymWorkouts = JSON.parse(localStorage.getItem('gym_workout_completed_' + dateKey) || 'null');
                if (gymWorkouts && gymWorkouts.completed) {
                    const workoutDate = checkDate.toISOString();
                    if (!this.workouts.find(w => {
                        const wDate = new Date(w.date).toDateString();
                        return wDate === dateKey && w.type === 'gym';
                    })) {
                        this.workouts.push({
                            id: Date.now().toString() + '_gym_' + i,
                            date: workoutDate,
                            type: 'gym',
                            duration: (gymWorkouts.workoutData?.duration || 45) * 60,
                            intensity: 'medium',
                            exercises: gymWorkouts.workoutData?.exercises?.map(ex => ex.name || ex.exercise) || [],
                            notes: gymWorkouts.workoutData?.notes || ''
                        });
                    }
                }
            }
            
            // Cargar entrenamientos funcionales completados (últimos 30 días)
            for (let i = 0; i < 30; i++) {
                const checkDate = new Date(today);
                checkDate.setDate(today.getDate() - i);
                const dateKey = checkDate.toDateString();
                const functionalWorkouts = JSON.parse(localStorage.getItem('functional_wod_completed_' + dateKey) || 'null');
                if (functionalWorkouts && functionalWorkouts.completed) {
                    const workoutDate = checkDate.toISOString();
                    if (!this.workouts.find(w => {
                        const wDate = new Date(w.date).toDateString();
                        return wDate === dateKey && w.type === 'functional';
                    })) {
                        this.workouts.push({
                            id: Date.now().toString() + '_func_' + i,
                            date: workoutDate,
                            type: 'functional',
                            duration: (functionalWorkouts.workoutData?.duration || 20) * 60,
                            intensity: 'medium',
                            exercises: functionalWorkouts.workoutData?.rounds?.map(r => r.movement || 'Movimiento') || [],
                            notes: functionalWorkouts.workoutData?.notes || ''
                        });
                    }
                }
            }
            
            // Cargar carreras guardadas
            const runsHistory = JSON.parse(localStorage.getItem('entrenoapp_runs_history') || '[]');
            runsHistory.forEach(run => {
                if (!this.workouts.find(w => w.id === run.id)) {
                    let intensity = 'medium';
                    if (run.avgPace && run.avgPace < 5) intensity = 'high';
                    else if (run.avgPace && run.avgPace > 7) intensity = 'low';
                    
                    this.workouts.push({
                        id: run.id,
                        date: run.date,
                        type: 'running',
                        duration: Math.floor(run.duration / 1000),
                        intensity: intensity,
                        exercises: [`Carrera de ${this.formatDistance(run.distance)}`],
                        notes: run.notes || ''
                    });
                }
            });
            
            // Cargar carreras guardadas
            const runsHistory = JSON.parse(localStorage.getItem('entrenoapp_runs_history') || '[]');
            console.log('📅 Encontradas', runsHistory.length, 'carreras en entrenoapp_runs_history');
            runsHistory.forEach(run => {
                if (!this.workouts.find(w => w.id === run.id)) {
                    let intensity = 'medium';
                    if (run.avgPace && run.avgPace < 5) intensity = 'high';
                    else if (run.avgPace && run.avgPace > 7) intensity = 'low';
                    
                    this.workouts.push({
                        id: run.id,
                        date: run.date,
                        type: 'running',
                        duration: Math.floor(run.duration / 1000),
                        intensity: intensity,
                        exercises: [`Carrera de ${this.formatDistance(run.distance)}`],
                        notes: run.notes || ''
                    });
                }
            });
            
            // Guardar todo de nuevo
            if (this.workouts.length > 0) {
                this.saveWorkouts();
                console.log('📅 Calendario: Total entrenamientos cargados:', this.workouts.length);
            }
        } catch (error) {
            console.error('Error cargando entrenamientos de otras fuentes:', error);
        }
    }

    async loadWorkoutsFromFirestore() {
        try {
            // Esto se implementaría si hay autenticación
            // Por ahora, solo usamos localStorage
        } catch (error) {
            console.error('Error cargando desde Firestore:', error);
        }
    }

    saveWorkouts() {
        try {
            localStorage.setItem('entrenoapp_workout_history', JSON.stringify(this.workouts));
        } catch (error) {
            console.error('Error guardando entrenamientos:', error);
        }
    }

    addWorkout(workout) {
        console.log('📅 Calendario: Añadiendo entrenamiento', workout);
        
        const workoutEntry = {
            id: workout.id || Date.now().toString(),
            date: workout.date || new Date().toISOString(),
            type: workout.type || 'general',
            duration: workout.duration || 0,
            intensity: workout.intensity || 'medium', // 'low', 'medium', 'high'
            exercises: workout.exercises || [],
            notes: workout.notes || ''
        };

        // Verificar si ya existe un entrenamiento ese día del mismo tipo
        const existingIndex = this.workouts.findIndex(w => {
            const wDate = new Date(w.date).toDateString();
            const newDate = new Date(workoutEntry.date).toDateString();
            return wDate === newDate && w.type === workoutEntry.type;
        });

        if (existingIndex >= 0) {
            // Actualizar existente
            this.workouts[existingIndex] = workoutEntry;
            console.log('📅 Calendario: Entrenamiento actualizado');
        } else {
            // Añadir nuevo
            this.workouts.push(workoutEntry);
            console.log('📅 Calendario: Nuevo entrenamiento añadido');
        }

        this.saveWorkouts();
        this.render();
        console.log('📅 Calendario: Total entrenamientos:', this.workouts.length);
    }

    getWorkoutsForDate(date) {
        const dateStr = date.toDateString();
        return this.workouts.filter(w => {
            const wDate = new Date(w.date).toDateString();
            return wDate === dateStr;
        });
    }

    getWorkoutIntensity(date) {
        const workouts = this.getWorkoutsForDate(date);
        if (workouts.length === 0) return null;
        
        // Calcular intensidad promedio
        const intensities = { low: 1, medium: 2, high: 3 };
        const avgIntensity = workouts.reduce((sum, w) => sum + (intensities[w.intensity] || 2), 0) / workouts.length;
        
        if (avgIntensity >= 2.5) return 'high';
        if (avgIntensity >= 1.5) return 'medium';
        return 'low';
    }

    getWorkoutCount(date) {
        return this.getWorkoutsForDate(date).length;
    }

    render() {
        const container = document.getElementById('workout-calendar-container');
        if (!container) {
            console.warn('⚠️ WorkoutCalendarManager: Contenedor workout-calendar-container no encontrado');
            return;
        }
        console.log('📅 WorkoutCalendarManager: Renderizando con', this.workouts.length, 'entrenamientos...');

        container.innerHTML = `
            <div class="calendar-header">
                <h2>📅 Calendario de Entrenamientos</h2>
                <div class="calendar-controls">
                    <button class="btn-icon" onclick="window.workoutCalendarManager.previousMonth()">◀</button>
                    <span class="current-month">${this.getMonthYearString()}</span>
                    <button class="btn-icon" onclick="window.workoutCalendarManager.nextMonth()">▶</button>
                    <button class="btn-secondary" onclick="window.workoutCalendarManager.today()">Hoy</button>
                </div>
            </div>

            <div class="calendar-stats">
                ${this.renderStats()}
            </div>

            <div class="calendar-wrapper">
                ${this.renderCalendar()}
            </div>

            <div class="calendar-legend">
                <div class="legend-item">
                    <span class="legend-color low"></span>
                    <span>Baja intensidad</span>
                </div>
                <div class="legend-item">
                    <span class="legend-color medium"></span>
                    <span>Media intensidad</span>
                </div>
                <div class="legend-item">
                    <span class="legend-color high"></span>
                    <span>Alta intensidad</span>
                </div>
                <div class="legend-item">
                    <span class="legend-color none"></span>
                    <span>Sin entrenamiento</span>
                </div>
            </div>
        `;

        this.addStyles();
    }

    renderStats() {
        const monthStart = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth(), 1);
        const monthEnd = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() + 1, 0);
        
        const monthWorkouts = this.workouts.filter(w => {
            const wDate = new Date(w.date);
            return wDate >= monthStart && wDate <= monthEnd;
        });

        const totalDays = monthWorkouts.length;
        const totalDuration = monthWorkouts.reduce((sum, w) => sum + (w.duration || 0), 0);
        const avgDuration = totalDays > 0 ? Math.round(totalDuration / totalDays) : 0;

        return `
            <div class="stat-card">
                <div class="stat-value">${totalDays}</div>
                <div class="stat-label">Días entrenados</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${Math.round(totalDuration / 60)}</div>
                <div class="stat-label">Minutos totales</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${avgDuration}</div>
                <div class="stat-label">Promedio (min)</div>
            </div>
        `;
    }

    renderCalendar() {
        const year = this.currentMonth.getFullYear();
        const month = this.currentMonth.getMonth();
        
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        // Ajustar para que la semana empiece en lunes
        const adjustedStartingDay = startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1;

        const weekDays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
        
        let calendarHTML = `
            <div class="calendar-grid">
                <div class="calendar-weekdays">
                    ${weekDays.map(day => `<div class="weekday">${day}</div>`).join('')}
                </div>
                <div class="calendar-days">
        `;

        // Días vacíos al inicio
        for (let i = 0; i < adjustedStartingDay; i++) {
            calendarHTML += `<div class="calendar-day empty"></div>`;
        }

        // Días del mes
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const intensity = this.getWorkoutIntensity(date);
            const count = this.getWorkoutCount(date);
            const workouts = this.getWorkoutsForDate(date);
            const isToday = this.isToday(date);

            calendarHTML += `
                <div class="calendar-day ${intensity || 'none'} ${isToday ? 'today' : ''}" 
                     onclick="if(window.workoutCalendarManager) { window.workoutCalendarManager.showDayDetails('${date.toISOString()}'); }">
                    <div class="day-number" style="color: inherit;">${day}</div>
                    ${count > 0 ? `<div class="day-count">${count}</div>` : ''}
                </div>
            `;
        }

        calendarHTML += `
                </div>
            </div>
        `;

        return calendarHTML;
    }

    showDayDetails(dateString) {
        const date = new Date(dateString);
        const workouts = this.getWorkoutsForDate(date);

        if (workouts.length === 0) {
            alert(`No hay entrenamientos registrados para ${this.formatDate(date)}`);
            return;
        }

        const modal = document.createElement('div');
        modal.className = 'day-details-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${this.formatDate(date)}</h3>
                    <button class="close-btn" onclick="this.closest('.day-details-modal').remove()">✕</button>
                </div>
                <div class="day-workouts">
                    ${workouts.map(workout => `
                        <div class="workout-detail-card">
                            <div class="workout-type">${this.getTypeLabel(workout.type)}</div>
                            <div class="workout-info">
                                <span>⏱️ ${Math.round(workout.duration / 60)} min</span>
                                <span>🔥 ${this.getIntensityLabel(workout.intensity)}</span>
                            </div>
                            ${workout.exercises.length > 0 ? `
                                <div class="workout-exercises">
                                    <strong>Ejercicios:</strong>
                                    <ul>
                                        ${workout.exercises.map(ex => `<li>${ex}</li>`).join('')}
                                    </ul>
                                </div>
                            ` : ''}
                            ${workout.notes ? `<div class="workout-notes">${workout.notes}</div>` : ''}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    getTypeLabel(type) {
        const labels = {
            'running': '🏃 Running',
            'gym': '💪 Gimnasio',
            'functional': '⚡ Funcional',
            'crossfit': '🔥 CrossFit',
            'general': '🏋️ General'
        };
        return labels[type] || type;
    }

    getIntensityLabel(intensity) {
        const labels = {
            'low': 'Baja',
            'medium': 'Media',
            'high': 'Alta'
        };
        return labels[intensity] || intensity;
    }

    previousMonth() {
        this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() - 1, 1);
        this.render();
    }

    nextMonth() {
        this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() + 1, 1);
        this.render();
    }

    today() {
        this.currentMonth = new Date();
        this.render();
    }

    isToday(date) {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    }

    formatDate(date) {
        return date.toLocaleDateString('es-ES', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    }
    
    formatDistance(meters) {
        if (meters < 1000) {
            return `${Math.round(meters)}m`;
        } else {
            return `${(meters / 1000).toFixed(2)}km`;
        }
    }

    getMonthYearString() {
        return this.currentMonth.toLocaleDateString('es-ES', { 
            year: 'numeric', 
            month: 'long' 
        });
    }

    setupEventListeners() {
        // Escuchar eventos de entrenamientos completados
        window.addEventListener('workout-completed', (event) => {
            console.log('📅 Calendario: Recibido evento workout-completed', event.detail);
            this.addWorkout(event.detail);
        });
        
        // También escuchar eventos personalizados
        document.addEventListener('workout-completed', (event) => {
            console.log('📅 Calendario: Recibido evento workout-completed (document)', event.detail);
            this.addWorkout(event.detail);
        });
    }

    addStyles() {
        if (document.getElementById('workout-calendar-styles')) return;

        const style = document.createElement('style');
        style.id = 'workout-calendar-styles';
        style.textContent = `
            .calendar-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
                flex-wrap: wrap;
                gap: 15px;
            }

            .calendar-controls {
                display: flex;
                align-items: center;
                gap: 15px;
            }

            .current-month {
                font-size: 1.2rem;
                font-weight: bold;
                min-width: 200px;
                text-align: center;
                color: #fff;
            }

            .btn-icon {
                background: #667eea;
                color: white;
                border: none;
                width: 40px;
                height: 40px;
                border-radius: 50%;
                cursor: pointer;
                font-size: 1.2rem;
            }

            .calendar-stats {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                gap: 15px;
                margin-bottom: 30px;
            }

            .stat-card {
                background: rgba(255, 255, 255, 0.1);
                backdrop-filter: blur(10px);
                border-radius: 12px;
                padding: 20px;
                text-align: center;
                border: 1px solid rgba(255, 255, 255, 0.2);
            }

            .stat-value {
                font-size: 2rem;
                font-weight: bold;
                color: #fff;
            }

            .stat-label {
                color: rgba(255, 255, 255, 0.8);
                margin-top: 5px;
            }

            .calendar-wrapper {
                background: rgba(255, 255, 255, 0.1);
                backdrop-filter: blur(10px);
                border-radius: 12px;
                padding: 20px;
                border: 1px solid rgba(255, 255, 255, 0.2);
            }

            .calendar-grid {
                display: grid;
                grid-template-columns: repeat(7, 1fr);
                gap: 5px;
            }

            .calendar-weekdays {
                display: contents;
            }

            .weekday {
                text-align: center;
                font-weight: bold;
                padding: 10px;
                color: rgba(255, 255, 255, 0.9);
            }

            .calendar-days {
                display: contents;
            }

            .calendar-day {
                aspect-ratio: 1;
                border-radius: 8px;
                padding: 5px;
                cursor: pointer;
                transition: all 0.2s;
                position: relative;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
            }

            .calendar-day.empty {
                cursor: default;
            }

            .calendar-day.none {
                background: rgba(255, 255, 255, 0.1);
                color: rgba(255, 255, 255, 0.7);
            }

            .calendar-day.low {
                background: rgba(200, 230, 201, 0.8);
                color: #1b5e20;
            }

            .calendar-day.medium {
                background: rgba(129, 199, 132, 0.9);
                color: #1b5e20;
            }

            .calendar-day.high {
                background: rgba(76, 175, 80, 1);
                color: white;
            }

            .calendar-day.today {
                border: 3px solid #667eea;
                box-shadow: 0 0 10px rgba(102, 126, 234, 0.5);
            }

            .calendar-day:hover:not(.empty) {
                transform: scale(1.1);
                z-index: 10;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            }

            .day-number {
                font-size: 0.9rem;
                font-weight: bold;
                color: inherit;
            }

            .day-count {
                font-size: 0.7rem;
                background: rgba(0,0,0,0.3);
                color: white;
                border-radius: 50%;
                width: 18px;
                height: 18px;
                display: flex;
                align-items: center;
                justify-content: center;
                margin-top: 2px;
                font-weight: bold;
            }

            .calendar-legend {
                display: flex;
                justify-content: center;
                gap: 20px;
                margin-top: 20px;
                flex-wrap: wrap;
            }

            .legend-item {
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .legend-color {
                width: 20px;
                height: 20px;
                border-radius: 4px;
            }

            .legend-item span:last-child {
                color: rgba(255, 255, 255, 0.9);
                font-size: 0.9rem;
            }

            .legend-color.none {
                background: rgba(255, 255, 255, 0.1);
            }

            .legend-color.low {
                background: rgba(200, 230, 201, 0.8);
            }

            .legend-color.medium {
                background: rgba(129, 199, 132, 0.9);
            }

            .legend-color.high {
                background: rgba(76, 175, 80, 1);
            }

            .day-details-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.5);
                z-index: 10000;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .modal-content {
                background: white;
                border-radius: 20px;
                padding: 30px;
                max-width: 500px;
                width: 90%;
                max-height: 90vh;
                overflow: auto;
            }

            .modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
            }

            .close-btn {
                background: #ff4444;
                color: white;
                border: none;
                width: 30px;
                height: 30px;
                border-radius: 50%;
                cursor: pointer;
            }

            .workout-detail-card {
                background: #f5f5f5;
                border-radius: 10px;
                padding: 15px;
                margin-bottom: 15px;
            }

            .workout-type {
                font-weight: bold;
                font-size: 1.1rem;
                margin-bottom: 10px;
            }

            .workout-info {
                display: flex;
                gap: 15px;
                color: #666;
                margin-bottom: 10px;
            }

            .workout-exercises ul {
                margin: 10px 0;
                padding-left: 20px;
            }

            .workout-notes {
                margin-top: 10px;
                padding-top: 10px;
                border-top: 1px solid #ddd;
                color: #666;
                font-style: italic;
            }

            @media (max-width: 768px) {
                .calendar-day {
                    font-size: 0.8rem;
                }

                .day-number {
                    font-size: 0.8rem;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// Exportar para uso global
window.WorkoutCalendarManager = WorkoutCalendarManager;

