// Sistema de suscripción premium para EntrenoApp
class PremiumManager {
    constructor() {
        this.premiumPlans = {
            monthly: {
                id: 'premium_monthly',
                name: 'Premium Mensual',
                price: 4.99,
                currency: 'EUR',
                interval: 'month',
                features: [
                    'Sin anuncios',
                    'Planes personalizados ilimitados',
                    'Análisis avanzados',
                    'Coaching personalizado',
                    'Retos exclusivos',
                    'Soporte prioritario'
                ]
            },
            yearly: {
                id: 'premium_yearly',
                name: 'Premium Anual',
                price: 39.99,
                currency: 'EUR',
                interval: 'year',
                discount: '33% de descuento',
                features: [
                    'Sin anuncios',
                    'Planes personalizados ilimitados',
                    'Análisis avanzados',
                    'Coaching personalizado',
                    'Retos exclusivos',
                    'Soporte prioritario',
                    'Acceso a beta features'
                ]
            },
            lifetime: {
                id: 'premium_lifetime',
                name: 'Premium de por vida',
                price: 99.99,
                currency: 'EUR',
                interval: 'lifetime',
                discount: 'Mejor oferta',
                features: [
                    'Sin anuncios para siempre',
                    'Planes personalizados ilimitados',
                    'Análisis avanzados',
                    'Coaching personalizado',
                    'Retos exclusivos',
                    'Soporte prioritario',
                    'Acceso a beta features',
                    'Funciones futuras incluidas'
                ]
            }
        };
        
        this.isPremium = false;
        this.currentPlan = null;
        this.init();
    }

    init() {
        this.checkPremiumStatus();
        this.setupEventListeners();
    }

    checkPremiumStatus() {
        // Verificar si el usuario tiene suscripción activa
        const premiumData = localStorage.getItem('entrenoapp_premium');
        if (premiumData) {
            const data = JSON.parse(premiumData);
            this.isPremium = data.isPremium;
            this.currentPlan = data.plan;
        }
    }

    setupEventListeners() {
        // Escuchar eventos de entrenamiento para mostrar upsells
        document.addEventListener('workout_completed', () => {
            this.showUpsellIfNeeded();
        });

        document.addEventListener('challenge_completed', () => {
            this.showUpsellIfNeeded();
        });
    }

    showPremiumModal() {
        const modal = document.createElement('div');
        modal.className = 'premium-modal';
        modal.innerHTML = `
            <div class="premium-modal-content glass-effect">
                <div class="premium-header">
                    <h2>🚀 Desbloquea EntrenoApp Premium</h2>
                    <button class="premium-close" onclick="window.premiumManager.closePremiumModal()">×</button>
                </div>
                <div class="premium-body">
                    <div class="premium-benefits">
                        <h3>✨ Beneficios Premium</h3>
                        <ul class="benefits-list">
                            <li>🚫 Sin anuncios molestos</li>
                            <li>📊 Análisis avanzados de rendimiento</li>
                            <li>🎯 Planes personalizados ilimitados</li>
                            <li>👨‍💼 Coaching personalizado</li>
                            <li>🏆 Retos exclusivos</li>
                            <li>⚡ Acceso prioritario a nuevas funciones</li>
                        </ul>
                    </div>
                    <div class="premium-plans">
                        ${Object.values(this.premiumPlans).map(plan => `
                            <div class="plan-card ${plan.discount ? 'featured' : ''}" data-plan="${plan.id}">
                                ${plan.discount ? `<div class="plan-badge">${plan.discount}</div>` : ''}
                                <h4>${plan.name}</h4>
                                <div class="plan-price">
                                    <span class="price">${plan.price}€</span>
                                    <span class="interval">/${plan.interval === 'month' ? 'mes' : plan.interval === 'year' ? 'año' : 'vida'}</span>
                                </div>
                                <ul class="plan-features">
                                    ${plan.features.map(feature => `<li>${feature}</li>`).join('')}
                                </ul>
                                <button class="glass-button glass-button-primary plan-select" data-plan="${plan.id}">
                                    Seleccionar
                                </button>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        this.setupPlanSelection();
    }

