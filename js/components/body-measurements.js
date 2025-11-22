// Sistema de Tracking de Medidas Corporales para EntrenoApp
// Inspirado en MyFitnessPal y Strong

class BodyMeasurementsManager {
    constructor() {
        this.measurements = [];
        this.currentView = 'list'; // 'list', 'charts', 'goals'
        this.goals = {
            weight: null,
            waist: null,
            bodyFat: null
        };
        console.log('📏 BodyMeasurementsManager: Constructor llamado');
        this.init();
    }

    async init() {
        console.log('📏 BodyMeasurementsManager: Inicializando...');
        this.loadMeasurements();
        this.loadGoals();
        this.setupEventListeners();
        console.log('📏 BodyMeasurementsManager: Inicialización completa,', this.measurements.length, 'medidas cargadas');
    }

    loadMeasurements() {
        try {
            const saved = localStorage.getItem('entrenoapp_body_measurements');
            this.measurements = saved ? JSON.parse(saved) : [];
            this.measurements.sort((a, b) => new Date(b.date) - new Date(a.date));
        } catch (error) {
            console.error('Error cargando medidas:', error);
            this.measurements = [];
        }
    }

    saveMeasurements() {
        try {
            localStorage.setItem('entrenoapp_body_measurements', JSON.stringify(this.measurements));
        } catch (error) {
            console.error('Error guardando medidas:', error);
        }
    }

    loadGoals() {
        try {
            const saved = localStorage.getItem('entrenoapp_body_goals');
            this.goals = saved ? JSON.parse(saved) : {
                weight: null,
                waist: null,
                bodyFat: null
            };
        } catch (error) {
            console.error('Error cargando objetivos:', error);
        }
    }

    saveGoals() {
        try {
            localStorage.setItem('entrenoapp_body_goals', JSON.stringify(this.goals));
        } catch (error) {
            console.error('Error guardando objetivos:', error);
        }
    }

    addMeasurement(data) {
        const measurement = {
            id: Date.now().toString(),
            date: new Date().toISOString(),
            weight: parseFloat(data.weight) || null,
            waist: parseFloat(data.waist) || null,
            hips: parseFloat(data.hips) || null,
            chest: parseFloat(data.chest) || null,
            arms: parseFloat(data.arms) || null,
            thighs: parseFloat(data.thighs) || null,
            bodyFat: parseFloat(data.bodyFat) || null,
            notes: data.notes || ''
        };

        this.measurements.push(measurement);
        this.saveMeasurements();
        this.render();
        this.showSuccessMessage('Medidas guardadas correctamente');
    }

    deleteMeasurement(id) {
        if (confirm('¿Estás seguro de que quieres eliminar esta medición?')) {
            this.measurements = this.measurements.filter(m => m.id !== id);
            this.saveMeasurements();
            this.render();
        }
    }

    updateGoals(goals) {
        this.goals = { ...this.goals, ...goals };
        this.saveGoals();
        this.render();
        this.showSuccessMessage('Objetivos actualizados');
    }

    render() {
        const container = document.getElementById('body-measurements-container');
        if (!container) {
            console.warn('⚠️ BodyMeasurementsManager: Contenedor body-measurements-container no encontrado');
            return;
        }
        console.log('📏 BodyMeasurementsManager: Renderizando...');

        container.innerHTML = `
            <div class="body-measurements-header">
                <h2>📏 Medidas Corporales</h2>
                <button class="btn-primary" onclick="window.bodyMeasurementsManager.showAddForm()">
                    ➕ Añadir Medidas
                </button>
            </div>

            <div class="measurements-view-toggle">
                <button class="${this.currentView === 'list' ? 'active' : ''}" onclick="window.bodyMeasurementsManager.setView('list')">
                    📋 Lista
                </button>
                <button class="${this.currentView === 'charts' ? 'active' : ''}" onclick="window.bodyMeasurementsManager.setView('charts')">
                    📊 Gráficos
                </button>
                <button class="${this.currentView === 'goals' ? 'active' : ''}" onclick="window.bodyMeasurementsManager.setView('goals')">
                    🎯 Objetivos
                </button>
            </div>

            <div class="body-measurements-content">
                ${this.renderCurrentView()}
            </div>
        `;

        this.addStyles();
    }

