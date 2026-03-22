// Sistema de tienda de afiliados para EntrenoApp
class AffiliateStore {
    constructor() {
        this.products = {
            supplements: [
                {
                    id: 'protein_whey',
                    name: 'Proteína Whey Premium',
                    brand: 'Optimum Nutrition',
                    price: 29.99,
                    originalPrice: 39.99,
                    discount: '25%',
                    image: 'https://via.placeholder.com/200x200/00D4FF/FFFFFF?text=Whey',
                    affiliateLink: 'https://amzn.to/3xYz123',
                    category: 'supplements',
                    description: 'Proteína de suero de leche de alta calidad para recuperación muscular',
                    rating: 4.8,
                    reviews: 1250
                },
                {
                    id: 'creatine_mono',
                    name: 'Creatina Monohidrato',
                    brand: 'Creapure',
                    price: 19.99,
                    originalPrice: 24.99,
                    discount: '20%',
                    image: 'https://via.placeholder.com/200x200/2196F3/FFFFFF?text=Creatine',
                    affiliateLink: 'https://amzn.to/3xYz456',
                    category: 'supplements',
                    description: 'Creatina monohidrato pura para aumentar fuerza y masa muscular',
                    rating: 4.9,
                    reviews: 890
                },
                {
                    id: 'pre_workout',
                    name: 'Pre-Workout Energético',
                    brand: 'C4 Sport',
                    price: 24.99,
                    originalPrice: 34.99,
                    discount: '29%',
                    image: 'https://via.placeholder.com/200x200/FF6B6B/FFFFFF?text=Pre-Workout',
                    affiliateLink: 'https://amzn.to/3xYz789',
                    category: 'supplements',
                    description: 'Suplemento pre-entrenamiento para máximo rendimiento',
                    rating: 4.7,
                    reviews: 2100
                }
            ],
            equipment: [
                {
                    id: 'kettlebell_16kg',
                    name: 'Kettlebell 16kg',
                    brand: 'Rogue Fitness',
                    price: 49.99,
                    originalPrice: 69.99,
                    discount: '29%',
                    image: 'https://via.placeholder.com/200x200/4ECDC4/FFFFFF?text=Kettlebell',
                    affiliateLink: 'https://amzn.to/3xYz101',
                    category: 'equipment',
                    description: 'Kettlebell de hierro fundido para entrenamiento funcional',
                    rating: 4.6,
                    reviews: 450
                },
                {
                    id: 'resistance_bands',
                    name: 'Bandas de Resistencia',
                    brand: 'TRX',
                    price: 34.99,
                    originalPrice: 49.99,
                    discount: '30%',
                    image: 'https://via.placeholder.com/200x200/45B7D1/FFFFFF?text=Bands',
                    affiliateLink: 'https://amzn.to/3xYz202',
                    category: 'equipment',
                    description: 'Set completo de bandas de resistencia para entrenamiento en casa',
                    rating: 4.8,
                    reviews: 1200
                },
                {
                    id: 'yoga_mat',
                    name: 'Alfombrilla de Yoga Premium',
                    brand: 'Liforme',
                    price: 79.99,
                    originalPrice: 99.99,
                    discount: '20%',
                    image: 'https://via.placeholder.com/200x200/96CEB4/FFFFFF?text=Yoga+Mat',
                    affiliateLink: 'https://amzn.to/3xYz303',
                    category: 'equipment',
                    description: 'Alfombrilla de yoga ecológica con alineación perfecta',
                    rating: 4.9,
                    reviews: 850
                }
            ],
            apparel: [
                {
                    id: 'compression_shirt',
                    name: 'Camiseta Compresión',
                    brand: 'Under Armour',
                    price: 24.99,
                    originalPrice: 34.99,
                    discount: '29%',
                    image: 'https://via.placeholder.com/200x200/FFEAA7/FFFFFF?text=Shirt',
                    affiliateLink: 'https://amzn.to/3xYz404',
                    category: 'apparel',
                    description: 'Camiseta de compresión para máximo rendimiento',
                    rating: 4.5,
                    reviews: 3200
                },
                {
                    id: 'running_shoes',
                    name: 'Zapatillas Running',
                    brand: 'Nike Air Zoom',
                    price: 89.99,
                    originalPrice: 129.99,
                    discount: '31%',
                    image: 'https://via.placeholder.com/200x200/74B9FF/FFFFFF?text=Shoes',
                    affiliateLink: 'https://amzn.to/3xYz505',
                    category: 'apparel',
                    description: 'Zapatillas de running con tecnología Air Zoom',
                    rating: 4.7,
                    reviews: 5600
                }
            ]
        };
        
        this.commissionRate = 0.05; // 5% de comisión
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.trackStoreViews();
    }

