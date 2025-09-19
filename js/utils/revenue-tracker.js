// Sistema de tracking de ingresos para EntrenoApp
class RevenueTracker {
    constructor() {
        this.revenueData = {
            ads: {
                impressions: 0,
                clicks: 0,
                revenue: 0,
                ctr: 0,
                cpm: 0
            },
            premium: {
                subscriptions: 0,
                revenue: 0,
                conversionRate: 0,
                plans: {
                    monthly: 0,
                    yearly: 0,
                    lifetime: 0
                }
            },
            affiliate: {
                clicks: 0,
                conversions: 0,
                revenue: 0,
                commissionRate: 0.05
            },
            donations: {
                count: 0,
                totalAmount: 0,
                averageAmount: 0
            }
        };
        
        this.init();
    }

    init() {
        this.loadRevenueData();
        this.setupEventListeners();
    }

    loadRevenueData() {
        const savedData = localStorage.getItem('entrenoapp_revenue_data');
        if (savedData) {
            try {
                this.revenueData = { ...this.revenueData, ...JSON.parse(savedData) };
            } catch (error) {
                console.error('Error loading revenue data:', error);
            }
        }
    }

    saveRevenueData() {
        localStorage.setItem('entrenoapp_revenue_data', JSON.stringify(this.revenueData));
    }

    setupEventListeners() {
        // Trackear eventos de anuncios
        document.addEventListener('ad_impression', (e) => {
            this.trackAdImpression(e.detail);
        });

        document.addEventListener('ad_click', (e) => {
            this.trackAdClick(e.detail);
        });

        // Trackear eventos de premium
        document.addEventListener('premium_activated', (e) => {
            this.trackPremiumSubscription(e.detail);
        });

        // Trackear eventos de afiliados
        document.addEventListener('affiliate_click', (e) => {
            this.trackAffiliateClick(e.detail);
        });

        document.addEventListener('affiliate_conversion', (e) => {
            this.trackAffiliateConversion(e.detail);
        });

        // Trackear eventos de donaciones
        document.addEventListener('donation_completed', (e) => {
            this.trackDonation(e.detail);
        });
    }

    // Tracking de anuncios
    trackAdImpression(details = {}) {
        this.revenueData.ads.impressions++;
        this.updateAdMetrics();
        this.saveRevenueData();
        this.trackEvent('ad_impression', details);
    }

    trackAdClick(details = {}) {
        this.revenueData.ads.clicks++;
        this.updateAdMetrics();
        this.saveRevenueData();
        this.trackEvent('ad_click', details);
    }

    updateAdMetrics() {
        const { impressions, clicks } = this.revenueData.ads;
        this.revenueData.ads.ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
        this.revenueData.ads.cpm = impressions > 0 ? (this.revenueData.ads.revenue / impressions) * 1000 : 0;
    }

    // Tracking de premium
    trackPremiumSubscription(details) {
        const { plan, amount } = details;
        this.revenueData.premium.subscriptions++;
        this.revenueData.premium.revenue += amount || 0;
        
        if (plan) {
            const planType = plan.split('_')[1]; // monthly, yearly, lifetime
            if (this.revenueData.premium.plans[planType] !== undefined) {
                this.revenueData.premium.plans[planType]++;
            }
        }
        
        this.updatePremiumMetrics();
        this.saveRevenueData();
        this.trackEvent('premium_subscription', details);
    }

    updatePremiumMetrics() {
        // Calcular tasa de conversión (simulado)
        const totalUsers = parseInt(localStorage.getItem('entrenoapp_total_users') || '100');
        this.revenueData.premium.conversionRate = totalUsers > 0 ? 
            (this.revenueData.premium.subscriptions / totalUsers) * 100 : 0;
    }

    // Tracking de afiliados
    trackAffiliateClick(details) {
        this.revenueData.affiliate.clicks++;
        this.saveRevenueData();
        this.trackEvent('affiliate_click', details);
    }

