/**
 * Sistema de Pagos - EntrenoApp
 * Maneja suscripciones premium, procesamiento de pagos y gestión de membresías
 */

class PaymentSystem {
    constructor() {
        this.stripe = null;
        this.isInitialized = false;
        this.subscriptionPlans = {
            monthly: {
                id: 'monthly_premium',
                name: 'Premium Mensual',
                price: 4.99,
                currency: 'EUR',
                interval: 'month',
                features: [
                    'Sin anuncios',
                    'Planes personalizados ilimitados',
                    'Análisis avanzados',
                    'Dashboard de salud completo',
                    'Sistema de gamificación',
                    'Coaching personalizado',
                    'Retos exclusivos',
                    'Soporte prioritario'
                ]
            },
            yearly: {
                id: 'yearly_premium',
                name: 'Premium Anual',
                price: 49.99,
                currency: 'EUR',
                interval: 'year',
                discount: '17% de descuento',
                originalPrice: 59.88,
                features: [
                    'Sin anuncios',
                    'Planes personalizados ilimitados',
                    'Análisis avanzados',
                    'Dashboard de salud completo',
                    'Sistema de gamificación',
                    'Coaching personalizado',
                    'Retos exclusivos',
                    'Soporte prioritario',
                    'Acceso anticipado a nuevas funciones'
                ]
            },
            lifetime: {
                id: 'lifetime_premium',
                name: 'Premium Vitalicio',
                price: 99.99,
                currency: 'EUR',
                oneTime: true,
                features: [
                    'Sin anuncios para siempre',
                    'Planes personalizados ilimitados',
                    'Análisis avanzados',
                    'Dashboard de salud completo',
                    'Sistema de gamificación',
                    'Coaching personalizado',
                    'Retos exclusivos',
                    'Soporte prioritario',
                    'Acceso anticipado a nuevas funciones',
                    'Funciones premium exclusivas'
                ]
            }
        };
        
        this.init();
    }

    async init() {
        try {
            // Inicializar Stripe usando la configuración
            if (window.StripeConfig) {
                this.stripe = window.StripeConfig.initializeStripe();
                if (this.stripe) {
                    this.isInitialized = true;
                    console.log('✅ Sistema de pagos inicializado con Stripe');
                } else {
                    throw new Error('No se pudo inicializar Stripe');
                }
            } else {
                throw new Error('Configuración de Stripe no encontrada');
            }
        } catch (error) {
            console.error('❌ Error inicializando sistema de pagos:', error);
            // Fallback: usar sistema de pagos simulado para desarrollo
            this.initSimulatedPayments();
        }
    }

    initSimulatedPayments() {
        console.log('🔄 Iniciando sistema de pagos simulado para desarrollo');
        this.isInitialized = true;
    }

    async processPayment(planId, paymentMethod = 'card') {
        if (!this.isInitialized) {
            throw new Error('Sistema de pagos no inicializado');
        }

        const plan = this.subscriptionPlans[planId];
        if (!plan) {
            throw new Error('Plan no válido');
        }

        try {
            // Mostrar loading
            this.showPaymentLoading(plan);

            if (this.stripe && !this.stripe.toString().includes('pk_test_')) {
                // Procesar pago real con Stripe
                return await this.processStripePayment(plan);
            } else {
                // Simular pago para desarrollo
                return await this.simulatePayment(plan);
            }
        } catch (error) {
            console.error('❌ Error procesando pago:', error);
            this.showPaymentError(error.message);
            throw error;
        }
    }

