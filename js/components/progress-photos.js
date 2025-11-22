// Sistema de Fotos de Progreso para EntrenoApp
// Inspirado en MyFitnessPal y Strong

class ProgressPhotosManager {
    constructor() {
        this.photos = [];
        this.currentView = 'list'; // 'list', 'compare', 'timeline'
        this.selectedPhotos = [];
        console.log('📸 ProgressPhotosManager: Constructor llamado');
        this.init();
    }

    async init() {
        console.log('📸 ProgressPhotosManager: Inicializando...');
        this.loadPhotos();
        this.setupEventListeners();
        console.log('📸 ProgressPhotosManager: Inicialización completa,', this.photos.length, 'fotos cargadas');
    }

    loadPhotos() {
        try {
            const saved = localStorage.getItem('entrenoapp_progress_photos');
            this.photos = saved ? JSON.parse(saved) : [];
            this.photos.sort((a, b) => new Date(b.date) - new Date(a.date));
        } catch (error) {
            console.error('Error cargando fotos:', error);
            this.photos = [];
        }
    }

    savePhotos() {
        try {
            localStorage.setItem('entrenoapp_progress_photos', JSON.stringify(this.photos));
        } catch (error) {
            console.error('Error guardando fotos:', error);
        }
    }

    async takePhoto(type = 'front') {
        try {
            console.log('📸 Intentando tomar foto tipo:', type);
            
            // Verificar si estamos en móvil y usar input file como fallback
            const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            
            // Verificar soporte de cámara
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                console.warn('⚠️ Cámara no disponible, usando input file');
                this.useFileInput(type);
                return;
            }

            // Solicitar acceso a la cámara
            console.log('📸 Solicitando acceso a la cámara...');
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { 
                    facingMode: type === 'back' ? 'environment' : 'user',
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                } 
            });

            console.log('✅ Acceso a cámara concedido');

            // Crear modal para captura
            const modal = this.createCaptureModal(null, type, stream);
            document.body.appendChild(modal);
        } catch (error) {
            console.error('❌ Error accediendo a la cámara:', error);
            // Si falla, usar input file como fallback
            if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
                alert('Permisos de cámara denegados. Usando selector de archivos...');
            } else {
                alert('No se pudo acceder a la cámara. Usando selector de archivos...');
            }
            this.useFileInput(type);
        }
    }

    useFileInput(type) {
        // Crear input file oculto
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.capture = 'environment'; // Usar cámara trasera en móvil si está disponible
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (event) => {
                const photoData = event.target.result;
                this.savePhoto({
                    id: Date.now().toString(),
                    type: type,
                    data: photoData,
                    date: new Date().toISOString(),
                    notes: ''
                });
                this.showSuccessMessage('✅ Foto guardada exitosamente');
            };
            reader.readAsDataURL(file);
        };

        input.click();
    }

    createCaptureModal(video, type, stream) {
        const modal = document.createElement('div');
        modal.className = 'progress-photo-modal';
        modal.innerHTML = `
            <div class="photo-capture-container">
                <div class="photo-capture-header">
                    <h3>Foto ${this.getTypeLabel(type)}</h3>
                    <button class="close-btn" onclick="window.progressPhotosManager.closeCameraModal(this.closest('.progress-photo-modal'))">✕</button>
                </div>
                <div class="photo-preview-container">
                    <video id="photo-video" autoplay playsinline muted></video>
                    <canvas id="photo-canvas" style="display: none;"></canvas>
                </div>
                <div class="photo-capture-actions">
                    <button class="btn-capture" onclick="window.progressPhotosManager.capturePhoto('${type}', this.closest('.progress-photo-modal'))">
                        📸 Capturar
                    </button>
                </div>
                <div class="photo-capture-tips">
                    <p>💡 Consejos:</p>
                    <ul>
                        <li>Buena iluminación</li>
                        <li>Misma hora del día</li>
                        <li>Misma ropa (opcional)</li>
                        <li>Misma posición</li>
                    </ul>
                </div>
            </div>
        `;

        // Asignar stream al video y manejar eventos
        setTimeout(() => {
            const videoEl = modal.querySelector('#photo-video');
            if (videoEl && stream) {
                videoEl.srcObject = stream;
                videoEl.onloadedmetadata = () => {
                    console.log('📸 Video cargado, dimensiones:', videoEl.videoWidth, 'x', videoEl.videoHeight);
                    videoEl.play().catch(err => {
                        console.error('Error reproduciendo video:', err);
                    });
                };
                videoEl.onerror = (err) => {
                    console.error('Error en video:', err);
                };
            }
        }, 100);

        // Cerrar modal al hacer clic fuera (solo en desktop)
        modal.addEventListener('click', (e) => {
            if (e.target === modal && window.innerWidth >= 768) {
                this.closeCameraModal(modal);
            }
        });

        return modal;
    }

    closeCameraModal(modal) {
        if (!modal) return;
        
        const videoEl = modal.querySelector('#photo-video');
        if (videoEl && videoEl.srcObject) {
            const tracks = videoEl.srcObject.getTracks();
            tracks.forEach(track => {
                track.stop();
                console.log('📸 Stream detenido');
            });
        }
        modal.remove();
    }

    capturePhoto(type, modal) {
        const video = modal.querySelector('#photo-video');
        const canvas = modal.querySelector('#photo-canvas');
        
        if (!video || !canvas) return;

        // Configurar canvas
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Capturar frame
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0);

        // Convertir a base64
        const photoData = canvas.toDataURL('image/jpeg', 0.8);

        // Guardar foto
        this.savePhoto({
            id: Date.now().toString(),
            type: type,
            data: photoData,
            date: new Date().toISOString(),
            notes: ''
        });

        // Detener stream
        if (video && video.srcObject) {
            video.srcObject.getTracks().forEach(track => {
                track.stop();
                console.log('📸 Stream detenido después de capturar');
            });
        }
        
        // Cerrar modal
        this.closeCameraModal(modal);

        // Mostrar mensaje de éxito
        this.showSuccessMessage('Foto guardada correctamente');
        
        // Recargar vista
        this.render();
    }

    savePhoto(photo) {
        this.photos.push(photo);
        this.savePhotos();
    }

    deletePhoto(photoId) {
        if (confirm('¿Estás seguro de que quieres eliminar esta foto?')) {
            this.photos = this.photos.filter(p => p.id !== photoId);
            this.savePhotos();
            this.render();
        }
    }

    getTypeLabel(type) {
        const labels = {
            'front': 'Frontal',
            'side': 'Lateral',
            'back': 'Trasera'
        };
        return labels[type] || type;
    }

    render() {
        const container = document.getElementById('progress-photos-container');
        if (!container) {
            console.warn('⚠️ ProgressPhotosManager: Contenedor progress-photos-container no encontrado');
            return;
        }
        console.log('📸 ProgressPhotosManager: Renderizando...');

        container.innerHTML = `
            <div class="progress-photos-header">
                <h2 style="margin: 0; color: #fff; font-size: 1.5rem; font-weight: bold;">📸 Fotos de Progreso</h2>
                <div class="photo-actions">
                    <button class="btn-primary" onclick="if(window.progressPhotosManager) { window.progressPhotosManager.takePhoto('front'); } else { alert('Cargando...'); }" style="min-width: 120px; padding: 15px 20px; font-size: 1.1rem;">
                        📷 Frontal
                    </button>
                    <button class="btn-primary" onclick="if(window.progressPhotosManager) { window.progressPhotosManager.takePhoto('side'); } else { alert('Cargando...'); }" style="min-width: 120px; padding: 15px 20px; font-size: 1.1rem;">
                        📷 Lateral
                    </button>
                    <button class="btn-primary" onclick="if(window.progressPhotosManager) { window.progressPhotosManager.takePhoto('back'); } else { alert('Cargando...'); }" style="min-width: 120px; padding: 15px 20px; font-size: 1.1rem;">
                        📷 Trasera
                    </button>
                </div>
            </div>

            <div class="progress-photos-view-toggle">
                <button class="${this.currentView === 'list' ? 'active' : ''}" onclick="window.progressPhotosManager.setView('list')">
                    📋 Lista
                </button>
                <button class="${this.currentView === 'compare' ? 'active' : ''}" onclick="window.progressPhotosManager.setView('compare')">
                    ⚖️ Comparar
                </button>
                <button class="${this.currentView === 'timeline' ? 'active' : ''}" onclick="window.progressPhotosManager.setView('timeline')">
                    📅 Timeline
                </button>
            </div>

            <div class="progress-photos-content" style="padding: 20px;">
                ${this.renderCurrentView()}
            </div>
        `;

        this.addStyles();
    }

    renderCurrentView() {
        switch (this.currentView) {
            case 'list':
                return this.renderListView();
            case 'compare':
                return this.renderCompareView();
            case 'timeline':
                return this.renderTimelineView();
            default:
                return this.renderListView();
        }
    }

    renderListView() {
        if (this.photos.length === 0) {
            return `
                <div class="empty-state">
                    <p>📸 No tienes fotos de progreso aún</p>
                    <p>¡Toma tu primera foto para empezar a ver tu transformación!</p>
                </div>
            `;
        }

        // Agrupar por tipo
        const byType = {
            front: this.photos.filter(p => p.type === 'front'),
            side: this.photos.filter(p => p.type === 'side'),
            back: this.photos.filter(p => p.type === 'back')
        };

        return `
            <div class="photos-by-type">
                ${Object.keys(byType).map(type => `
                    <div class="photo-type-section">
                        <h3>${this.getTypeLabel(type)} (${byType[type].length})</h3>
                        <div class="photo-grid">
                            ${byType[type].map(photo => `
                                <div class="photo-card">
                                    <img src="${photo.data}" alt="Foto ${this.getTypeLabel(photo.type)}">
                                    <div class="photo-info">
                                        <span class="photo-date">${this.formatDate(photo.date)}</span>
                                        <button class="btn-delete" onclick="window.progressPhotosManager.deletePhoto('${photo.id}')">
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    renderCompareView() {
        if (this.photos.length < 2) {
            return `
                <div class="empty-state">
                    <p>Necesitas al menos 2 fotos para comparar</p>
                </div>
            `;
        }

        // Agrupar por tipo
        const byType = {
            front: this.photos.filter(p => p.type === 'front').sort((a, b) => new Date(a.date) - new Date(b.date)),
            side: this.photos.filter(p => p.type === 'side').sort((a, b) => new Date(a.date) - new Date(b.date)),
            back: this.photos.filter(p => p.type === 'back').sort((a, b) => new Date(a.date) - new Date(b.date))
        };

        return `
            <div class="photo-compare-container">
                ${Object.keys(byType).filter(type => byType[type].length >= 2).map(type => `
                    <div class="compare-section">
                        <h3>${this.getTypeLabel(type)}</h3>
                        <div class="compare-slider">
                            <div class="compare-before">
                                <img src="${byType[type][0].data}" alt="Antes">
                                <span class="compare-label">Antes (${this.formatDate(byType[type][0].date)})</span>
                            </div>
                            <div class="compare-after">
                                <img src="${byType[type][byType[type].length - 1].data}" alt="Después">
                                <span class="compare-label">Después (${this.formatDate(byType[type][byType[type].length - 1].date)})</span>
                            </div>
                        </div>
                        <div class="compare-time-diff">
                            <p>⏱️ Diferencia: ${this.calculateTimeDiff(byType[type][0].date, byType[type][byType[type].length - 1].date)}</p>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    renderTimelineView() {
        if (this.photos.length === 0) {
            return `
                <div class="empty-state">
                    <p>No hay fotos para mostrar en el timeline</p>
                </div>
            `;
        }

        // Agrupar por mes
        const byMonth = {};
        this.photos.forEach(photo => {
            const date = new Date(photo.date);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            if (!byMonth[monthKey]) {
                byMonth[monthKey] = [];
            }
            byMonth[monthKey].push(photo);
        });

        return `
            <div class="photo-timeline">
                ${Object.keys(byMonth).sort().reverse().map(monthKey => {
                    const photos = byMonth[monthKey];
                    const date = new Date(photos[0].date);
                    return `
                        <div class="timeline-month">
                            <h3>${this.formatMonth(date)}</h3>
                            <div class="timeline-photos">
                                ${photos.map(photo => `
                                    <div class="timeline-photo">
                                        <img src="${photo.data}" alt="Foto ${this.getTypeLabel(photo.type)}">
                                        <span class="timeline-date">${this.formatDate(photo.date)}</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    setView(view) {
        this.currentView = view;
        this.render();
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
    }

    formatMonth(date) {
        return date.toLocaleDateString('es-ES', { 
            year: 'numeric', 
            month: 'long' 
        });
    }

    calculateTimeDiff(date1, date2) {
        const diff = Math.abs(new Date(date2) - new Date(date1));
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const weeks = Math.floor(days / 7);
        const months = Math.floor(days / 30);
        
        if (months > 0) return `${months} mes${months > 1 ? 'es' : ''}`;
        if (weeks > 0) return `${weeks} semana${weeks > 1 ? 's' : ''}`;
        return `${days} día${days > 1 ? 's' : ''}`;
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
        if (document.getElementById('progress-photos-styles')) return;

        const style = document.createElement('style');
        style.id = 'progress-photos-styles';
        style.textContent = `
            .progress-photos-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
                flex-wrap: wrap;
                gap: 15px;
                padding: 20px;
                background: rgba(255, 255, 255, 0.1);
                backdrop-filter: blur(10px);
                border-radius: 12px;
                border: 1px solid rgba(255, 255, 255, 0.2);
            }

            .progress-photos-header h2 {
                margin: 0;
                color: #fff;
                font-size: 1.5rem;
            }

            .photo-actions {
                display: flex;
                gap: 10px;
                flex-wrap: wrap;
            }

            .btn-primary {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
                color: white !important;
                border: none !important;
                padding: 15px 24px !important;
                border-radius: 12px !important;
                font-size: 1.1rem !important;
                font-weight: 600 !important;
                cursor: pointer !important;
                box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4) !important;
                transition: all 0.3s !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                gap: 8px !important;
                min-width: 120px !important;
            }

            .btn-primary:hover {
                transform: translateY(-2px) !important;
                box-shadow: 0 6px 16px rgba(102, 126, 234, 0.5) !important;
            }

            .btn-primary:active {
                transform: translateY(0) !important;
            }

            .progress-photos-view-toggle {
                display: flex;
                gap: 10px;
                margin-bottom: 20px;
                border-bottom: 2px solid rgba(255, 255, 255, 0.2);
                padding: 0 20px;
            }

            .progress-photos-view-toggle button {
                padding: 12px 20px;
                border: none;
                background: transparent;
                cursor: pointer;
                border-bottom: 3px solid transparent;
                transition: all 0.3s;
                color: rgba(255, 255, 255, 0.7);
                font-size: 1rem;
            }

            .progress-photos-view-toggle button:hover {
                color: rgba(255, 255, 255, 0.9);
            }

            .progress-photos-view-toggle button.active {
                border-bottom-color: #667eea;
                color: #fff;
                font-weight: bold;
            }

            .photo-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
                gap: 15px;
                margin-top: 15px;
            }

            .photo-card {
                background: white;
                border-radius: 12px;
                overflow: hidden;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }

            .photo-card img {
                width: 100%;
                height: 200px;
                object-fit: cover;
            }

            .photo-info {
                padding: 10px;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .photo-date {
                font-size: 0.85rem;
                color: #666;
            }

            .btn-delete {
                background: #ff4444;
                color: white;
                border: none;
                padding: 5px 10px;
                border-radius: 5px;
                cursor: pointer;
            }

            .progress-photo-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.95);
                z-index: 10000;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 0;
                margin: 0;
            }

            .photo-capture-container {
                background: #000;
                border-radius: 0;
                padding: 0;
                width: 100%;
                height: 100%;
                max-width: 100%;
                max-height: 100%;
                overflow: hidden;
                display: flex;
                flex-direction: column;
                position: relative;
            }

            .photo-capture-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 15px 20px;
                background: rgba(0,0,0,0.7);
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                z-index: 10001;
            }

            .photo-capture-header h3 {
                color: white;
                margin: 0;
                font-size: 1.2rem;
            }

            .close-btn {
                background: rgba(255,68,68,0.9);
                color: white;
                border: none;
                width: 40px;
                height: 40px;
                border-radius: 50%;
                cursor: pointer;
                font-size: 1.2rem;
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10002;
            }

            .photo-preview-container {
                flex: 1;
                display: flex;
                align-items: center;
                justify-content: center;
                position: relative;
                width: 100%;
                height: 100%;
                overflow: hidden;
            }

            #photo-video {
                width: 100%;
                height: 100%;
                max-width: 100%;
                max-height: 100%;
                object-fit: cover;
                border-radius: 0;
                transform: scaleX(-1); /* Espejo para selfie */
                background: #000;
            }

            @media (min-width: 768px) {
                .photo-capture-container {
                    background: white;
                    border-radius: 20px;
                    padding: 20px;
                    width: auto;
                    height: auto;
                    max-width: 90%;
                    max-height: 90%;
                }

                .photo-capture-header {
                    position: relative;
                    background: transparent;
                    padding: 0 0 20px 0;
                }

                .photo-capture-header h3 {
                    color: #333;
                }

                .photo-preview-container {
                    height: auto;
                }

                #photo-video {
                    width: 100%;
                    max-width: 500px;
                    height: auto;
                    border-radius: 10px;
                }
            }

            .photo-capture-actions {
                padding: 20px;
                text-align: center;
                background: rgba(0,0,0,0.7);
                position: absolute;
                bottom: 0;
                left: 0;
                right: 0;
                z-index: 10001;
            }

            .btn-capture {
                background: #667eea;
                color: white;
                border: none;
                padding: 18px 40px;
                border-radius: 50px;
                font-size: 1.2rem;
                cursor: pointer;
                box-shadow: 0 4px 12px rgba(102, 126, 234, 0.5);
                font-weight: 600;
                min-width: 150px;
            }

            .btn-capture:active {
                transform: scale(0.95);
            }

            @media (min-width: 768px) {
                .photo-capture-actions {
                    position: relative;
                    background: transparent;
                    padding: 20px 0 0 0;
                }
            }

            .photo-capture-tips {
                padding: 15px 20px;
                background: rgba(0,0,0,0.6);
                color: white;
                font-size: 0.9rem;
                position: absolute;
                bottom: 100px;
                left: 0;
                right: 0;
                z-index: 10001;
                display: none;
            }

            .photo-capture-tips p {
                margin: 0 0 10px 0;
                font-weight: 600;
            }

            .photo-capture-tips ul {
                margin: 0;
                padding-left: 20px;
            }

            .photo-capture-tips li {
                margin: 5px 0;
            }

            @media (min-width: 768px) {
                .photo-capture-tips {
                    position: relative;
                    background: rgba(255,255,255,0.1);
                    color: #333;
                    bottom: auto;
                    margin-top: 20px;
                    display: block;
                }
            }

            .compare-slider {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 20px;
                margin-top: 20px;
            }

            .compare-before, .compare-after {
                position: relative;
            }

            .compare-before img, .compare-after img {
                width: 100%;
                border-radius: 10px;
            }

            .compare-label {
                display: block;
                margin-top: 10px;
                text-align: center;
                font-weight: bold;
            }

            .photo-timeline {
                margin-top: 20px;
            }

            .timeline-month {
                margin-bottom: 30px;
            }

            .timeline-photos {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
                gap: 15px;
                margin-top: 15px;
            }

            .timeline-photo img {
                width: 100%;
                border-radius: 8px;
            }

            .timeline-date {
                display: block;
                margin-top: 5px;
                font-size: 0.8rem;
                color: #666;
            }

            .empty-state {
                text-align: center;
                padding: 40px;
                color: rgba(255, 255, 255, 0.8);
                background: rgba(255, 255, 255, 0.05);
                border-radius: 12px;
                margin: 20px 0;
            }

            .empty-state p {
                margin: 10px 0;
                font-size: 1.1rem;
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
        `;
        document.head.appendChild(style);
    }
}

// Exportar para uso global
window.ProgressPhotosManager = ProgressPhotosManager;

