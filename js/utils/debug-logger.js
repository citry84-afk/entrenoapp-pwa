// Sistema de logging avanzado para debugging de EntrenoApp
class DebugLogger {
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
        // Debug desactivado para producción
        return false;
        
        // Para activar debug, usar: localStorage.setItem('entrenoapp_debug', 'true')
        // return window.location.search.includes('debug') || 
        //        localStorage.getItem('entrenoapp_debug') === 'true';
    }

    setupErrorCatching() {
        // Capturar errores de JavaScript
        window.addEventListener('error', (event) => {
            this.logError('JS_ERROR', `Error: ${event.message}`, {
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                stack: event.error?.stack
            });
        });

        // Capturar promesas rechazadas
        window.addEventListener('unhandledrejection', (event) => {
            const reason = event.reason?.message || event.reason;
            this.logError('PROMISE_REJECTION', `Promise rejected: ${reason}`, {
                reason: reason,
                stack: event.reason?.stack,
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
            // Actualizar panel si está visible
            setTimeout(() => this.updateDebugPanel(), 100);
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
            width: 350px;
            max-height: 500px;
            background: rgba(0,0,0,0.95);
            color: white;
            padding: 15px;
            border-radius: 10px;
            font-family: monospace;
            font-size: 11px;
            z-index: 10000;
            overflow-y: auto;
            border: 2px solid #00D4FF;
            box-shadow: 0 4px 20px rgba(0,0,0,0.5);
        `;

        const lastLogs = this.logs.slice(-15);
        panel.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <strong>🔍 Debug Panel</strong>
                <button onclick="window.debugLogger.hideDebugPanel()" style="background: #ff4444; border: none; color: white; padding: 2px 6px; border-radius: 3px; cursor: pointer;">×</button>
            </div>
            <div style="max-height: 350px; overflow-y: auto;" id="debug-logs-container">
                ${lastLogs.map(log => `
                    <div style="margin-bottom: 5px; padding: 5px; background: rgba(255,255,255,0.1); border-radius: 3px; border-left: 3px solid ${this.getColorForLevel(log.level)};">
                        <div style="color: #00D4FF; font-weight: bold;">[${log.category}] ${log.message}</div>
                        ${log.data ? `<div style="color: #ffff88; font-size: 10px;">Data: ${JSON.stringify(log.data, null, 2)}</div>` : ''}
                        <div style="color: #ccc; font-size: 9px;">${new Date(log.timestamp).toLocaleTimeString()}</div>
                    </div>
                `).join('')}
            </div>
            <div style="margin-top: 10px; text-align: center;">
                <button onclick="window.debugLogger.clearLogs()" style="background: #ff6600; border: none; color: white; padding: 5px 8px; border-radius: 3px; cursor: pointer; margin: 2px; font-size: 10px;">🧹 Limpiar</button>
                <button onclick="window.debugLogger.copyLogsToClipboard()" style="background: #00aa00; border: none; color: white; padding: 5px 8px; border-radius: 3px; cursor: pointer; margin: 2px; font-size: 10px;">📋 Copiar</button>
                <button onclick="window.debugLogger.downloadLogs()" style="background: #0066cc; border: none; color: white; padding: 5px 8px; border-radius: 3px; cursor: pointer; margin: 2px; font-size: 10px;">📥 Descargar</button>
            </div>
        `;

        document.body.appendChild(panel);
        
        // Auto-scroll al final
        const container = document.getElementById('debug-logs-container');
        if (container) {
            container.scrollTop = container.scrollHeight;
        }
    }

    hideDebugPanel() {
        const panel = document.getElementById('debug-panel');
        if (panel) {
            panel.remove();
        }
    }

    // Copiar logs al portapapeles
    async copyLogsToClipboard() {
        const logText = this.formatLogsForExport();
        try {
            await navigator.clipboard.writeText(logText);
            alert('📋 Logs copiados al portapapeles!\nPégalos en tu respuesta para que pueda ayudarte.');
        } catch (err) {
            console.error('Error copiando al portapapeles:', err);
            this.downloadLogs();
        }
    }

    // Descargar logs como archivo
    downloadLogs() {
        const logText = this.formatLogsForExport();
        const blob = new Blob([logText], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `entrenoapp-debug-${new Date().toISOString().slice(0,19).replace(/:/g, '-')}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }

    // Formatear logs para exportar
    formatLogsForExport() {
        const header = `
=== ENTRENOAPP DEBUG LOGS ===
Timestamp: ${new Date().toISOString()}
URL: ${window.location.href}
User Agent: ${navigator.userAgent}
Debug Mode: ${this.isDebugMode}
Total Logs: ${this.logs.length}

=== LOGS ===
`;
        
        const formattedLogs = this.logs.map(log => {
            let formatted = `[${log.timestamp}] ${log.level} - ${log.category}: ${log.message}`;
            if (log.data) {
                formatted += `\nData: ${JSON.stringify(log.data, null, 2)}`;
            }
            return formatted;
        }).join('\n\n');

        return header + formattedLogs;
    }

    // Actualizar panel de debug
    updateDebugPanel() {
        const panel = document.getElementById('debug-panel');
        if (panel && this.isDebugMode) {
            this.hideDebugPanel();
            this.showDebugPanel();
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

// Debug panel desactivado para producción
// Para activar: localStorage.setItem('entrenoapp_debug', 'true') y recargar
