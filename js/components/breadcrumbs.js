// Breadcrumbs component for better navigation and SEO
class Breadcrumbs {
    constructor() {
        this.breadcrumbs = [];
        this.init();
    }

    init() {
        this.generateBreadcrumbs();
        this.renderBreadcrumbs();
    }

    generateBreadcrumbs() {
        const path = window.location.pathname;
        const segments = path.split('/').filter(segment => segment);
        
        // Always start with home
        this.breadcrumbs = [
            { name: 'Inicio', url: '/', icon: '🏠' }
        ];

        // Map URL segments to breadcrumb names
        const segmentMap = {
            'home.html': { name: 'Inicio', icon: '🏠' },
            'index.html': { name: 'App', icon: '📱' },
            'blog.html': { name: 'Blog', icon: '📝' },
            'about.html': { name: 'Sobre Nosotros', icon: '🏢' },
            'resources.html': { name: 'Recursos', icon: '📚' },
            'faq.html': { name: 'FAQ', icon: '❓' },
            'testimonials.html': { name: 'Testimonios', icon: '⭐' },
            'pricing.html': { name: 'Precios', icon: '💰' },
            'privacy.html': { name: 'Privacidad', icon: '🔒' },
            'terms.html': { name: 'Términos', icon: '📄' },
            'contact.html': { name: 'Contacto', icon: '📞' }
        };

        // Add breadcrumbs based on current page
        segments.forEach(segment => {
            if (segmentMap[segment]) {
                this.breadcrumbs.push({
                    name: segmentMap[segment].name,
                    url: `/${segment}`,
                    icon: segmentMap[segment].icon
                });
            }
        });
    }

    renderBreadcrumbs() {
        // Don't render on home page
        if (window.location.pathname === '/' || window.location.pathname === '/home.html') {
            return;
        }

        const breadcrumbContainer = document.createElement('nav');
        breadcrumbContainer.className = 'breadcrumbs';
        breadcrumbContainer.setAttribute('aria-label', 'Breadcrumb');
        
        const breadcrumbList = document.createElement('ol');
        breadcrumbList.className = 'breadcrumb-list';
        
        this.breadcrumbs.forEach((crumb, index) => {
            const listItem = document.createElement('li');
            listItem.className = 'breadcrumb-item';
            
            if (index === this.breadcrumbs.length - 1) {
                // Current page
                listItem.innerHTML = `
                    <span class="breadcrumb-current">
                        <span class="breadcrumb-icon">${crumb.icon}</span>
                        <span class="breadcrumb-text">${crumb.name}</span>
                    </span>
                `;
            } else {
                // Link
                listItem.innerHTML = `
                    <a href="${crumb.url}" class="breadcrumb-link">
                        <span class="breadcrumb-icon">${crumb.icon}</span>
                        <span class="breadcrumb-text">${crumb.name}</span>
                    </a>
                `;
            }
            
            breadcrumbList.appendChild(listItem);
        });

        // Add structured data
        const structuredData = this.generateStructuredData();
        breadcrumbContainer.appendChild(structuredData);
        breadcrumbContainer.appendChild(breadcrumbList);

        // Insert breadcrumbs at the beginning of main content
        const mainContent = document.querySelector('main') || document.querySelector('.container') || document.body;
        if (mainContent) {
            mainContent.insertBefore(breadcrumbContainer, mainContent.firstChild);
        }
    }

    generateStructuredData() {
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        
        const structuredData = {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": this.breadcrumbs.map((crumb, index) => ({
                "@type": "ListItem",
                "position": index + 1,
                "name": crumb.name,
                "item": `https://entrenoapp.com${crumb.url}`
            }))
        };
        
        script.textContent = JSON.stringify(structuredData);
        return script;
    }
}

// Auto-initialize breadcrumbs when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new Breadcrumbs();
});

// CSS for breadcrumbs
const breadcrumbStyles = `
.breadcrumbs {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border-radius: 12px;
    padding: 15px 20px;
    margin: 20px 0;
    border: 1px solid rgba(255, 255, 255, 0.2);
}

.breadcrumb-list {
    display: flex;
    align-items: center;
    list-style: none;
    margin: 0;
    padding: 0;
    flex-wrap: wrap;
    gap: 8px;
}

.breadcrumb-item {
    display: flex;
    align-items: center;
}

.breadcrumb-item:not(:last-child)::after {
    content: "›";
    margin: 0 8px;
    color: rgba(255, 255, 255, 0.6);
    font-weight: bold;
}

.breadcrumb-link {
    display: flex;
    align-items: center;
    gap: 6px;
    color: rgba(255, 255, 255, 0.8);
    text-decoration: none;
    padding: 6px 12px;
    border-radius: 8px;
    transition: all 0.3s ease;
    font-size: 0.9rem;
}

.breadcrumb-link:hover {
    background: rgba(255, 255, 255, 0.1);
    color: white;
    text-decoration: none;
}

.breadcrumb-current {
    display: flex;
    align-items: center;
    gap: 6px;
    color: white;
    font-weight: 600;
    padding: 6px 12px;
    font-size: 0.9rem;
}

.breadcrumb-icon {
    font-size: 1rem;
}

.breadcrumb-text {
    font-size: 0.9rem;
}

@media (max-width: 768px) {
    .breadcrumbs {
        padding: 12px 15px;
        margin: 15px 0;
    }
    
    .breadcrumb-list {
        gap: 6px;
    }
    
    .breadcrumb-item:not(:last-child)::after {
        margin: 0 6px;
    }
    
    .breadcrumb-link,
    .breadcrumb-current {
        padding: 4px 8px;
        font-size: 0.8rem;
    }
    
    .breadcrumb-icon {
        font-size: 0.9rem;
    }
}
`;

// Inject breadcrumb styles
const styleSheet = document.createElement('style');
styleSheet.textContent = breadcrumbStyles;
document.head.appendChild(styleSheet);
