// Sistema de gestión de anuncios para EntrenoApp
class AdsManager {
    constructor() {
        this.isAdSenseLoaded = false;
        this.adCount = 0;
        this.maxAdsPerSession = 5;
        this.adCooldown = 30000; // 30 segundos entre anuncios
        this.lastAdTime = 0;
        this.init();
    }

    init() {
        // Esperar a que AdSense se cargue
        this.waitForAdSense();
        
        // Configurar eventos de tracking
        this.setupEventTracking();
    }

    waitForAdSense() {
        const checkAdSense = () => {
            if (window.adsbygoogle) {
                this.isAdSenseLoaded = true;
                console.log('✅ Google AdSense cargado correctamente');
                this.initializeAds();
            } else {
                setTimeout(checkAdSense, 100);
            }
        };
        checkAdSense();
    }

    initializeAds() {
        // Inicializar anuncios existentes
        this.pushAdUnits();
        
        // Mostrar banner principal
        this.showMainBanner();
    }

    pushAdUnits() {
        if (window.adsbygoogle && this.isAdSenseLoaded) {
            try {
                (adsbygoogle = window.adsbygoogle || []).push({});
                console.log('📢 Anuncios AdSense inicializados');
            } catch (error) {
                console.error('❌ Error inicializando anuncios:', error);
            }
        }
    }

    showMainBanner() {
        const banner = document.getElementById('ad-banner');
        if (banner) {
            banner.style.display = 'block';
            this.pushAdUnits();
        }
    }

    // Mostrar anuncio intersticial después de completar entrenamiento
    showInterstitialAd() {
        if (!this.canShowAd()) return false;

        const now = Date.now();
        if (now - this.lastAdTime < this.adCooldown) {
            console.log('⏳ Anuncio en cooldown, esperando...');
            return false;
        }

        if (this.adCount >= this.maxAdsPerSession) {
            console.log('📊 Límite de anuncios por sesión alcanzado');
            return false;
        }

        this.createInterstitialAd();
        this.lastAdTime = now;
        this.adCount++;
        
        // Trackear evento
        this.trackAdEvent('interstitial_shown');
        
        return true;
    }

    createInterstitialAd() {
        const modal = document.createElement('div');
        modal.className = 'interstitial-ad-modal';
        modal.innerHTML = `
            <div class="ad-modal-content glass-effect">
                <div class="ad-header">
                    <h3>🎯 Entrenamiento Completado</h3>
                    <button class="ad-close" onclick="window.adsManager.closeInterstitialAd()">×</button>
                </div>
                <div class="ad-body">
                    <div class="ad-container">
                        <ins class="adsbygoogle"
                             style="display:block"
                             data-ad-client="ca-pub-4129506161314540"
                             data-ad-slot="6673201053"
                             data-ad-format="auto"
                             data-full-width-responsive="true"></ins>
                    </div>
                    <div class="ad-footer">
                        <p class="ad-text">¡Sigue así! 💪</p>
                        <button class="glass-button glass-button-primary" onclick="window.adsManager.closeInterstitialAd()">
                            Continuar
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        this.pushAdUnits();

        // Auto-cerrar después de 10 segundos
        setTimeout(() => {
            this.closeInterstitialAd();
        }, 10000);
    }

    closeInterstitialAd() {
        const modal = document.querySelector('.interstitial-ad-modal');
        if (modal) {
            modal.remove();
        }
    }

    canShowAd() {
        return this.isAdSenseLoaded && 
               this.adCount < this.maxAdsPerSession &&
               (Date.now() - this.lastAdTime) >= this.adCooldown;
    }

    // Mostrar anuncio de recompensa (por ver anuncio completo)
    showRewardAd() {
        if (!this.canShowAd()) return false;

        const modal = document.createElement('div');
        modal.className = 'reward-ad-modal';
        modal.innerHTML = `
            <div class="ad-modal-content glass-effect">
                <div class="ad-header">
                    <h3>🎁 Recompensa Extra</h3>
                </div>
                <div class="ad-body">
                    <div class="reward-info">
                        <div class="reward-icon">💎</div>
                        <h4>¡Gana puntos extra!</h4>
                        <p>Mira este anuncio y obtén 50 puntos adicionales</p>
                    </div>
                    <div class="ad-container">
                        <ins class="adsbygoogle"
                             style="display:block"
                             data-ad-client="ca-pub-4129506161314540"
                             data-ad-slot="6673201053"
                             data-ad-format="auto"
                             data-full-width-responsive="true"></ins>
                    </div>
                    <div class="ad-footer">
                        <button class="glass-button glass-button-success" onclick="window.adsManager.claimReward()">
                            🎁 Reclamar Recompensa
                        </button>
                        <button class="glass-button glass-button-secondary" onclick="window.adsManager.closeRewardAd()">
                            Saltar
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        this.pushAdUnits();
        
        return true;
    }

