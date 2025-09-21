# 💳 Sistema de Pagos - EntrenoApp

## 📋 Resumen del Sistema

El sistema de pagos de EntrenoApp está diseñado para manejar suscripciones premium de forma segura y escalable, utilizando Stripe como procesador de pagos principal con un fallback simulado para desarrollo.

## 🏗️ Arquitectura

### Componentes Principales

1. **PaymentSystem** (`js/components/payment-system.js`)
   - Maneja el flujo completo de pagos
   - Integra con Stripe para pagos reales
   - Proporciona sistema simulado para desarrollo
   - Gestiona activación/desactivación de premium

2. **StripeConfig** (`js/config/stripe-config.js`)
   - Configuración centralizada de Stripe
   - Manejo de claves de desarrollo y producción
   - Configuración de productos y precios
   - Handlers de webhooks

3. **PremiumManager** (`js/components/premium.js`)
   - Integrado con el sistema de pagos
   - Maneja la UI de suscripciones
   - Gestiona el estado premium

## 💰 Planes de Suscripción

### Plan Mensual
- **Precio**: 4.99€/mes
- **ID**: `monthly_premium`
- **Características**: Acceso completo a funciones premium

### Plan Anual
- **Precio**: 49.99€/año (17% descuento)
- **ID**: `yearly_premium`
- **Características**: Acceso completo + funciones anticipadas

### Plan Vitalicio
- **Precio**: 99.99€ (pago único)
- **ID**: `lifetime_premium`
- **Características**: Acceso permanente + funciones exclusivas

## 🔧 Configuración

### 1. Configurar Stripe

```javascript
// En js/config/stripe-config.js
const STRIPE_CONFIG = {
    test: {
        publishableKey: 'pk_test_tu_clave_aqui',
        // Las claves secretas van en el backend
    },
    environment: 'test' // Cambiar a 'production' cuando esté listo
};
```

### 2. Crear Productos en Stripe Dashboard

1. Ve a [Stripe Dashboard](https://dashboard.stripe.com)
2. Crea productos para cada plan:
   - `Premium Mensual` - Precio recurrente mensual
   - `Premium Anual` - Precio recurrente anual
   - `Premium Vitalicio` - Precio único

3. Actualiza los `priceId` en la configuración

### 3. Configurar Webhooks

```javascript
// Endpoints a configurar en Stripe:
// - checkout.session.completed
// - customer.subscription.created
// - customer.subscription.updated
// - customer.subscription.deleted
// - invoice.payment_succeeded
// - invoice.payment_failed
```

## 🚀 Implementación

### Flujo de Pago

1. **Usuario selecciona plan** → `PremiumManager.showCheckout(planType)`
2. **Sistema procesa pago** → `PaymentSystem.processPayment(planId)`
3. **Stripe maneja checkout** → Redirección a Stripe Checkout
4. **Webhook confirma pago** → Activación automática de premium
5. **UI se actualiza** → Usuario ve funciones premium activas

### Sistema Simulado (Desarrollo)

Para desarrollo sin Stripe configurado:

```javascript
// El sistema detecta automáticamente y usa pagos simulados
// Simula 2 segundos de procesamiento
// Activa premium inmediatamente
// Guarda información en localStorage
```

## 📊 Tracking y Analytics

### Eventos de Google Analytics

```javascript
// Eventos automáticamente trackeados:
gtag('event', 'payment_success', {
    'currency': 'EUR',
    'value': 4.99,
    'item_name': 'Premium Mensual',
    'item_category': 'subscription'
});
```

### Métricas Importantes

- **Conversión**: Usuarios que completan el pago
- **Revenue**: Ingresos por suscripción
- **Churn**: Cancelaciones de suscripciones
- **LTV**: Valor de vida del cliente

## 🔒 Seguridad

### Buenas Prácticas

1. **Claves Secretas**: Nunca en el frontend
2. **Validación**: Siempre en el backend
3. **Webhooks**: Verificar firmas de Stripe
4. **HTTPS**: Obligatorio en producción
5. **PCI Compliance**: Delegado a Stripe

### Validación de Pagos

```javascript
// En el backend, siempre validar:
// 1. Webhook signature
// 2. Amount y currency
// 3. Customer email
// 4. Product ID
```

## 🧪 Testing

### Modo Desarrollo

```javascript
// Activar pagos simulados
const config = getStripeConfig();
config.environment = 'test'; // Usa pagos simulados
```

### Testing con Stripe

```javascript
// Usar tarjetas de prueba de Stripe:
// 4242 4242 4242 4242 - Visa
// 4000 0000 0000 0002 - Declinada
// 4000 0000 0000 9995 - Insuficientes fondos
```

## 📱 Estados de Premium

### Verificación

```javascript
// Verificar si el usuario tiene premium activo
const isPremium = window.paymentSystem.isPremiumActive();

// Obtener información del plan
const premiumInfo = window.paymentSystem.getPremiumInfo();
```

### Activación Manual (Desarrollo)

```javascript
// Para testing, activar premium manualmente
window.premiumManager.activatePremium('monthly');
```

## 🚨 Troubleshooting

### Problemas Comunes

1. **Stripe no se inicializa**
   - Verificar que el script esté cargado
   - Comprobar la clave pública
   - Revisar la consola para errores

2. **Pagos no se procesan**
   - Verificar configuración de productos
   - Comprobar webhooks
   - Revisar logs del backend

3. **Premium no se activa**
   - Verificar webhook handlers
   - Comprobar localStorage
   - Revisar flujo de activación

### Logs Útiles

```javascript
// Habilitar logs detallados
localStorage.setItem('entrenoapp_debug', 'true');

// Ver estado actual
console.log('Premium activo:', window.paymentSystem.isPremiumActive());
console.log('Info premium:', window.paymentSystem.getPremiumInfo());
```

## 🔄 Próximos Pasos

### Fase 1: Desarrollo (Actual)
- ✅ Sistema básico implementado
- ✅ Pagos simulados funcionando
- ✅ UI integrada
- 🔄 Configurar Stripe real

### Fase 2: Producción
- 🔄 Backend para webhooks
- 🔄 Configurar Stripe Dashboard
- 🔄 Testing con tarjetas reales
- 🔄 Monitoreo de pagos

### Fase 3: Optimización
- 🔄 Retención de suscripciones
- 🔄 Upselling automático
- 🔄 Programas de fidelidad
- 🔄 Análisis avanzado de revenue

## 📞 Soporte

Para problemas con pagos:
1. Revisar logs de la consola
2. Verificar configuración de Stripe
3. Comprobar webhooks
4. Contactar soporte técnico

---

**Nota**: Este sistema está en desarrollo activo. Para producción, asegúrate de configurar correctamente Stripe y implementar todas las validaciones de seguridad necesarias.
