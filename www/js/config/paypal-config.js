/**
 * Configuración de PayPal para EntrenoApp
 * 
 * IMPORTANTE: En producción, estas claves deben estar en variables de entorno
 * y nunca deben exponerse en el frontend. Para desarrollo, usamos sandbox.
 */

const PAYPAL_CONFIG = {
    // Configuración de desarrollo (Sandbox)
    sandbox: {
        clientId: 'sb', // Reemplazar con tu Client ID de PayPal Sandbox
        environment: 'sandbox',
        currency: 'EUR',
        intent: 'capture',
        locale: 'es_ES'
    },
    
    // Configuración de producción
    production: {
        clientId: 'YOUR_LIVE_CLIENT_ID', // Reemplazar con tu Client ID de PayPal Live
        environment: 'production',
        currency: 'EUR',
        intent: 'capture',
        locale: 'es_ES'
    },
    
    // Configuración actual
    current: 'sandbox', // Cambiar a 'production' cuando esté listo
    
    // Configuración de la cuenta
    account: {
        email: 'citry84@gmail.com',
        businessName: 'EntrenoApp',
        supportEmail: 'citry84@gmail.com',
        // Enlaces directos
        payme: 'https://paypal.me/lipastudios'
    },
    
    // URLs de retorno
    urls: {
        success: '/?payment=success&method=paypal',
        cancel: '/?payment=canceled&method=paypal',
        error: '/?payment=error&method=paypal'
    },
    
    // Configuración de productos
    products: {
        monthly_premium: {
            name: 'Premium Mensual - EntrenoApp',
            description: 'Suscripción mensual a EntrenoApp Premium',
            category: 'DIGITAL_GOODS'
        },
        yearly_premium: {
            name: 'Premium Anual - EntrenoApp',
            description: 'Suscripción anual a EntrenoApp Premium',
            category: 'DIGITAL_GOODS'
        },
        lifetime_premium: {
            name: 'Premium Vitalicio - EntrenoApp',
            description: 'Acceso vitalicio a EntrenoApp Premium',
            category: 'DIGITAL_GOODS'
        }
    },
    
    // Configuración de experiencia
    experience: {
        brandName: 'EntrenoApp',
        landingPage: 'BILLING',
        userAction: 'PAY_NOW',
        shippingPreference: 'NO_SHIPPING',
        paymentMethodPreference: 'IMMEDIATE_PAYMENT_REQUIRED'
    }
};

// Función para obtener la configuración actual
function getPayPalConfig() {
    return {
        ...PAYPAL_CONFIG,
        current: PAYPAL_CONFIG[PAYPAL_CONFIG.current]
    };
}

// Función para inicializar PayPal SDK
function loadPayPalSDK() {
    return new Promise((resolve, reject) => {
        // Verificar si ya está cargado
        if (window.paypal) {
            resolve(window.paypal);
            return;
        }

        const config = getPayPalConfig();
        const script = document.createElement('script');
        
        // Construir URL del SDK
        const sdkUrl = `https://www.paypal.com/sdk/js?` + new URLSearchParams({
            'client-id': config.current.clientId,
            'currency': config.current.currency,
            'intent': config.current.intent,
            'locale': config.current.locale,
            'enable-funding': 'venmo,paylater',
            'disable-funding': 'credit,card'
        }).toString();
        
        script.src = sdkUrl;
        script.onload = () => {
            console.log('✅ PayPal SDK cargado');
            resolve(window.paypal);
        };
        script.onerror = (error) => {
            console.error('❌ Error cargando PayPal SDK:', error);
            reject(error);
        };
        
        document.head.appendChild(script);
    });
}