    setupEventListeners() {
        // Mostrar tienda después de completar entrenamientos
        document.addEventListener('workout_completed', () => {
            this.showStoreUpsell();
        });
    }

    showStore() {
        const modal = document.createElement('div');
        modal.className = 'affiliate-store-modal';
        modal.innerHTML = `
            <div class="store-modal-content glass-effect">
                <div class="store-header">
                    <h2>🛍️ Tienda Fitness</h2>
                    <button class="store-close" onclick="window.affiliateStore.closeStore()">×</button>
                </div>
                <div class="store-body">
                    <div class="store-categories">
                        <button class="category-btn active" data-category="all">Todos</button>
                        <button class="category-btn" data-category="supplements">Suplementos</button>
                        <button class="category-btn" data-category="equipment">Equipamiento</button>
                        <button class="category-btn" data-category="apparel">Ropa</button>
                    </div>
                    <div class="store-products" id="store-products">
                        ${this.renderProducts('all')}
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        this.setupCategoryFilters();
        this.setupProductClicks();
    }

    renderProducts(category) {
        let productsToShow = [];
        
        if (category === 'all') {
            productsToShow = [...this.products.supplements, ...this.products.equipment, ...this.products.apparel];
        } else {
            productsToShow = this.products[category] || [];
        }

        return productsToShow.map(product => `
            <div class="product-card glass-card" data-product-id="${product.id}">
                <div class="product-image">
                    <img src="${product.image}" alt="${product.name}" loading="lazy">
                    ${product.discount ? `<div class="discount-badge">-${product.discount}</div>` : ''}
                </div>
                <div class="product-info">
                    <h4 class="product-name">${product.name}</h4>
                    <p class="product-brand">${product.brand}</p>
                    <p class="product-description">${product.description}</p>
                    <div class="product-rating">
                        ${this.renderStars(product.rating)}
                        <span class="rating-text">(${product.reviews} reseñas)</span>
                    </div>
                    <div class="product-price">
                        <span class="current-price">${product.price}€</span>
                        ${product.originalPrice ? `<span class="original-price">${product.originalPrice}€</span>` : ''}
                    </div>
                    <button class="glass-button glass-button-primary product-buy" data-product-id="${product.id}">
                        Ver Oferta
                    </button>
                </div>
            </div>
        `).join('');
    }

    renderStars(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;
        let stars = '';
        
        for (let i = 0; i < fullStars; i++) {
            stars += '⭐';
        }
        
        if (hasHalfStar) {
            stars += '✨';
        }
        
        return stars;
    }

    setupCategoryFilters() {
        const categoryBtns = document.querySelectorAll('.category-btn');
        categoryBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                // Remover active de todos
                categoryBtns.forEach(b => b.classList.remove('active'));
                // Añadir active al clickeado
                e.target.classList.add('active');
                
                // Filtrar productos
                const category = e.target.dataset.category;
                const productsContainer = document.getElementById('store-products');
                productsContainer.innerHTML = this.renderProducts(category);
                
                // Reconfigurar clicks de productos
                this.setupProductClicks();
            });
        });
    }

    setupProductClicks() {
        const productBtns = document.querySelectorAll('.product-buy');
        productBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productId = e.target.dataset.productId;
                this.handleProductClick(productId);
            });
        });
    }

    handleProductClick(productId) {
        // Encontrar el producto
        let product = null;
        for (const category in this.products) {
            product = this.products[category].find(p => p.id === productId);
            if (product) break;
        }

        if (!product) return;

        // Trackear click
        this.trackProductClick(product);

        // Mostrar confirmación antes de redirigir
        this.showProductConfirmation(product);
    }

    showProductConfirmation(product) {
        const modal = document.createElement('div');
        modal.className = 'product-confirmation-modal';
        modal.innerHTML = `
            <div class="confirmation-content glass-effect">
                <div class="confirmation-header">
                    <h3>🛒 Redirigiendo a la tienda</h3>
                </div>
                <div class="confirmation-body">
                    <div class="product-preview">
                        <img src="${product.image}" alt="${product.name}">
                        <div class="product-details">
                            <h4>${product.name}</h4>
                            <p class="brand">${product.brand}</p>
                            <p class="price">${product.price}€</p>
                        </div>
                    </div>
                    <p class="confirmation-text">
                        Serás redirigido a Amazon para completar tu compra. 
                        <strong>EntrenoApp recibe una pequeña comisión</strong> que nos ayuda a mantener la app gratuita.
                    </p>
                    <div class="confirmation-buttons">
                        <button class="glass-button glass-button-secondary" onclick="window.affiliateStore.closeConfirmation()">
                            Cancelar
                        </button>
                        <button class="glass-button glass-button-primary" onclick="window.affiliateStore.redirectToProduct('${product.affiliateLink}')">
                            Continuar a Amazon
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    }

