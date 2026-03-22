// Sistema de donaciones para EntrenoApp
class DonationManager {
    constructor() {
        this.donationAmounts = [2, 5, 10, 20, 50];
        this.customAmount = 0;
        this.donationReasons = [
            {
                id: 'coffee',
                title: '☕ Invítame a un café',
                description: 'Ayuda a mantener la app funcionando',
                amount: 2,
                emoji: '☕'
            },
            {
                id: 'lunch',
                title: '🍕 Invítame a comer',
                description: 'Apoya el desarrollo de nuevas funciones',
                amount: 10,
                emoji: '🍕'
            },
            {
                id: 'plus',
                title: '💎 Apoyo Plus',
                description: 'Ayuda extra para mantener la app gratuita',
                amount: 25,
                emoji: '💎'
            },
            {
                id: 'sponsor',
                title: '🚀 Patrocinador',
                description: 'Tu nombre en los agradecimientos',
                amount: 50,
                emoji: '🚀'
            }
        ];
        
        this.init();
    }

    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Mostrar donaciones después de completar entrenamientos
        document.addEventListener('workout_completed', () => {
            this.showDonationUpsell();
        });
    }

    showDonationModal() {
        const modal = document.createElement('div');
        modal.className = 'donation-modal';
        modal.innerHTML = `
            <div class="donation-modal-content glass-effect">
                <div class="donation-header">
                    <h2>💝 Apoya EntrenoApp</h2>
                    <button class="donation-close" onclick="window.donationManager.closeDonationModal()">×</button>
                </div>
                <div class="donation-body">
                    <div class="donation-intro">
                        <p>¡Hola! 👋</p>
                        <p>EntrenoApp es completamente gratuita y sin anuncios molestos. Si te gusta la app y quieres apoyar su desarrollo, considera hacer una donación.</p>
                    </div>
                    
                    <div class="donation-reasons">
                        <h3>¿Por qué donar?</h3>
                        <ul class="reasons-list">
                            <li>🚀 Desarrollo de nuevas funciones</li>
                            <li>🐛 Corrección de bugs y mejoras</li>
                            <li>☁️ Servidores y hosting</li>
                            <li>📱 Mantenimiento de la app</li>
                            <li>🎨 Diseño y UX mejorados</li>
                        </ul>
                    </div>

                    <div class="donation-options">
                        <h3>Elige una opción:</h3>
                        <div class="reason-cards">
                            ${this.donationReasons.map(reason => `
                                <div class="reason-card" data-reason="${reason.id}" data-amount="${reason.amount}">
                                    <div class="reason-emoji">${reason.emoji}</div>
                                    <h4>${reason.title}</h4>
                                    <p>${reason.description}</p>
                                    <div class="reason-amount">${reason.amount}€</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <div class="custom-donation">
                        <h3>O dona una cantidad personalizada:</h3>
                        <div class="custom-amount-input">
                            <input type="number" id="custom-amount" placeholder="0" min="1" max="1000">
                            <span class="currency">€</span>
                        </div>
                    </div>

                    <div class="donation-methods">
                        <h3>Métodos de pago:</h3>
                        <div class="payment-methods">
                            <button class="payment-method active" data-method="stripe">
                                <span class="method-icon">💳</span>
                                <span class="method-name">Tarjeta</span>
                            </button>
                            <button class="payment-method" data-method="paypal">
                                <span class="method-icon">🅿️</span>
                                <span class="method-name">PayPal</span>
                            </button>
                            <button class="payment-method" data-method="crypto">
                                <span class="method-icon">₿</span>
                                <span class="method-name">Crypto</span>
                            </button>
                        </div>
                    </div>

                    <div class="donation-footer">
                        <button class="glass-button glass-button-primary" id="process-donation" disabled>
                            Procesar Donación
                        </button>
                        <p class="donation-note">
                            💡 Las donaciones son opcionales y no afectan el uso de la app
                        </p>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        this.setupDonationInteractions();
    }

    setupDonationInteractions() {
        // Selección de razón de donación
        const reasonCards = document.querySelectorAll('.reason-card');
        reasonCards.forEach(card => {
            card.addEventListener('click', (e) => {
                // Remover selección anterior
                reasonCards.forEach(c => c.classList.remove('selected'));
                // Seleccionar actual
                e.currentTarget.classList.add('selected');
                
                // Actualizar cantidad
                const amount = e.currentTarget.dataset.amount;
                document.getElementById('custom-amount').value = amount;
                
                // Habilitar botón
                this.updateDonationButton();
            });
        });

        // Input de cantidad personalizada
        const customAmountInput = document.getElementById('custom-amount');
        customAmountInput.addEventListener('input', () => {
            // Remover selección de tarjetas
            reasonCards.forEach(c => c.classList.remove('selected'));
            this.updateDonationButton();
        });

        // Selección de método de pago
        const paymentMethods = document.querySelectorAll('.payment-method');
        paymentMethods.forEach(method => {
            method.addEventListener('click', (e) => {
                paymentMethods.forEach(m => m.classList.remove('active'));
                e.currentTarget.classList.add('active');
            });
        });

        // Procesar donación
        const processBtn = document.getElementById('process-donation');
        processBtn.addEventListener('click', () => {
            this.processDonation();
        });
    }

    updateDonationButton() {
        const customAmount = document.getElementById('custom-amount').value;
        const processBtn = document.getElementById('process-donation');
        
        if (customAmount && parseFloat(customAmount) > 0) {
            processBtn.disabled = false;
            processBtn.textContent = `Donar ${customAmount}€`;
        } else {
            processBtn.disabled = true;
            processBtn.textContent = 'Procesar Donación';
        }
    }

    processDonation() {
        const customAmount = document.getElementById('custom-amount').value;
        const selectedMethod = document.querySelector('.payment-method.active').dataset.method;
        const amount = parseFloat(customAmount);

        if (!amount || amount <= 0) return;
        
        // Si el método es PayPal, redirigir a PayPal.me con la cantidad
        if (selectedMethod === 'paypal' && window.PayPalConfig && window.PayPalConfig.PAYPAL_CONFIG?.account?.payme) {
            const base = window.PayPalConfig.PAYPAL_CONFIG.account.payme;
            const url = `${base}/${amount}`; // PayPal.me permite cantidad en la URL
            window.location.href = url;
            return;
        }

        // Mostrar loading para otros métodos o si no hay PayPal.me
        this.showDonationLoading(amount, selectedMethod);
        setTimeout(() => {
            this.showDonationSuccess(amount);
        }, 2000);
    }

    showDonationLoading(amount, method) {
        const loadingModal = document.createElement('div');
        loadingModal.className = 'donation-loading';
        loadingModal.innerHTML = `
            <div class="donation-loading-content glass-effect">
                <div class="loading-spinner"></div>
                <h3>Procesando donación...</h3>
                <p>Donando ${amount}€ via ${method}</p>
                <p>Por favor, no cierres esta ventana</p>
            </div>
        `;

        document.body.appendChild(loadingModal);
    }

    showDonationSuccess(amount) {
        // Remover loading
        const loadingModal = document.querySelector('.donation-loading');
        if (loadingModal) loadingModal.remove();

        // Mostrar éxito
        const successModal = document.createElement('div');
        successModal.className = 'donation-success';
        successModal.innerHTML = `
            <div class="donation-success-content glass-effect">
                <div class="success-icon">🎉</div>
                <h2>¡Gracias por tu donación!</h2>
                <p>Has donado <strong>${amount}€</strong> para apoyar EntrenoApp</p>
                <div class="success-benefits">
                    <h3>Como agradecimiento:</h3>
                    <ul>
                        <li>✅ Acceso a funciones beta</li>
                        <li>✅ Soporte prioritario</li>
                        <li>✅ Tu nombre en los agradecimientos</li>
                        <li>✅ Notificaciones de nuevas funciones</li>
                    </ul>
                </div>
                <button class="glass-button glass-button-success" onclick="window.donationManager.closeDonationModal()">
                    ¡Continuar entrenando!
                </button>
            </div>
        `;

        document.body.appendChild(successModal);

        // Trackear donación
        this.trackDonation(amount);
    }

    closeDonationModal() {
        const modals = document.querySelectorAll('.donation-modal, .donation-success, .donation-loading');
        modals.forEach(modal => modal.remove());
    }

    showDonationUpsell() {
        // Mostrar upsell de donación después de completar entrenamientos
        const workoutCount = parseInt(localStorage.getItem('workout_count') || '0');
        if (workoutCount >= 10 && workoutCount % 10 === 0) {
            setTimeout(() => {
                this.showDonationBanner();
            }, 5000);
        }
    }

    showDonationBanner() {
        const banner = document.createElement('div');
        banner.className = 'donation-banner glass-effect';
        banner.innerHTML = `
            <div class="banner-content">
                <div class="banner-text">
                    <h4>💝 ¿Te gusta EntrenoApp?</h4>
                    <p>Considera hacer una donación para apoyar el desarrollo</p>
                </div>
                <div class="banner-actions">
                    <button class="glass-button glass-button-primary" onclick="window.donationManager.showDonationModal()">
                        Donar
                    </button>
                    <button class="banner-close" onclick="this.parentElement.parentElement.remove()">×</button>
                </div>
            </div>
        `;

        document.body.appendChild(banner);

        // Auto-remover después de 15 segundos
        setTimeout(() => {
            if (banner.parentElement) {
                banner.remove();
            }
        }, 15000);
    }

    // Métodos de tracking
    trackDonation(amount) {
        this.trackEvent('donation_completed', {
            amount: amount,
            currency: 'EUR'
        });
    }

    trackEvent(eventName, parameters = {}) {
        if (window.gtag) {
            gtag('event', eventName, parameters);
        }
    }
}