    async processStripePayment(plan) {
        // Crear sesión de checkout con Stripe
        const response = await fetch('/api/create-checkout-session', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                planId: plan.id,
                price: plan.price,
                currency: plan.currency,
                interval: plan.interval,
                userId: this.getCurrentUserId()
            })
        });

        const session = await response.json();
        
        // Redirigir a Stripe Checkout
        const result = await this.stripe.redirectToCheckout({
            sessionId: session.id
        });

        if (result.error) {
            throw new Error(result.error.message);
        }

        return result;
    }

    async simulatePayment(plan) {
        // Simular proceso de pago
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Simular éxito del pago
                const paymentResult = {
                    success: true,
                    planId: plan.id,
                    transactionId: 'sim_' + Date.now(),
                    amount: plan.price,
                    currency: plan.currency,
                    timestamp: new Date().toISOString()
                };

                // Activar premium
                this.activatePremium(plan);
                
                // Guardar información del pago
                this.savePaymentInfo(paymentResult);
                
                // Trackear evento
                this.trackPaymentEvent('payment_success', plan);
                
                resolve(paymentResult);
            }, 2000); // Simular 2 segundos de procesamiento
        });
    }

    activatePremium(plan) {
        const premiumData = {
            isPremium: true,
            planType: plan.id,
            planName: plan.name,
            activatedAt: new Date().toISOString(),
            expiresAt: this.calculateExpiration(plan),
            features: plan.features
        };

        // Guardar en localStorage
        localStorage.setItem('entrenoapp_premium', JSON.stringify(premiumData));
        
        // Actualizar UI
        this.updatePremiumUI(premiumData);
        
        console.log('✅ Premium activado:', premiumData);
    }

    calculateExpiration(plan) {
        const now = new Date();
        
        if (plan.oneTime) {
            return null; // No expira
        } else if (plan.interval === 'month') {
            return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
        } else if (plan.interval === 'year') {
            return new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000).toISOString();
        }
        
        return null;
    }

    savePaymentInfo(paymentResult) {
        const paymentHistory = this.getPaymentHistory();
        paymentHistory.push(paymentResult);
        localStorage.setItem('entrenoapp_payment_history', JSON.stringify(paymentHistory));
    }

    getPaymentHistory() {
        const history = localStorage.getItem('entrenoapp_payment_history');
        return history ? JSON.parse(history) : [];
    }

    getCurrentUserId() {
        // Obtener ID del usuario actual
        const user = JSON.parse(localStorage.getItem('entrenoapp_user') || '{}');
        return user.uid || 'anonymous';
    }

    updatePremiumUI(premiumData) {
        // Actualizar dashboard
        if (window.dashboardManager) {
            window.dashboardManager.renderDashboard();
        }
        
        // Actualizar menú
        if (window.navigationManager) {
            window.navigationManager.updatePremiumStatus();
        }
        
        // Mostrar notificación de éxito
        this.showPaymentSuccess(premiumData);
    }

    showPaymentSuccess(premiumData) {
        const notification = document.createElement('div');
        notification.className = 'payment-success-notification';
        notification.innerHTML = `
            <div class="success-content">
                <div class="success-icon">🎉</div>
                <div class="success-text">
                    <h3>¡Premium Activado!</h3>
                    <p>Ahora disfrutas de ${premiumData.planName}</p>
                    <p class="success-features">Sin anuncios • Funciones exclusivas</p>
                </div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remover después de 5 segundos
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }

    showPaymentLoading(plan) {
        const loading = document.createElement('div');
        loading.className = 'payment-loading-overlay';
        loading.innerHTML = `
            <div class="payment-loading">
                <div class="loading-spinner"></div>
                <h3>Procesando pago...</h3>
                <p>${plan.name} - ${plan.price}€</p>
                <p class="loading-note">No cierres esta ventana</p>
            </div>
        `;
        
        document.body.appendChild(loading);
        this.currentLoading = loading;
    }

    hidePaymentLoading() {
        if (this.currentLoading && this.currentLoading.parentNode) {
            this.currentLoading.remove();
        }
    }

    showPaymentError(message) {
        this.hidePaymentLoading();
        
        const error = document.createElement('div');
        error.className = 'payment-error-notification';
        error.innerHTML = `
            <div class="error-content">
                <div class="error-icon">❌</div>
                <div class="error-text">
                    <h3>Error en el Pago</h3>
                    <p>${message}</p>
                    <button class="glass-button glass-button-primary" onclick="this.closest('.payment-error-notification').remove()">
                        Entendido
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(error);
    }

    trackPaymentEvent(eventType, plan) {
        // Trackear con Google Analytics
        if (typeof gtag !== 'undefined') {
            gtag('event', eventType, {
                'currency': plan.currency,
                'value': plan.price,
                'item_name': plan.name,
                'item_category': 'subscription'
            });
        }
        
        console.log(`📊 Evento trackeado: ${eventType}`, plan);
    }

    // Métodos públicos para la UI
    async subscribeToPlan(planId) {
        try {
            const result = await this.processPayment(planId);
            return result;
        } catch (error) {
            console.error('Error en suscripción:', error);
            throw error;
        }
    }

    getSubscriptionPlans() {
        return this.subscriptionPlans;
    }

    isPremiumActive() {
        const premium = localStorage.getItem('entrenoapp_premium');
        if (!premium) return false;
        
        const premiumData = JSON.parse(premium);
        
        if (premiumData.isPremium) {
            if (premiumData.expiresAt) {
                const expiresAt = new Date(premiumData.expiresAt);
                const now = new Date();
                
                if (now > expiresAt) {
                    // Premium expirado
                    this.deactivatePremium();
                    return false;
                }
            }
            return true;
        }
        
        return false;
    }

    getPremiumInfo() {
        const premium = localStorage.getItem('entrenoapp_premium');
        return premium ? JSON.parse(premium) : null;
    }

    deactivatePremium() {
        localStorage.removeItem('entrenoapp_premium');
        console.log('🔴 Premium desactivado');
    }

    // Webhook handler para Stripe (cuando se implemente)
    handleWebhook(payload, signature) {
        // Verificar webhook de Stripe
        // Procesar eventos: payment_intent.succeeded, customer.subscription.created, etc.
        console.log('Webhook recibido:', payload);
    }
}

// Inicializar sistema de pagos
window.paymentSystem = new PaymentSystem();

// Exportar para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PaymentSystem;
}