    redirectToProduct(affiliateLink) {
        // Abrir en nueva pestaña
        window.open(affiliateLink, '_blank');
        
        // Trackear conversión
        this.trackConversion(affiliateLink);
        
        // Cerrar modales
        this.closeConfirmation();
        this.closeStore();
    }

    closeConfirmation() {
        const modal = document.querySelector('.product-confirmation-modal');
        if (modal) modal.remove();
    }

    closeStore() {
        const modal = document.querySelector('.affiliate-store-modal');
        if (modal) modal.remove();
    }

    showStoreUpsell() {
        // Mostrar upsell de tienda después de completar entrenamientos
        const workoutCount = parseInt(localStorage.getItem('workout_count') || '0');
        if (workoutCount >= 5 && workoutCount % 5 === 0) {
            setTimeout(() => {
                this.showStoreBanner();
            }, 3000);
        }
    }

    showStoreBanner() {
        const banner = document.createElement('div');
        banner.className = 'store-banner glass-effect';
        banner.innerHTML = `
            <div class="banner-content">
                <div class="banner-text">
                    <h4>🛍️ ¿Necesitas equipamiento?</h4>
                    <p>Descubre productos fitness con descuentos exclusivos</p>
                </div>
                <button class="glass-button glass-button-primary" onclick="window.affiliateStore.showStore()">
                    Ver Tienda
                </button>
                <button class="banner-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;

        document.body.appendChild(banner);

        // Auto-remover después de 10 segundos
        setTimeout(() => {
            if (banner.parentElement) {
                banner.remove();
            }
        }, 10000);
    }

    // Métodos de tracking
    trackStoreViews() {
        this.trackEvent('store_viewed');
    }

    trackProductClick(product) {
        this.trackEvent('product_clicked', {
            product_id: product.id,
            product_name: product.name,
            product_category: product.category,
            product_price: product.price
        });
    }

    trackConversion(affiliateLink) {
        this.trackEvent('affiliate_conversion', {
            affiliate_link: affiliateLink,
            commission_rate: this.commissionRate
        });
    }

    trackEvent(eventName, parameters = {}) {
        if (window.gtag) {
            gtag('event', eventName, parameters);
        }
    }
}

// Instancia global
window.affiliateStore = new AffiliateStore();

// CSS para la tienda de afiliados
const storeStyles = `
<style>
.affiliate-store-modal {
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

.store-modal-content {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(20px);
    border-radius: 20px;
    padding: 30px;
    max-width: 95%;
    max-height: 90%;
    overflow-y: auto;
    border: 1px solid rgba(0, 212, 255, 0.3);
}

.store-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
}

.store-header h2 {
    color: #00D4FF;
    margin: 0;
    font-size: 2rem;
}

.store-close {
    background: none;
    border: none;
    color: white;
    font-size: 24px;
    cursor: pointer;
}

.store-categories {
    display: flex;
    gap: 10px;
    margin-bottom: 30px;
    flex-wrap: wrap;
}

.category-btn {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(0, 212, 255, 0.3);
    color: white;
    padding: 10px 20px;
    border-radius: 25px;
    cursor: pointer;
    transition: all 0.3s ease;
}

.category-btn.active,
.category-btn:hover {
    background: rgba(0, 212, 255, 0.3);
    border-color: #00D4FF;
}

.store-products {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 20px;
}

.product-card {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 15px;
    padding: 20px;
    transition: all 0.3s ease;
    border: 1px solid rgba(255, 255, 255, 0.1);
}

.product-card:hover {
    transform: translateY(-5px);
    border-color: rgba(0, 212, 255, 0.5);
}

.product-image {
    position: relative;
    text-align: center;
    margin-bottom: 15px;
}

.product-image img {
    width: 100%;
    height: 200px;
    object-fit: cover;
    border-radius: 10px;
}

.discount-badge {
    position: absolute;
    top: 10px;
    right: 10px;
    background: linear-gradient(45deg, #FF6B6B, #FF8E8E);
    color: white;
    padding: 5px 10px;
    border-radius: 15px;
    font-size: 0.8rem;
    font-weight: bold;
}

.product-name {
    color: #00D4FF;
    margin: 0 0 5px 0;
    font-size: 1.1rem;
}

.product-brand {
    color: #ccc;
    margin: 0 0 10px 0;
    font-size: 0.9rem;
}

.product-description {
    color: #fff;
    margin: 0 0 15px 0;
    font-size: 0.9rem;
    line-height: 1.4;
}

.product-rating {
    margin-bottom: 15px;
}

.rating-text {
    color: #ccc;
    font-size: 0.8rem;
    margin-left: 5px;
}

.product-price {
    margin-bottom: 15px;
}

.current-price {
    color: #00D4FF;
    font-size: 1.5rem;
    font-weight: bold;
}

.original-price {
    color: #ccc;
    text-decoration: line-through;
    margin-left: 10px;
    font-size: 1rem;
}

.store-banner {
    position: fixed;
    bottom: 100px;
    left: 20px;
    right: 20px;
    background: rgba(0, 212, 255, 0.1);
    border: 1px solid rgba(0, 212, 255, 0.3);
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
    color: #00D4FF;
    margin: 0 0 5px 0;
    font-size: 1.1rem;
}

.banner-text p {
    color: #fff;
    margin: 0;
    font-size: 0.9rem;
}

.banner-close {
    background: none;
    border: none;
    color: white;
    font-size: 18px;
    cursor: pointer;
    padding: 5px;
}

.product-confirmation-modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10001;
}

.confirmation-content {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(20px);
    border-radius: 20px;
    padding: 30px;
    max-width: 500px;
    border: 1px solid rgba(0, 212, 255, 0.3);
}

.product-preview {
    display: flex;
    gap: 15px;
    margin-bottom: 20px;
    align-items: center;
}

.product-preview img {
    width: 80px;
    height: 80px;
    object-fit: cover;
    border-radius: 10px;
}

.product-details h4 {
    color: #00D4FF;
    margin: 0 0 5px 0;
}

.product-details .brand {
    color: #ccc;
    margin: 0 0 5px 0;
    font-size: 0.9rem;
}

.product-details .price {
    color: #00D4FF;
    margin: 0;
    font-size: 1.2rem;
    font-weight: bold;
}

.confirmation-text {
    color: #fff;
    margin-bottom: 20px;
    line-height: 1.5;
}

.confirmation-buttons {
    display: flex;
    gap: 10px;
    justify-content: flex-end;
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
    .store-products {
        grid-template-columns: 1fr;
    }
    
    .banner-content {
        flex-direction: column;
        text-align: center;
    }
    
    .confirmation-buttons {
        flex-direction: column;
    }
}
</style>
`;

// Añadir estilos al head
document.head.insertAdjacentHTML('beforeend', storeStyles);