    renderCurrentView() {
        switch (this.currentView) {
            case 'list':
                return this.renderListView();
            case 'charts':
                return this.renderChartsView();
            case 'goals':
                return this.renderGoalsView();
            default:
                return this.renderListView();
        }
    }

    renderListView() {
        if (this.measurements.length === 0) {
            return `
                <div class="empty-state">
                    <p>📏 No tienes medidas registradas aún</p>
                    <p>¡Añade tu primera medición para empezar a ver tu progreso!</p>
                </div>
            `;
        }

        // Mostrar últimas 10
        const recent = this.measurements.slice(0, 10);

        return `
            <div class="measurements-list">
                ${recent.map(measurement => `
                    <div class="measurement-card">
                        <div class="measurement-header">
                            <h3>${this.formatDate(measurement.date)}</h3>
                            <button class="btn-delete" onclick="window.bodyMeasurementsManager.deleteMeasurement('${measurement.id}')">
                                🗑️
                            </button>
                        </div>
                        <div class="measurement-data">
                            ${measurement.weight ? `<div class="measure-item"><span class="label">Peso:</span> <span class="value">${measurement.weight} kg</span></div>` : ''}
                            ${measurement.waist ? `<div class="measure-item"><span class="label">Cintura:</span> <span class="value">${measurement.waist} cm</span></div>` : ''}
                            ${measurement.hips ? `<div class="measure-item"><span class="label">Cadera:</span> <span class="value">${measurement.hips} cm</span></div>` : ''}
                            ${measurement.chest ? `<div class="measure-item"><span class="label">Pecho:</span> <span class="value">${measurement.chest} cm</span></div>` : ''}
                            ${measurement.arms ? `<div class="measure-item"><span class="label">Brazos:</span> <span class="value">${measurement.arms} cm</span></div>` : ''}
                            ${measurement.thighs ? `<div class="measure-item"><span class="label">Muslos:</span> <span class="value">${measurement.thighs} cm</span></div>` : ''}
                            ${measurement.bodyFat ? `<div class="measure-item"><span class="label">Grasa corporal:</span> <span class="value">${measurement.bodyFat}%</span></div>` : ''}
                        </div>
                        ${measurement.notes ? `<div class="measurement-notes"><p>${measurement.notes}</p></div>` : ''}
                    </div>
                `).join('')}
            </div>
        `;
    }

    renderChartsView() {
        if (this.measurements.length < 2) {
            return `
                <div class="empty-state">
                    <p>Necesitas al menos 2 mediciones para ver gráficos</p>
                </div>
            `;
        }

        return `
            <div class="measurements-charts">
                <div class="chart-container">
                    <h3>Peso (kg)</h3>
                    <canvas id="weight-chart"></canvas>
                </div>
                <div class="chart-container">
                    <h3>Cintura (cm)</h3>
                    <canvas id="waist-chart"></canvas>
                </div>
                <div class="chart-container">
                    <h3>Grasa Corporal (%)</h3>
                    <canvas id="bodyfat-chart"></canvas>
                </div>
            </div>
        `;

        // Renderizar gráficos después de un momento
        setTimeout(() => this.renderCharts(), 100);
    }

