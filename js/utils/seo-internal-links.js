// Sistema de enlaces internos para SEO
// Añade enlaces contextuales automáticamente entre artículos relacionados

const internalLinksStrategy = {
    // Artículos relacionados por tema
    topics: {
        'running': [
            '/empezar-correr-guia-completa.html',
            '/nutricion-corredores.html',
            '/relojes-fitness-smartwatch.html'
        ],
        'gym': [
            '/guia-completa-fitness-casa-2025.html',
            '/equipamiento-fitness-casa.html',
            '/proteinas-vegetales-2025.html',
            '/gym-anxiety-guia-completa-2025.html'
        ],
        'nutricion': [
            '/nutricion-deportiva-guia-completa-2025.html',
            '/proteina-cuanta-realmente-necesitas-2025.html',
            '/proteinas-vegetales-2025.html',
            '/libros-nutricion-deportiva-2025.html',
            '/batidoras-proteina-2025.html'
        ],
        'suplementos': [
            '/suplementos-recomendados.html',
            '/suplementos-para-perder-grasa.html',
            '/75-hard-challenge-suplementos-2025.html',
            '/proteinas-vegetales-2025.html'
        ],
        'equipamiento': [
            '/equipamiento-fitness-casa.html',
            '/pesas-equipamiento-casa-2025.html',
            '/relojes-fitness-smartwatch.html',
            '/esterillas-yoga-2025.html',
            '/batidoras-proteina-2025.html'
        ],
        'recuperacion': [
            '/sleep-hacking-recuperacion-fitness-2025.html',
            '/almohadas-mejorar-sueno-2025.html'
        ]
    },
    
    // Enlaces globales importantes
    important: [
        '/empezar-correr-guia-completa.html',
        '/guia-completa-fitness-casa-2025.html',
        '/nutricion-deportiva-guia-completa-2025.html',
        '/app.html'
    ]
};

/**
 * Generar sección de artículos relacionados
 */
export function generateRelatedArticles(currentPage) {
    const related = findRelatedArticles(currentPage);
    
    if (related.length === 0) return '';
    
    return `
        <div class="related-articles-section" style="margin-top: 3rem; padding: 2rem; background: rgba(255,255,255,0.05); border-radius: 16px;">
            <h3 style="font-size: 1.5rem; margin-bottom: 1.5rem; color: var(--text-primary);">
                📚 Artículos Relacionados
            </h3>
            <div class="related-articles-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem;">
                ${related.slice(0, 4).map(article => `
                    <a href="${article.url}" class="related-article-card" 
                       style="display: block; padding: 1.25rem; background: rgba(255,255,255,0.08); 
                              border-radius: 12px; text-decoration: none; transition: transform 0.2s;
                              border: 1px solid rgba(255,255,255,0.1);">
                        <div style="font-size: 1.25rem; margin-bottom: 0.5rem;">${article.icon || '💪'}</div>
                        <h4 style="font-size: 1rem; font-weight: 600; color: var(--text-primary); 
                                   margin-bottom: 0.5rem; line-height: 1.3;">
                            ${article.title}
                        </h4>
                        <p style="font-size: 0.875rem; color: var(--text-secondary); opacity: 0.8; 
                                  line-height: 1.4;">
                            ${article.description || ''}
                        </p>
                    </a>
                `).join('')}
            </div>
        </div>
    `;
}

/**
 * Encontrar artículos relacionados
 */
function findRelatedArticles(currentPage) {
    const pagePath = currentPage.toLowerCase();
    const related = [];
    
    // Buscar por temas
    for (const [topic, urls] of Object.entries(internalLinksStrategy.topics)) {
        if (pagePath.includes(topic)) {
            urls.forEach(url => {
                if (!url.includes(currentPage)) {
                    related.push({
                        url,
                        title: getArticleTitle(url),
                        icon: getArticleIcon(url)
                    });
                }
            });
        }
    }
    
    // Si no hay relacionados, usar importantes
    if (related.length === 0) {
        internalLinksStrategy.important.forEach(url => {
            if (!url.includes(currentPage)) {
                related.push({
                    url,
                    title: getArticleTitle(url),
                    icon: getArticleIcon(url)
                });
            }
        });
    }
    
    return related;
}

/**
 * Obtener título del artículo
 */
function getArticleTitle(url) {
    const titles = {
        '/empezar-correr-guia-completa.html': 'Cómo Empezar a Correr: Guía Completa',
        '/guia-completa-fitness-casa-2025.html': 'Fitness en Casa: Guía Completa 2025',
        '/nutricion-deportiva-guia-completa-2025.html': 'Nutrición Deportiva 2025',
        '/equipamiento-fitness-casa.html': 'Mejor Equipamiento Fitness para Casa',
        '/relojes-fitness-smartwatch.html': 'Mejores Relojes Fitness 2025',
        '/proteinas-vegetales-2025.html': 'Proteínas Vegetales 2025',
        '/gym-anxiety-guia-completa-2025.html': 'Gym Anxiety: Guía Completa',
        '/proteina-cuanta-realmente-necesitas-2025.html': '¿Cuánta Proteína Necesitas?',
        '/sleep-hacking-recuperacion-fitness-2025.html': 'Sleep Hacking: Mejora tu Recuperación',
        '/app.html': 'Usar EntrenoApp'
    };
    return titles[url] || 'Artículo Relacionado';
}

/**
 * Obtener icono del artículo
 */
function getArticleIcon(url) {
    const icons = {
        '/empezar-correr-guia-completa.html': '🏃‍♂️',
        '/guia-completa-fitness-casa-2025.html': '🏠',
        '/nutricion-deportiva-guia-completa-2025.html': '🥗',
        '/equipamiento-fitness-casa.html': '🏋️',
        '/relojes-fitness-smartwatch.html': '⌚',
        '/proteinas-vegetales-2025.html': '🌱',
        '/gym-anxiety-guia-completa-2025.html': '💪',
        '/proteina-cuanta-realmente-necesitas-2025.html': '📊',
        '/sleep-hacking-recuperacion-fitness-2025.html': '😴',
        '/app.html': '📱'
    };
    return icons[url] || '💪';
}

// Exportar funciones globales
if (typeof window !== 'undefined') {
    window.generateRelatedArticles = generateRelatedArticles;
}