// Instancia global
window.donationManager = new DonationManager();

// CSS para el sistema de donaciones
const donationStyles = `
<style>
.donation-modal {
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

.donation-modal-content {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(20px);
    border-radius: 20px;
    padding: 30px;
    max-width: 90%;
    max-height: 90%;
    overflow-y: auto;
    border: 1px solid rgba(0, 212, 255, 0.3);
}

.donation-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
}

.donation-header h2 {
    color: #00D4FF;
    margin: 0;
    font-size: 2rem;
}

.donation-close {
    background: none;
    border: none;
    color: white;
    font-size: 24px;
    cursor: pointer;
}

.donation-intro {
    margin-bottom: 30px;
    text-align: center;
}

.donation-intro p {
    color: #fff;
    margin: 10px 0;
    line-height: 1.5;
}

.donation-reasons {
    margin-bottom: 30px;
}

.donation-reasons h3 {
    color: #00D4FF;
    margin-bottom: 15px;
}

.reasons-list {
    list-style: none;
    padding: 0;
}

.reasons-list li {
    color: #fff;
    padding: 8px 0;
    font-size: 1.1rem;
}

.donation-options {
    margin-bottom: 30px;
}

.donation-options h3 {
    color: #00D4FF;
    margin-bottom: 20px;
}

.reason-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 15px;
}

.reason-card {
    background: rgba(255, 255, 255, 0.05);
    border: 2px solid rgba(255, 255, 255, 0.1);
    border-radius: 15px;
    padding: 20px;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s ease;
}

.reason-card:hover,
.reason-card.selected {
    border-color: #00D4FF;
    background: rgba(0, 212, 255, 0.1);
    transform: translateY(-2px);
}

.reason-emoji {
    font-size: 2rem;
    margin-bottom: 10px;
}

.reason-card h4 {
    color: #00D4FF;
    margin: 0 0 10px 0;
    font-size: 1.1rem;
}

.reason-card p {
    color: #ccc;
    margin: 0 0 15px 0;
    font-size: 0.9rem;
}

.reason-amount {
    color: #00D4FF;
    font-size: 1.5rem;
    font-weight: bold;
}

.custom-donation {
    margin-bottom: 30px;
}

.custom-donation h3 {
    color: #00D4FF;
    margin-bottom: 15px;
}

.custom-amount-input {
    display: flex;
    align-items: center;
    gap: 10px;
    max-width: 200px;
}

.custom-amount-input input {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(0, 212, 255, 0.3);
    border-radius: 10px;
    padding: 12px;
    color: white;
    font-size: 1.2rem;
    width: 100%;
}

.custom-amount-input input::placeholder {
    color: #ccc;
}

.currency {
    color: #00D4FF;
    font-size: 1.2rem;
    font-weight: bold;
}

.donation-methods {
    margin-bottom: 30px;
}

.donation-methods h3 {
    color: #00D4FF;
    margin-bottom: 15px;
}

.payment-methods {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
}

.payment-method {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 10px;
    padding: 15px 20px;
    color: white;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 8px;
}

.payment-method.active,
.payment-method:hover {
    border-color: #00D4FF;
    background: rgba(0, 212, 255, 0.2);
}

.method-icon {
    font-size: 1.2rem;
}

.donation-footer {
    text-align: center;
}

.donation-note {
    color: #ccc;
    font-size: 0.9rem;
    margin-top: 15px;
}

.donation-banner {
    position: fixed;
    bottom: 100px;
    left: 20px;
    right: 20px;
    background: rgba(255, 193, 7, 0.1);
    border: 1px solid rgba(255, 193, 7, 0.3);
    border-radius: 15px;
    padding: 15px;
    z-index: 1000;
    animation: slideUp 0.3s ease-out;
}

.banner-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 15px;
}

.banner-text h4 {
    color: #FFC107;
    margin: 0 0 5px 0;
    font-size: 1.1rem;
}

.banner-text p {
    color: #fff;
    margin: 0;
    font-size: 0.9rem;
}

.banner-actions {
    display: flex;
    align-items: center;
    gap: 10px;
}

.banner-close {
    background: none;
    border: none;
    color: white;
    font-size: 18px;
    cursor: pointer;
    padding: 5px;
}

.donation-loading {
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

.donation-loading-content {
    text-align: center;
    color: white;
}

.donation-success {
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

.donation-success-content {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(20px);
    border-radius: 20px;
    padding: 30px;
    text-align: center;
    max-width: 500px;
    border: 1px solid rgba(0, 212, 255, 0.3);
}

.success-icon {
    font-size: 4rem;
    margin-bottom: 20px;
}

.success-benefits {
    margin: 20px 0;
    text-align: left;
}

.success-benefits h3 {
    color: #00D4FF;
    margin-bottom: 15px;
}

.success-benefits ul {
    list-style: none;
    padding: 0;
}

.success-benefits li {
    color: #fff;
    padding: 5px 0;
}

@keyframes slideUp {
    from {
        transform: translateY(100%);
        opacity: 0;
    }
    to {
        transform: translateY(0);
        opacity: 1;
    }
}

@media (max-width: 768px) {
    .reason-cards {
        grid-template-columns: 1fr;
    }
    
    .banner-content {
        flex-direction: column;
        text-align: center;
    }
    
    .banner-actions {
        justify-content: center;
    }
}
</style>
`;

// Añadir estilos al head
document.head.insertAdjacentHTML('beforeend', donationStyles);