    claimReward() {
        // Añadir puntos al usuario
        this.addUserPoints(50);
        this.trackAdEvent('reward_claimed', { points: 50 });
        this.closeRewardAd();
        
        // Mostrar notificación
        this.showNotification('🎉 ¡50 puntos extra añadidos!');
    }

    closeRewardAd() {
        const modal = document.querySelector('.reward-ad-modal');
        if (modal) {
            modal.remove();
        }
    }

    addUserPoints(points) {
        // Aquí se integraría con el sistema de puntos del usuario
        console.log(`💰 Añadiendo ${points} puntos al usuario`);
        // TODO: Integrar con el sistema de puntos existente
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'ad-notification glass-effect';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 212, 255, 0.9);
            color: white;
            padding: 12px 24px;
            border-radius: 25px;
            z-index: 10000;
            font-weight: bold;
            animation: slideDown 0.3s ease-out;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    setupEventTracking() {
        // Trackear eventos importantes para Analytics
        document.addEventListener('workout_completed', () => {
            this.trackEvent('workout_completed');
            this.showInterstitialAd();
        });

        document.addEventListener('challenge_completed', () => {
            this.trackEvent('challenge_completed');
        });

        document.addEventListener('user_login', () => {
            this.trackEvent('user_login');
        });
    }

    trackEvent(eventName, parameters = {}) {
        if (window.gtag) {
            gtag('event', eventName, parameters);
        }
    }

    trackAdEvent(eventName, parameters = {}) {
        this.trackEvent('ad_' + eventName, parameters);
    }

    // Método para mostrar anuncio nativo en el feed
    createNativeAd(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const nativeAd = document.createElement('div');
        nativeAd.className = 'native-ad glass-card';
        nativeAd.innerHTML = `
            <div class="native-ad-content">
                <div class="native-ad-label">Publicidad</div>
                <ins class="adsbygoogle"
                     style="display:block"
                     data-ad-client="ca-pub-4129506161314540"
                     data-ad-slot="6673201053"
                     data-ad-format="auto"
                     data-full-width-responsive="true"></ins>
            </div>
        `;

        container.appendChild(nativeAd);
        this.pushAdUnits();
    }
}

// Instancia global
window.adsManager = new AdsManager();

// CSS para los anuncios
const adStyles = `
<style>
.ad-banner {
    position: fixed;
    bottom: 80px;
    left: 0;
    right: 0;
    height: 60px;
    background: rgba(0, 212, 255, 0.1);
    border-top: 1px solid rgba(0, 212, 255, 0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.interstitial-ad-modal,
.reward-ad-modal {
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

.ad-modal-content {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(20px);
    border-radius: 20px;
    padding: 20px;
    max-width: 90%;
    max-height: 80%;
    overflow-y: auto;
}

.ad-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
}

.ad-close {
    background: none;
    border: none;
    color: white;
    font-size: 24px;
    cursor: pointer;
}

.ad-container {
    margin: 15px 0;
    text-align: center;
}

.ad-footer {
    text-align: center;
    margin-top: 15px;
}

.reward-info {
    text-align: center;
    margin-bottom: 20px;
}

.reward-icon {
    font-size: 48px;
    margin-bottom: 10px;
}

.native-ad {
    margin: 15px 0;
    position: relative;
}

.native-ad-label {
    position: absolute;
    top: 5px;
    right: 10px;
    background: rgba(0, 212, 255, 0.8);
    color: white;
    padding: 2px 8px;
    border-radius: 10px;
    font-size: 10px;
    font-weight: bold;
}

@keyframes slideDown {
    from {
        transform: translateX(-50%) translateY(-100%);
        opacity: 0;
    }
    to {
        transform: translateX(-50%) translateY(0);
        opacity: 1;
    }
}
</style>
`;

// Añadir estilos al head
document.head.insertAdjacentHTML('beforeend', adStyles);

console.log('📢 Ads Manager cargado - Listo para monetización');