// Función para crear orden de PayPal
async function createPayPalOrder(planId, amount, currency = 'EUR') {
    const config = getPayPalConfig();
    const product = config.products[planId];
    
    if (!product) {
        throw new Error('Producto no encontrado');
    }
    
    try {
        // En producción, esto debería hacerse en el backend
        const orderData = {
            purchase_units: [{
                amount: {
                    currency_code: currency,
                    value: amount.toString()
                },
                description: product.description,
                custom_id: planId,
                soft_descriptor: product.name
            }],
            application_context: {
                brand_name: config.experience.brandName,
                landing_page: config.experience.landingPage,
                user_action: config.experience.userAction,
                shipping_preference: config.experience.shippingPreference,
                payment_method_preference: config.experience.paymentMethodPreference,
                return_url: `${window.location.origin}${config.urls.success}&plan=${planId}`,
                cancel_url: `${window.location.origin}${config.urls.cancel}`
            },
            payer: {
                email_address: config.account.email // Opcional, para pre-llenar
            }
        };
        
        console.log('📝 Creando orden PayPal:', orderData);
        
        // Simular creación de orden (en producción, esto sería en el backend)
        return {
            id: `paypal_order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            status: 'CREATED',
            ...orderData
        };
        
    } catch (error) {
        console.error('❌ Error creando orden PayPal:', error);
        throw error;
    }
}

// Función para capturar pago de PayPal
async function capturePayPalPayment(orderID) {
    try {
        console.log('💰 Capturando pago PayPal:', orderID);
        
        // En producción, esto debería hacerse en el backend
        // Simular captura exitosa
        return {
            id: orderID,
            status: 'COMPLETED',
            captured: true,
            capture_time: new Date().toISOString()
        };
        
    } catch (error) {
        console.error('❌ Error capturando pago PayPal:', error);
        throw error;
    }
}

// Función para manejar webhooks de PayPal
function handlePayPalWebhook(payload) {
    console.log('📨 Webhook PayPal recibido:', payload);
    
    switch (payload.event_type) {
        case 'PAYMENT.CAPTURE.COMPLETED':
            handlePaymentCaptureCompleted(payload);
            break;
        case 'PAYMENT.CAPTURE.DENIED':
            handlePaymentCaptureDenied(payload);
            break;
        case 'PAYMENT.CAPTURE.PENDING':
            handlePaymentCapturePending(payload);
            break;
        case 'PAYMENT.CAPTURE.REFUNDED':
            handlePaymentCaptureRefunded(payload);
            break;
        default:
            console.log(`🔔 Evento PayPal no manejado: ${payload.event_type}`);
    }
}

// Handlers de eventos de webhook
function handlePaymentCaptureCompleted(payload) {
    console.log('✅ Pago PayPal completado:', payload);
    // Activar premium
    if (window.paymentSystem) {
        const planId = payload.resource.custom_id;
        const amount = parseFloat(payload.resource.amount.value);
        const currency = payload.resource.amount.currency_code;
        
        window.paymentSystem.activatePremium({
            id: planId,
            name: `Premium ${planId}`,
            price: amount,
            currency: currency
        });
    }
}

function handlePaymentCaptureDenied(payload) {
    console.log('❌ Pago PayPal denegado:', payload);
    if (window.paymentSystem) {
        window.paymentSystem.showPaymentError('Pago denegado por PayPal');
    }
}

function handlePaymentCapturePending(payload) {
    console.log('⏳ Pago PayPal pendiente:', payload);
    // Mostrar estado pendiente
}

function handlePaymentCaptureRefunded(payload) {
    console.log('🔄 Pago PayPal reembolsado:', payload);
    // Desactivar premium si corresponde
    if (window.paymentSystem) {
        window.paymentSystem.deactivatePremium();
    }
}

// Función para obtener información de la cuenta
function getPayPalAccountInfo() {
    const config = getPayPalConfig();
    return {
        email: config.account.email,
        businessName: config.account.businessName,
        supportEmail: config.account.supportEmail,
        environment: config.current.environment
    };
}

// Exportar configuración
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        PAYPAL_CONFIG,
        getPayPalConfig,
        loadPayPalSDK,
        createPayPalOrder,
        capturePayPalPayment,
        handlePayPalWebhook,
        getPayPalAccountInfo
    };
} else {
    // Para uso en el navegador
    window.PayPalConfig = {
        PAYPAL_CONFIG,
        getPayPalConfig,
        loadPayPalSDK,
        createPayPalOrder,
        capturePayPalPayment,
        handlePayPalWebhook,
        getPayPalAccountInfo
    };
}