    setupPlanSelection() {
        const planButtons = document.querySelectorAll('.plan-select');
        planButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const planId = e.target.dataset.plan;
                this.selectPlan(planId);
            });
        });
    }

    selectPlan(planId) {
        const plan = this.premiumPlans[planId.split('_')[1]];
        if (!plan) return;

        // Simular proceso de pago (en producción usarías Stripe, PayPal, etc.)
        this.processPayment(plan);
    }

    processPayment(plan) {
        // Mostrar loading
        const loadingModal = document.createElement('div');
        loadingModal.className = 'payment-loading';
        loadingModal.innerHTML = `
            <div class="payment-loading-content glass-effect">
                <div class="loading-spinner"></div>
                <h3>Procesando pago...</h3>
                <p>Por favor, no cierres esta ventana</p>
            </div>
        `;
        document.body.appendChild(loadingModal);

        // Simular procesamiento de pago
        setTimeout(() => {
            this.activatePremium(plan);
            loadingModal.remove();
        }, 2000);
    }

    activatePremium(plan) {
        this.isPremium = true;
        this.currentPlan = plan;
        
        // Guardar en localStorage
        localStorage.setItem('entrenoapp_premium', JSON.stringify({
            isPremium: true,
            plan: plan,
            activatedAt: new Date().toISOString()
        }));

        // Desactivar anuncios
        if (window.adsManager) {
            window.adsManager.disableAds();
        }

        // Mostrar confirmación
        this.showPremiumActivated(plan);
        
        // Trackear evento
        this.trackEvent('premium_activated', { plan: plan.id });
    }

    showPremiumActivated(plan) {
        const modal = document.createElement('div');
        modal.className = 'premium-activated';
        modal.innerHTML = `
            <div class="premium-activated-content glass-effect">
                <div class="success-icon">🎉</div>
                <h2>¡Bienvenido a Premium!</h2>
                <p>Has activado ${plan.name}</p>
                <div class="premium-features-unlocked">
                    <h3>Funciones desbloqueadas:</h3>
                    <ul>
                        <li>✅ Sin anuncios</li>
                        <li>✅ Análisis avanzados</li>
                        <li>✅ Planes personalizados</li>
                        <li>✅ Retos exclusivos</li>
                    </ul>
                </div>
                <button class="glass-button glass-button-success" onclick="window.premiumManager.closePremiumModal()">
                    ¡Empezar a entrenar!
                </button>
            </div>
        `;

        document.body.appendChild(modal);
    }

    closePremiumModal() {
        const modals = document.querySelectorAll('.premium-modal, .premium-activated');
        modals.forEach(modal => modal.remove());
    }

    showUpsellIfNeeded() {
        if (this.isPremium) return;

        // Mostrar upsell después de completar 3 entrenamientos
        const workoutCount = parseInt(localStorage.getItem('workout_count') || '0');
        if (workoutCount >= 3 && workoutCount % 3 === 0) {
            setTimeout(() => {
                this.showPremiumModal();
            }, 2000);
        }
    }

    // Métodos para verificar estado premium
    hasPremium() {
        return this.isPremium;
    }

    getCurrentPlan() {
        return this.currentPlan;
    }

    // Métodos para funcionalidades premium
    showAdvancedAnalytics() {
        if (!this.isPremium) {
            this.showPremiumModal();
            return false;
        }
        return true;
    }

    showPersonalizedPlans() {
        if (!this.isPremium) {
            this.showPremiumModal();
            return false;
        }
        return true;
    }

    showExclusiveChallenges() {
        if (!this.isPremium) {
            this.showPremiumModal();
            return false;
        }
        return true;
    }

    trackEvent(eventName, parameters = {}) {
        if (window.gtag) {
            gtag('event', eventName, parameters);
        }
    }
}

// Instancia global
window.premiumManager = new PremiumManager();

// CSS para el modal premium
const premiumStyles = `
<style>
.premium-modal {
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

.premium-modal-content {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(20px);
    border-radius: 20px;
    padding: 30px;
    max-width: 90%;
    max-height: 90%;
    overflow-y: auto;
    border: 1px solid rgba(0, 212, 255, 0.3);
}

.premium-header {
    text-align: center;
    margin-bottom: 30px;
}

.premium-header h2 {
    color: #00D4FF;
    margin: 0;
    font-size: 2rem;
}

.premium-close {
    position: absolute;
    top: 15px;
    right: 15px;
    background: none;
    border: none;
    color: white;
    font-size: 24px;
    cursor: pointer;
}

.premium-benefits {
    margin-bottom: 30px;
}

.benefits-list {
    list-style: none;
    padding: 0;
}

.benefits-list li {
    padding: 8px 0;
    color: #fff;
    font-size: 1.1rem;
}

.premium-plans {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
}

.plan-card {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 15px;
    padding: 20px;
    text-align: center;
    position: relative;
    border: 2px solid transparent;
    transition: all 0.3s ease;
}

.plan-card.featured {
    border-color: #00D4FF;
    transform: scale(1.05);
}

.plan-card:hover {
    border-color: #00D4FF;
    transform: translateY(-5px);
}

.plan-badge {
    position: absolute;
    top: -10px;
    left: 50%;
    transform: translateX(-50%);
    background: linear-gradient(45deg, #00D4FF, #2196F3);
    color: white;
    padding: 5px 15px;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: bold;
}

.plan-price {
    margin: 15px 0;
}

.price {
    font-size: 2.5rem;
    font-weight: bold;
    color: #00D4FF;
}

.interval {
    color: #ccc;
    font-size: 1rem;
}

.plan-features {
    list-style: none;
    padding: 0;
    margin: 20px 0;
}

.plan-features li {
    padding: 5px 0;
    color: #fff;
    font-size: 0.9rem;
}

.payment-loading {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.9);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10001;
}

.payment-loading-content {
    text-align: center;
    color: white;
}

.premium-activated {
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

.premium-activated-content {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(20px);
    border-radius: 20px;
    padding: 30px;
    text-align: center;
    max-width: 400px;
    border: 1px solid rgba(0, 212, 255, 0.3);
}

.success-icon {
    font-size: 4rem;
    margin-bottom: 20px;
}

.premium-features-unlocked {
    margin: 20px 0;
    text-align: left;
}

.premium-features-unlocked ul {
    list-style: none;
    padding: 0;
}

.premium-features-unlocked li {
    padding: 5px 0;
    color: #fff;
}

@media (max-width: 768px) {
    .premium-plans {
        grid-template-columns: 1fr;
    }
    
    .plan-card.featured {
        transform: none;
    }
}
</style>
`;

// Añadir estilos al head
document.head.insertAdjacentHTML('beforeend', premiumStyles);

