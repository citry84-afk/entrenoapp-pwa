/**
 * Configuración de Stripe para EntrenoApp
 * 
 * IMPORTANTE: En producción, estas claves deben estar en variables de entorno
 * y nunca deben exponerse en el frontend. Para desarrollo, usamos claves de prueba.
 */

const STRIPE_CONFIG = {
    // Claves de prueba (modo desarrollo)
    test: {
        publishableKey: 'pk_test_51234567890abcdefghijklmnopqrstuvwxyz', // Reemplazar con tu clave real
        secretKey: 'sk_test_...', // Solo para backend
        webhookSecret: 'whsec_...' // Solo para backend
    },
    
    // Claves de producción (cuando esté listo)
    production: {
        publishableKey: 'pk_live_...', // Reemplazar con tu clave real
        secretKey: 'sk_live_...', // Solo para backend
        webhookSecret: 'whsec_...' // Solo para backend
    },
    
    // Configuración del entorno
    environment: 'test', // Cambiar a 'production' cuando esté listo
    
    // URLs de la API
    apiUrls: {
        test: 'http://localhost:3001/api', // Para desarrollo local
        production: 'https://entrenoapp.com/api' // Para producción
    },
    
    // Configuración de productos
    products: {
        monthly_premium: {
            priceId: 'price_monthly_premium', // ID de precio en Stripe
            name: 'Premium Mensual',
            description: 'Suscripción mensual a EntrenoApp Premium'
        },
        yearly_premium: {
            priceId: 'price_yearly_premium', // ID de precio en Stripe
            name: 'Premium Anual',
            description: 'Suscripción anual a EntrenoApp Premium'
        },
        lifetime_premium: {
            priceId: 'price_lifetime_premium', // ID de precio en Stripe
            name: 'Premium Vitalicio',
            description: 'Acceso vitalicio a EntrenoApp Premium'
        }
    }
};

// Función para obtener la configuración actual
function getStripeConfig() {
    return {
        ...STRIPE_CONFIG,
        current: STRIPE_CONFIG[STRIPE_CONFIG.environment],
        apiUrl: STRIPE_CONFIG.apiUrls[STRIPE_CONFIG.environment]
    };
}

// Función para inicializar Stripe con la configuración correcta
function initializeStripe() {
    const config = getStripeConfig();
    
    if (typeof Stripe === 'undefined') {
        console.error('❌ Stripe no está cargado. Verifica que el script de Stripe esté incluido.');
        return null;
    }
    
    try {
        return Stripe(config.current.publishableKey);
    } catch (error) {
        console.error('❌ Error inicializando Stripe:', error);
        return null;
    }
}

// Función para crear una sesión de checkout
async function createCheckoutSession(planId, customerEmail = null) {
    const config = getStripeConfig();
    const product = config.products[planId];
    
    if (!product) {
        throw new Error('Producto no encontrado');
    }
    
    try {
        const response = await fetch(`${config.apiUrl}/create-checkout-session`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                priceId: product.priceId,
                customerEmail: customerEmail,
                planId: planId,
                successUrl: `${window.location.origin}/?payment=success&plan=${planId}`,
                cancelUrl: `${window.location.origin}/?payment=canceled`
            })
        });
        
        if (!response.ok) {
            throw new Error('Error creando sesión de checkout');
        }
        
        return await response.json();
    } catch (error) {
        console.error('❌ Error creando sesión de checkout:', error);
        throw error;
    }
}

// Función para manejar webhooks de Stripe
function handleStripeWebhook(payload, signature) {
    const config = getStripeConfig();
    
    // En producción, esto debería verificarse en el backend
    // Por ahora, solo procesamos el payload
    console.log('📨 Webhook recibido:', payload);
    
    switch (payload.type) {
        case 'checkout.session.completed':
            handleCheckoutCompleted(payload.data.object);
            break;
        case 'customer.subscription.created':
            handleSubscriptionCreated(payload.data.object);
            break;
        case 'customer.subscription.updated':
            handleSubscriptionUpdated(payload.data.object);
            break;
        case 'customer.subscription.deleted':
            handleSubscriptionDeleted(payload.data.object);
            break;
        case 'invoice.payment_succeeded':
            handlePaymentSucceeded(payload.data.object);
            break;
        case 'invoice.payment_failed':
            handlePaymentFailed(payload.data.object);
            break;
        default:
            console.log(`🔔 Evento no manejado: ${payload.type}`);
    }
}

// Handlers de eventos de webhook
function handleCheckoutCompleted(session) {
    console.log('✅ Checkout completado:', session);
    // Activar premium
    if (window.paymentSystem) {
        window.paymentSystem.activatePremium({
            id: session.metadata.planId,
            name: session.metadata.planName,
            price: session.amount_total / 100,
            currency: session.currency
        });
    }
}

function handleSubscriptionCreated(subscription) {
    console.log('📝 Suscripción creada:', subscription);
}

function handleSubscriptionUpdated(subscription) {
    console.log('🔄 Suscripción actualizada:', subscription);
}

function handleSubscriptionDeleted(subscription) {
    console.log('🗑️ Suscripción cancelada:', subscription);
    // Desactivar premium
    if (window.paymentSystem) {
        window.paymentSystem.deactivatePremium();
    }
}

function handlePaymentSucceeded(invoice) {
    console.log('💰 Pago exitoso:', invoice);
}

function handlePaymentFailed(invoice) {
    console.log('❌ Pago fallido:', invoice);
}

// Exportar configuración
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        STRIPE_CONFIG,
        getStripeConfig,
        initializeStripe,
        createCheckoutSession,
        handleStripeWebhook
    };
} else {
    // Para uso en el navegador
    window.StripeConfig = {
        STRIPE_CONFIG,
        getStripeConfig,
        initializeStripe,
        createCheckoutSession,
        handleStripeWebhook
    };
}
