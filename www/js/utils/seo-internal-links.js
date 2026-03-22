// Sistema de enlaces internos para SEO
// Añade enlaces contextuales automáticamente entre artículos relacionados

const internalLinksStrategy = {
    // Artículos relacionados por tema
    topics: {
        'running': [
            '/empezar-correr-guia-completa.html',
            '/empezar-a-correr-2-semanas.html',
            '/errores-comunes-empezar-correr-2025.html',
            '/calzado-ideal-empezar-correr-2025.html',
            '/empezar-correr-sobrepeso-2025.html',
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
        <div class="related-articles-section" style="margin-top: 3rem; padding: 2rem; background: #f8f9fa; border-radius: 16px; border: 1px solid #eee;">
            <h3 style="font-size: 1.5rem; margin-bottom: 1.5rem; color: var(--text-primary, #222);">
                📚 Artículos Relacionados
            </h3>
            <div class="related-articles-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem;">
                ${related.slice(0, 6).map(article => `
                    <a href="${article.url}" class="related-article-card" 
                       style="display: block; padding: 1.25rem; background: #fff; 
                              border-radius: 12px; text-decoration: none; transition: transform 0.2s;
                              border: 1px solid #eee;">
                        <div style="font-size: 1.25rem; margin-bottom: 0.5rem;">${article.icon || '💪'}</div>
                        <h4 style="font-size: 1rem; font-weight: 700; color: var(--text-primary, #222); 
                                   margin-bottom: 0.5rem; line-height: 1.3;">
                            ${article.title}
                        </h4>
                        <p style="font-size: 0.875rem; color: var(--text-secondary, #555); opacity: 0.95; 
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
    const pagePath = (currentPage || '').toLowerCase();
    const related = [];

    // Matchers por tema (para URLs en español que no contienen "running", "nutrition", etc.)
    const topicMatchers = {
        running: ['running', 'correr', 'corredor', 'corredores', 'runners'],
        gym: ['gym', 'gimnasio', 'fuerza'],
        nutricion: ['nutricion', 'nutrición', 'proteina', 'proteína', 'proteinas', 'proteínas'],
        suplementos: ['suplement', 'cortisol', 'quema', 'grasa'],
        equipamiento: ['equipamiento', 'accesorios', 'pesas', 'relojes', 'ropa', 'esterillas', 'batidoras'],
        recuperacion: ['recuperacion', 'recuperación', 'sleep', 'sueno', 'sueño', 'almohadas']
    };
    
    // Buscar por temas
    for (const [topic, urls] of Object.entries(internalLinksStrategy.topics)) {
        const matchers = topicMatchers[topic] || [topic];
        const matchesTopic = matchers.some(m => pagePath.includes(m));
        if (matchesTopic) {
            urls.forEach(url => {
                if (url !== currentPage) {
                    related.push({
                        url,
                        title: getArticleTitle(url),
                        description: getArticleDescription(url),
                        icon: getArticleIcon(url)
                    });
                }
            });
        }
    }
    
    // Si no hay relacionados, usar importantes
    if (related.length === 0) {
        internalLinksStrategy.important.forEach(url => {
            if (url !== currentPage) {
                related.push({
                    url,
                    title: getArticleTitle(url),
                    description: getArticleDescription(url),
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
        '/empezar-correr-guia-completa.html': 'Empezar a correr desde cero (Plan 8 semanas)',
        '/empezar-a-correr-2-semanas.html': 'Empezar a correr en 2 semanas (Plan rápido)',
        '/errores-comunes-empezar-correr-2025.html': 'Errores al empezar a correr (10 fallos típicos)',
        '/calzado-ideal-empezar-correr-2025.html': 'Zapatillas para empezar a correr (Guía)',
        '/empezar-correr-sobrepeso-2025.html': 'Empezar a correr con sobrepeso (Plan seguro)',
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
 * Obtener descripción corta del artículo
 */
function getArticleDescription(url) {
    const descriptions = {
        '/empezar-correr-guia-completa.html': 'Plan gratis, paso a paso: de sofá a 5K sin lesiones.',
        '/empezar-a-correr-2-semanas.html': 'Plan rápido para correr 8 minutos seguidos en 2 semanas.',
        '/errores-comunes-empezar-correr-2025.html': 'Evita los errores típicos y progresa más rápido.',
        '/calzado-ideal-empezar-correr-2025.html': 'Cómo elegir zapatillas según tu pisada y amortiguación.',
        '/empezar-correr-sobrepeso-2025.html': 'Rutina progresiva y segura para proteger articulaciones.',
        '/nutricion-corredores.html': 'Qué comer antes y después de correr para rendir mejor.',
        '/relojes-fitness-smartwatch.html': 'Mejores relojes GPS y smartwatches para running.',
        '/app.html': 'Crea tu plan personalizado y registra tus entrenamientos.'
    };
    return descriptions[url] || '';
}

/**
 * Obtener icono del artículo
 */
function getArticleIcon(url) {
    const icons = {
        '/empezar-correr-guia-completa.html': '🏃‍♂️',
        '/empezar-a-correr-2-semanas.html': '⚡',
        '/errores-comunes-empezar-correr-2025.html': '⚠️',
        '/calzado-ideal-empezar-correr-2025.html': '👟',
        '/empezar-correr-sobrepeso-2025.html': '🧩',
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