    trackAffiliateConversion(details) {
        const { productPrice, commissionRate } = details;
        const commission = (productPrice || 0) * (commissionRate || this.revenueData.affiliate.commissionRate);
        
        this.revenueData.affiliate.conversions++;
        this.revenueData.affiliate.revenue += commission;
        this.saveRevenueData();
        this.trackEvent('affiliate_conversion', details);
    }

    // Tracking de donaciones
    trackDonation(details) {
        const { amount } = details;
        this.revenueData.donations.count++;
        this.revenueData.donations.totalAmount += amount || 0;
        this.revenueData.donations.averageAmount = this.revenueData.donations.totalAmount / this.revenueData.donations.count;
        this.saveRevenueData();
        this.trackEvent('donation_completed', details);
    }

    // Métodos de consulta
    getTotalRevenue() {
        return this.revenueData.ads.revenue + 
               this.revenueData.premium.revenue + 
               this.revenueData.affiliate.revenue + 
               this.revenueData.donations.totalAmount;
    }

    getRevenueBreakdown() {
        return {
            ads: this.revenueData.ads.revenue,
            premium: this.revenueData.premium.revenue,
            affiliate: this.revenueData.affiliate.revenue,
            donations: this.revenueData.donations.totalAmount,
            total: this.getTotalRevenue()
        };
    }

    getAdPerformance() {
        return {
            impressions: this.revenueData.ads.impressions,
            clicks: this.revenueData.ads.clicks,
            ctr: this.revenueData.ads.ctr,
            cpm: this.revenueData.ads.cpm,
            revenue: this.revenueData.ads.revenue
        };
    }

    getPremiumStats() {
        return {
            subscriptions: this.revenueData.premium.subscriptions,
            revenue: this.revenueData.premium.revenue,
            conversionRate: this.revenueData.premium.conversionRate,
            plans: this.revenueData.premium.plans
        };
    }

    getAffiliateStats() {
        return {
            clicks: this.revenueData.affiliate.clicks,
            conversions: this.revenueData.affiliate.conversions,
            revenue: this.revenueData.affiliate.revenue,
            conversionRate: this.revenueData.affiliate.clicks > 0 ? 
                (this.revenueData.affiliate.conversions / this.revenueData.affiliate.clicks) * 100 : 0
        };
    }

    getDonationStats() {
        return {
            count: this.revenueData.donations.count,
            totalAmount: this.revenueData.donations.totalAmount,
            averageAmount: this.revenueData.donations.averageAmount
        };
    }

    // Generar reporte de ingresos
    generateRevenueReport() {
        const report = {
            date: new Date().toISOString(),
            totalRevenue: this.getTotalRevenue(),
            breakdown: this.getRevenueBreakdown(),
            ads: this.getAdPerformance(),
            premium: this.getPremiumStats(),
            affiliate: this.getAffiliateStats(),
            donations: this.getDonationStats()
        };

        return report;
    }