    renderCharts() {
        // Preparar datos para Chart.js
        const labels = this.measurements.map(m => this.formatDateShort(m.date)).reverse();
        
        // Peso
        const weightData = this.measurements
            .filter(m => m.weight)
            .map(m => ({ x: m.date, y: m.weight }))
            .reverse();
        
        // Cintura
        const waistData = this.measurements
            .filter(m => m.waist)
            .map(m => ({ x: m.date, y: m.waist }))
            .reverse();
        
        // Grasa corporal
        const bodyFatData = this.measurements
            .filter(m => m.bodyFat)
            .map(m => ({ x: m.date, y: m.bodyFat }))
            .reverse();

        // Renderizar gráficos si Chart.js está disponible
        if (typeof Chart !== 'undefined') {
            this.renderChart('weight-chart', weightData, 'Peso (kg)', '#667eea');
            this.renderChart('waist-chart', waistData, 'Cintura (cm)', '#f093fb');
            this.renderChart('bodyfat-chart', bodyFatData, 'Grasa Corporal (%)', '#4facfe');
        } else {
            // Fallback: gráfico simple con HTML/CSS
            this.renderSimpleCharts();
        }
    }

    renderChart(canvasId, data, label, color) {
        const canvas = document.getElementById(canvasId);
        if (!canvas || data.length === 0) return;

        const ctx = canvas.getContext('2d');
        
        // Destruir gráfico anterior si existe
        if (this[`${canvasId}Chart`]) {
            this[`${canvasId}Chart`].destroy();
        }

        this[`${canvasId}Chart`] = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.map(d => this.formatDateShort(d.x)),
                datasets: [{
                    label: label,
                    data: data.map(d => d.y),
                    borderColor: color,
                    backgroundColor: color + '20',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false
                    }
                }
            }
        });
    }

    renderSimpleCharts() {
        // Gráficos simples sin Chart.js (fallback)
        const charts = document.querySelectorAll('.chart-container');
        charts.forEach(chart => {
            const canvas = chart.querySelector('canvas');
            if (canvas) {
                canvas.style.display = 'none';
                chart.innerHTML += '<p style="text-align: center; color: #666;">Instala Chart.js para ver gráficos interactivos</p>';
            }
        });
    }

    renderGoalsView() {
        const latest = this.measurements[0];
        const progress = this.calculateProgress(latest);

        return `
            <div class="goals-container">
                <div class="goals-form">
                    <h3>Establecer Objetivos</h3>
                    <form onsubmit="window.bodyMeasurementsManager.handleGoalsSubmit(event)">
                        <div class="form-group">
                            <label>Peso objetivo (kg)</label>
                            <input type="number" step="0.1" id="goal-weight" value="${this.goals.weight || ''}" placeholder="Ej: 70">
                        </div>
                        <div class="form-group">
                            <label>Cintura objetivo (cm)</label>
                            <input type="number" step="0.1" id="goal-waist" value="${this.goals.waist || ''}" placeholder="Ej: 80">
                        </div>
                        <div class="form-group">
                            <label>Grasa corporal objetivo (%)</label>
                            <input type="number" step="0.1" id="goal-bodyfat" value="${this.goals.bodyFat || ''}" placeholder="Ej: 15">
                        </div>
                        <button type="submit" class="btn-primary">💾 Guardar Objetivos</button>
                    </form>
                </div>

                ${Object.keys(this.goals).some(k => this.goals[k]) ? `
                    <div class="goals-progress">
                        <h3>Progreso hacia Objetivos</h3>
                        ${this.goals.weight && latest?.weight ? `
                            <div class="progress-item">
                                <div class="progress-header">
                                    <span>Peso</span>
                                    <span>${latest.weight} kg / ${this.goals.weight} kg</span>
                                </div>
                                <div class="progress-bar">
                                    <div class="progress-fill" style="width: ${Math.min(100, (latest.weight / this.goals.weight) * 100)}%"></div>
                                </div>
                                <span class="progress-text">${this.calculateProgressText('weight', latest.weight, this.goals.weight)}</span>
                            </div>
                        ` : ''}
                        ${this.goals.waist && latest?.waist ? `
                            <div class="progress-item">
                                <div class="progress-header">
                                    <span>Cintura</span>
                                    <span>${latest.waist} cm / ${this.goals.waist} cm</span>
                                </div>
                                <div class="progress-bar">
                                    <div class="progress-fill" style="width: ${Math.min(100, (this.goals.waist / latest.waist) * 100)}%"></div>
                                </div>
                                <span class="progress-text">${this.calculateProgressText('waist', latest.waist, this.goals.waist)}</span>
                            </div>
                        ` : ''}
                        ${this.goals.bodyFat && latest?.bodyFat ? `
                            <div class="progress-item">
                                <div class="progress-header">
                                    <span>Grasa Corporal</span>
                                    <span>${latest.bodyFat}% / ${this.goals.bodyFat}%</span>
                                </div>
                                <div class="progress-bar">
                                    <div class="progress-fill" style="width: ${Math.min(100, (this.goals.bodyFat / latest.bodyFat) * 100)}%"></div>
                                </div>
                                <span class="progress-text">${this.calculateProgressText('bodyFat', latest.bodyFat, this.goals.bodyFat)}</span>
                            </div>
                        ` : ''}
                    </div>
                ` : ''}
            </div>
        `;
    }

    calculateProgressText(type, current, goal) {
        const diff = Math.abs(current - goal);
        if (type === 'weight' || type === 'bodyFat') {
            if (current > goal) {
                return `Faltan ${diff.toFixed(1)} ${type === 'weight' ? 'kg' : '%'} para alcanzar tu objetivo`;
            } else {
                return `¡Has alcanzado tu objetivo!`;
            }
        } else {
            if (current > goal) {
                return `Faltan ${diff.toFixed(1)} cm para alcanzar tu objetivo`;
            } else {
                return `¡Has alcanzado tu objetivo!`;
            }
        }
    }

    calculateProgress(latest) {
        if (!latest) return {};
        return {
            weight: this.goals.weight ? ((latest.weight / this.goals.weight) * 100) : null,
            waist: this.goals.waist ? ((this.goals.waist / latest.waist) * 100) : null,
            bodyFat: this.goals.bodyFat ? ((this.goals.bodyFat / latest.bodyFat) * 100) : null
        };
    }

    showAddForm() {
        const modal = document.createElement('div');
        modal.className = 'measurement-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>➕ Añadir Medidas</h3>
                    <button class="close-btn" onclick="this.closest('.measurement-modal').remove()">✕</button>
                </div>
                <form class="measurement-form" onsubmit="window.bodyMeasurementsManager.handleSubmit(event, this.closest('.measurement-modal'))">
                    <div class="form-row">
                        <div class="form-group">
                            <label>Peso (kg)</label>
                            <input type="number" step="0.1" name="weight" placeholder="Ej: 75.5">
                        </div>
                        <div class="form-group">
                            <label>Cintura (cm)</label>
                            <input type="number" step="0.1" name="waist" placeholder="Ej: 85">
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Cadera (cm)</label>
                            <input type="number" step="0.1" name="hips" placeholder="Ej: 95">
                        </div>
                        <div class="form-group">
                            <label>Pecho (cm)</label>
                            <input type="number" step="0.1" name="chest" placeholder="Ej: 100">
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Brazos (cm)</label>
                            <input type="number" step="0.1" name="arms" placeholder="Ej: 35">
                        </div>
                        <div class="form-group">
                            <label>Muslos (cm)</label>
                            <input type="number" step="0.1" name="thighs" placeholder="Ej: 60">
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Grasa Corporal (%)</label>
                        <input type="number" step="0.1" name="bodyFat" placeholder="Ej: 18.5">
                    </div>
                    <div class="form-group">
                        <label>Notas (opcional)</label>
                        <textarea name="notes" rows="3" placeholder="Ej: Después del entrenamiento"></textarea>
                    </div>
                    <button type="submit" class="btn-primary">💾 Guardar Medidas</button>
                </form>
            </div>
        `;
        document.body.appendChild(modal);
    }

    handleSubmit(event, modal) {
        event.preventDefault();
        const formData = new FormData(event.target);
        const data = {
            weight: formData.get('weight'),
            waist: formData.get('waist'),
            hips: formData.get('hips'),
            chest: formData.get('chest'),
            arms: formData.get('arms'),
            thighs: formData.get('thighs'),
            bodyFat: formData.get('bodyFat'),
            notes: formData.get('notes')
        };

        this.addMeasurement(data);
        modal.remove();
    }

    handleGoalsSubmit(event) {
        event.preventDefault();
        const goals = {
            weight: parseFloat(document.getElementById('goal-weight').value) || null,
            waist: parseFloat(document.getElementById('goal-waist').value) || null,
            bodyFat: parseFloat(document.getElementById('goal-bodyfat').value) || null
        };

        this.updateGoals(goals);
    }

    setView(view) {
        this.currentView = view;
        this.render();
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    }

    formatDateShort(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', { 
            month: 'short', 
            day: 'numeric' 
        });
    }

    showSuccessMessage(message) {
        const toast = document.createElement('div');
        toast.className = 'toast-success';
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }

    setupEventListeners() {
        // Event listeners se configuran en render()
    }

    addStyles() {
        if (document.getElementById('body-measurements-styles')) return;

        const style = document.createElement('style');
        style.id = 'body-measurements-styles';
        style.textContent = `
            .body-measurements-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
                flex-wrap: wrap;
                gap: 15px;
            }

            .measurements-view-toggle {
                display: flex;
                gap: 10px;
                margin-bottom: 20px;
                border-bottom: 2px solid #e0e0e0;
            }

            .measurements-view-toggle button {
                padding: 10px 20px;
                border: none;
                background: transparent;
                cursor: pointer;
                border-bottom: 3px solid transparent;
                transition: all 0.3s;
            }

            .measurements-view-toggle button.active {
                border-bottom-color: #667eea;
                color: #667eea;
                font-weight: bold;
            }

            .measurement-card {
                background: white;
                border-radius: 12px;
                padding: 20px;
                margin-bottom: 15px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }

            .measurement-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 15px;
            }

            .measurement-data {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                gap: 10px;
            }

            .measure-item {
                display: flex;
                justify-content: space-between;
            }

            .measure-item .label {
                color: #666;
            }

            .measure-item .value {
                font-weight: bold;
                color: #667eea;
            }

            .measurement-notes {
                margin-top: 15px;
                padding-top: 15px;
                border-top: 1px solid #e0e0e0;
                color: #666;
                font-style: italic;
            }

            .chart-container {
                background: white;
                border-radius: 12px;
                padding: 20px;
                margin-bottom: 20px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }

            .chart-container canvas {
                max-height: 300px;
            }

            .goals-container {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 20px;
            }

            .goals-form, .goals-progress {
                background: white;
                border-radius: 12px;
                padding: 20px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }

            .form-group {
                margin-bottom: 15px;
            }

            .form-group label {
                display: block;
                margin-bottom: 5px;
                font-weight: 500;
            }

            .form-group input, .form-group textarea {
                width: 100%;
                padding: 10px;
                border: 1px solid #ddd;
                border-radius: 8px;
                font-size: 1rem;
            }

            .form-row {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 15px;
            }

            .progress-item {
                margin-bottom: 20px;
            }

            .progress-header {
                display: flex;
                justify-content: space-between;
                margin-bottom: 10px;
            }

            .progress-bar {
                height: 20px;
                background: #e0e0e0;
                border-radius: 10px;
                overflow: hidden;
            }

            .progress-fill {
                height: 100%;
                background: linear-gradient(90deg, #667eea, #764ba2);
                transition: width 0.3s;
            }

            .progress-text {
                display: block;
                margin-top: 5px;
                font-size: 0.9rem;
                color: #666;
            }

            .measurement-modal {
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
                max-width: 600px;
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

            .empty-state {
                text-align: center;
                padding: 40px;
                color: #666;
            }

            .toast-success {
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: #4caf50;
                color: white;
                padding: 15px 25px;
                border-radius: 10px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.2);
                z-index: 10001;
            }

            @media (max-width: 768px) {
                .goals-container {
                    grid-template-columns: 1fr;
                }

                .form-row {
                    grid-template-columns: 1fr;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// Exportar para uso global
window.BodyMeasurementsManager = BodyMeasurementsManager;

