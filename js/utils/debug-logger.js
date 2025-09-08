// Sistema de logging avanzado para debugging de EntrenoApp
export class DebugLogger {
    constructor() {
        this.logs = [];
        this.maxLogs = 100;
        this.isDebugMode = this.checkDebugMode();
        this.init();
    }

    init() {
        if (this.isDebugMode) {
            console.log('🔍 Debug Logger activado - Registrando todos los eventos');
            this.setupErrorCatching();
        }
    }

    checkDebugMode() {
        // Activar debug si hay ?debug en la URL o está en localStorage
        return window.location.search.includes('debug') || 
               localStorage.getItem('entrenoapp_debug') === 'true';
    }

    setupErrorCatching() {
        // Capturar errores de JavaScript
        window.addEventListener('error', (event) => {
            this.logError('JS_ERROR', {
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                stack: event.error?.stack
            });
        });

        // Capturar promesas rechazadas
        window.addEventListener('unhandledrejection', (event) => {
            this.logError('PROMISE_REJECTION', {
                reason: event.reason,
                promise: event.promise
            });
        });
    }

    log(level, category, message, data = null) {
        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            level,
            category,
            message,
            data,
            url: window.location.href,
            userAgent: navigator.userAgent
        };

        this.logs.push(logEntry);
        
        // Mantener solo los últimos maxLogs
        if (this.logs.length > this.maxLogs) {
            this.logs = this.logs.slice(-this.maxLogs);
        }

        // Console output con formato
        const emoji = this.getEmojiForLevel(level);
        const color = this.getColorForLevel(level);
        
        if (this.isDebugMode || level === 'ERROR') {
            console.group(`${emoji} [${category}] ${message}`);
            if (data) {
                console.log('Data:', data);
            }
            console.log('Timestamp:', timestamp);
            console.groupEnd();
        }

        // Guardar en localStorage si es debug mode
        if (this.isDebugMode) {
            this.saveToStorage();
        }
    }

    logInfo(category, message, data) {
        this.log('INFO', category, message, data);
    }

    logWarning(category, message, data) {
        this.log('WARNING', category, message, data);
    }

    logError(category, message, data) {
        this.log('ERROR', category, message, data);
    }

    logSuccess(category, message, data) {
        this.log('SUCCESS', category, message, data);
    }

    getEmojiForLevel(level) {
        const emojis = {
            'INFO': 'ℹ️',
            'WARNING': '⚠️',
            'ERROR': '❌',
            'SUCCESS': '✅'
        };
        return emojis[level] || 'ℹ️';
    }

    getColorForLevel(level) {
        const colors = {
            'INFO': '#2196F3',
            'WARNING': '#FF9800',
            'ERROR': '#F44336',
            'SUCCESS': '#4CAF50'
        };
        return colors[level] || '#2196F3';
    }

    saveToStorage() {
        try {
            localStorage.setItem('entrenoapp_debug_logs', JSON.stringify(this.logs));
        } catch (error) {
            console.error('Error guardando logs:', error);
        }
    }

    loadFromStorage() {
        try {
            const saved = localStorage.getItem('entrenoapp_debug_logs');
            if (saved) {
                this.logs = JSON.parse(saved);
            }
        } catch (error) {
            console.error('Error cargando logs:', error);
        }
    }

    exportLogs() {
        return {
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href,
            logs: this.logs
        };
    }

    clearLogs() {
        this.logs = [];
        localStorage.removeItem('entrenoapp_debug_logs');
        console.log('🧹 Logs limpiados');
    }

    enableDebugMode() {
        localStorage.setItem('entrenoapp_debug', 'true');
        this.isDebugMode = true;
        this.init();
        console.log('🔍 Debug mode ACTIVADO');
    }

    disableDebugMode() {
        localStorage.removeItem('entrenoapp_debug');
        this.isDebugMode = false;
        console.log('🔍 Debug mode DESACTIVADO');
    }

    // Método para mostrar panel de debug en la UI
    showDebugPanel() {
        if (!this.isDebugMode) return;

        const panel = document.createElement('div');
        panel.id = 'debug-panel';
        panel.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            width: 300px;
            max-height: 400px;
            background: rgba(0,0,0,0.9);
            color: white;
            padding: 15px;
            border-radius: 10px;
            font-family: monospace;
            font-size: 12px;
            z-index: 10000;
            overflow-y: auto;
            border: 2px solid #00D4FF;
        `;

        const lastLogs = this.logs.slice(-10);
        panel.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <strong>🔍 Debug Panel</strong>
                <button onclick="window.debugLogger.hideDebugPanel()" style="background: #ff4444; border: none; color: white; padding: 2px 6px; border-radius: 3px; cursor: pointer;">×</button>
            </div>
            <div style="max-height: 300px; overflow-y: auto;">
                ${lastLogs.map(log => `
                    <div style="margin-bottom: 5px; padding: 5px; background: rgba(255,255,255,0.1); border-radius: 3px;">
                        <div style="color: #00D4FF;">[${log.category}] ${log.message}</div>
                        <div style="color: #ccc; font-size: 10px;">${new Date(log.timestamp).toLocaleTimeString()}</div>
                    </div>
                `).join('')}
            </div>
            <div style="margin-top: 10px; text-align: center;">
                <button onclick="window.debugLogger.clearLogs()" style="background: #ff6600; border: none; color: white; padding: 5px 10px; border-radius: 3px; cursor: pointer; margin-right: 5px;">Limpiar</button>
                <button onclick="console.log(window.debugLogger.exportLogs())" style="background: #00aa00; border: none; color: white; padding: 5px 10px; border-radius: 3px; cursor: pointer;">Exportar</button>
            </div>
        `;

        document.body.appendChild(panel);
    }

    hideDebugPanel() {
        const panel = document.getElementById('debug-panel');
        if (panel) {
            panel.remove();
        }
    }
}

// Instancia global
window.debugLogger = new DebugLogger();

// Funciones de conveniencia globales
window.enableDebug = () => window.debugLogger.enableDebugMode();
window.disableDebug = () => window.debugLogger.disableDebugMode();
window.showDebugPanel = () => window.debugLogger.showDebugPanel();
window.exportDebugLogs = () => console.log(window.debugLogger.exportLogs());

console.log('🔍 Debug Logger cargado. Usa enableDebug() para activar.');