    // Mostrar dashboard de ingresos (solo para desarrollo)
    showRevenueDashboard() {
        const modal = document.createElement('div');
        modal.className = 'revenue-dashboard-modal';
        modal.innerHTML = `
            <div class="revenue-dashboard-content glass-effect">
                <div class="dashboard-header">
                    <h2>📊 Dashboard de Ingresos</h2>
                    <button class="close-btn" onclick="this.closest('.revenue-dashboard-modal').remove()">×</button>
                </div>
                <div class="dashboard-body">
                    ${this.renderRevenueOverview()}
                    ${this.renderRevenueBreakdown()}
                    ${this.renderAdPerformance()}
                    ${this.renderPremiumStats()}
                    ${this.renderAffiliateStats()}
                    ${this.renderDonationStats()}
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    }

    renderRevenueOverview() {
        const total = this.getTotalRevenue();
        return `
            <div class="revenue-overview">
                <h3>💰 Ingresos Totales</h3>
                <div class="total-revenue">${total.toFixed(2)}€</div>
                <div class="revenue-sources">
                    <div class="source-item">
                        <span class="source-label">Anuncios:</span>
                        <span class="source-value">${this.revenueData.ads.revenue.toFixed(2)}€</span>
                    </div>
                    <div class="source-item">
                        <span class="source-label">Premium:</span>
                        <span class="source-value">${this.revenueData.premium.revenue.toFixed(2)}€</span>
                    </div>
                    <div class="source-item">
                        <span class="source-label">Afiliados:</span>
                        <span class="source-value">${this.revenueData.affiliate.revenue.toFixed(2)}€</span>
                    </div>
                    <div class="source-item">
                        <span class="source-label">Donaciones:</span>
                        <span class="source-value">${this.revenueData.donations.totalAmount.toFixed(2)}€</span>
                    </div>
                </div>
            </div>
        `;
    }

    renderRevenueBreakdown() {
        const breakdown = this.getRevenueBreakdown();
        const total = breakdown.total;
        
        return `
            <div class="revenue-breakdown">
                <h3>📈 Distribución de Ingresos</h3>
                <div class="breakdown-chart">
                    <div class="breakdown-item" style="width: ${total > 0 ? (breakdown.ads / total) * 100 : 0}%">
                        <span class="breakdown-label">Anuncios</span>
                        <span class="breakdown-percentage">${total > 0 ? ((breakdown.ads / total) * 100).toFixed(1) : 0}%</span>
                    </div>
                    <div class="breakdown-item" style="width: ${total > 0 ? (breakdown.premium / total) * 100 : 0}%">
                        <span class="breakdown-label">Premium</span>
                        <span class="breakdown-percentage">${total > 0 ? ((breakdown.premium / total) * 100).toFixed(1) : 0}%</span>
                    </div>
                    <div class="breakdown-item" style="width: ${total > 0 ? (breakdown.affiliate / total) * 100 : 0}%">
                        <span class="breakdown-label">Afiliados</span>
                        <span class="breakdown-percentage">${total > 0 ? ((breakdown.affiliate / total) * 100).toFixed(1) : 0}%</span>
                    </div>
                    <div class="breakdown-item" style="width: ${total > 0 ? (breakdown.donations / total) * 100 : 0}%">
                        <span class="breakdown-label">Donaciones</span>
                        <span class="breakdown-percentage">${total > 0 ? ((breakdown.donations / total) * 100).toFixed(1) : 0}%</span>
                    </div>
                </div>
            </div>
        `;
    }

    renderAdPerformance() {
        const ads = this.getAdPerformance();
        return `
            <div class="ad-performance">
                <h3>📺 Rendimiento de Anuncios</h3>
                <div class="performance-grid">
                    <div class="performance-item">
                        <span class="performance-label">Impresiones:</span>
                        <span class="performance-value">${ads.impressions}</span>
                    </div>
                    <div class="performance-item">
                        <span class="performance-label">Clicks:</span>
                        <span class="performance-value">${ads.clicks}</span>
                    </div>
                    <div class="performance-item">
                        <span class="performance-label">CTR:</span>
                        <span class="performance-value">${ads.ctr.toFixed(2)}%</span>
                    </div>
                    <div class="performance-item">
                        <span class="performance-label">CPM:</span>
                        <span class="performance-value">${ads.cpm.toFixed(2)}€</span>
                    </div>
                </div>
            </div>
        `;
    }

    renderPremiumStats() {
        const premium = this.getPremiumStats();
        return `
            <div class="premium-stats">
                <h3>💎 Estadísticas Premium</h3>
                <div class="stats-grid">
                    <div class="stat-item">
                        <span class="stat-label">Suscripciones:</span>
                        <span class="stat-value">${premium.subscriptions}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Conversión:</span>
                        <span class="stat-value">${premium.conversionRate.toFixed(2)}%</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Mensual:</span>
                        <span class="stat-value">${premium.plans.monthly}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Anual:</span>
                        <span class="stat-value">${premium.plans.yearly}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Vitalicio:</span>
                        <span class="stat-value">${premium.plans.lifetime}</span>
                    </div>
                </div>
            </div>
        `;
    }

    renderAffiliateStats() {
        const affiliate = this.getAffiliateStats();
        return `
            <div class="affiliate-stats">
                <h3>🛍️ Estadísticas de Afiliados</h3>
                <div class="stats-grid">
                    <div class="stat-item">
                        <span class="stat-label">Clicks:</span>
                        <span class="stat-value">${affiliate.clicks}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Conversiones:</span>
                        <span class="stat-value">${affiliate.conversions}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Tasa de conversión:</span>
                        <span class="stat-value">${affiliate.conversionRate.toFixed(2)}%</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Comisiones:</span>
                        <span class="stat-value">${affiliate.revenue.toFixed(2)}€</span>
                    </div>
                </div>
            </div>
        `;
    }

    renderDonationStats() {
        const donations = this.getDonationStats();
        return `
            <div class="donation-stats">
                <h3>💝 Estadísticas de Donaciones</h3>
                <div class="stats-grid">
                    <div class="stat-item">
                        <span class="stat-label">Donaciones:</span>
                        <span class="stat-value">${donations.count}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Total:</span>
                        <span class="stat-value">${donations.totalAmount.toFixed(2)}€</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Promedio:</span>
                        <span class="stat-value">${donations.averageAmount.toFixed(2)}€</span>
                    </div>
                </div>
            </div>
        `;
    }

    trackEvent(eventName, parameters = {}) {
        if (window.gtag) {
            gtag('event', eventName, parameters);
        }
    }
}

// Instancia global
window.revenueTracker = new RevenueTracker();

// CSS para el dashboard de ingresos
const revenueDashboardStyles = `
<style>
.revenue-dashboard-modal {
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

.revenue-dashboard-content {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(20px);
    border-radius: 20px;
    padding: 30px;
    max-width: 90%;
    max-height: 90%;
    overflow-y: auto;
    border: 1px solid rgba(0, 212, 255, 0.3);
}

.dashboard-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
}

.dashboard-header h2 {
    color: #00D4FF;
    margin: 0;
}

.close-btn {
    background: none;
    border: none;
    color: white;
    font-size: 24px;
    cursor: pointer;
}

.dashboard-body {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 20px;
}

.revenue-overview,
.revenue-breakdown,
.ad-performance,
.premium-stats,
.affiliate-stats,
.donation-stats {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 15px;
    padding: 20px;
    border: 1px solid rgba(255, 255, 255, 0.1);
}

.revenue-overview h3,
.revenue-breakdown h3,
.ad-performance h3,
.premium-stats h3,
.affiliate-stats h3,
.donation-stats h3 {
    color: #00D4FF;
    margin: 0 0 15px 0;
    font-size: 1.2rem;
}

.total-revenue {
    font-size: 2.5rem;
    font-weight: bold;
    color: #00D4FF;
    text-align: center;
    margin: 20px 0;
}

.revenue-sources {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 10px;
}

.source-item {
    display: flex;
    justify-content: space-between;
    padding: 8px 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.source-label {
    color: #ccc;
}

.source-value {
    color: #00D4FF;
    font-weight: bold;
}

.breakdown-chart {
    display: flex;
    height: 30px;
    border-radius: 15px;
    overflow: hidden;
    margin: 15px 0;
}

.breakdown-item {
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 0.8rem;
    font-weight: bold;
    position: relative;
}

.breakdown-item:nth-child(1) { background: #FF6B6B; }
.breakdown-item:nth-child(2) { background: #4ECDC4; }
.breakdown-item:nth-child(3) { background: #45B7D1; }
.breakdown-item:nth-child(4) { background: #96CEB4; }

.performance-grid,
.stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 15px;
}

.performance-item,
.stat-item {
    text-align: center;
    padding: 10px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 10px;
}

.performance-label,
.stat-label {
    display: block;
    color: #ccc;
    font-size: 0.9rem;
    margin-bottom: 5px;
}

.performance-value,
.stat-value {
    display: block;
    color: #00D4FF;
    font-size: 1.2rem;
    font-weight: bold;
}

@media (max-width: 768px) {
    .dashboard-body {
        grid-template-columns: 1fr;
    }
    
    .revenue-sources {
        grid-template-columns: 1fr;
    }
    
    .performance-grid,
    .stats-grid {
        grid-template-columns: repeat(2, 1fr);
    }
}
</style>
`;

// Añadir estilos al head
document.head.insertAdjacentHTML('beforeend', revenueDashboardStyles);

