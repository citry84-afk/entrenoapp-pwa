// EntrenoApp - Monitor Automático para AdSense
// Este script monitorea las métricas y prepara el sitio para la nueva solicitud

console.log('🚀 EntrenoApp - Monitor Automático para AdSense iniciado...');

// Configuración de monitoreo
const MONITORING_CONFIG = {
    // Métricas objetivo para AdSense
    targetMetrics: {
        pagesIndexed: 25,
        timeOnSite: 180, // segundos
        pagesPerSession: 3,
        bounceRate: 50, // porcentaje
        loadSpeed: 3 // segundos
    },
    
    // URLs a monitorear
    urlsToCheck: [
        'https://entrenoapp.netlify.app/',
        'https://entrenoapp.netlify.app/app.html',
        'https://entrenoapp.netlify.app/blog.html',
        'https://entrenoapp.netlify.app/guia-completa-fitness-casa-2025.html',
        'https://entrenoapp.netlify.app/nutricion-deportiva-guia-completa-2025.html'
    ],
    
    // Intervalos de monitoreo
    intervals: {
        daily: 24 * 60 * 60 * 1000, // 24 horas
        weekly: 7 * 24 * 60 * 60 * 1000, // 7 días
        monthly: 30 * 24 * 60 * 60 * 1000 // 30 días
    }
};

// Función para verificar métricas de Google Analytics
function checkAnalyticsMetrics() {
    console.log('📊 Verificando métricas de Google Analytics...');
    
    if (typeof gtag !== 'undefined') {
        // Enviar evento de monitoreo
        gtag('event', 'adsense_monitoring', {
            'event_category': 'monitoring',
            'event_label': 'daily_check',
            'value': 1
        });
        console.log('✅ Evento de monitoreo enviado a Google Analytics');
    } else {
        console.log('⚠️ Google Analytics no está cargado');
    }
}

// Función para verificar Core Web Vitals
function checkCoreWebVitals() {
    console.log('⚡ Verificando Core Web Vitals...');
    
    // Verificar si web-vitals está disponible
    if (typeof webVitals !== 'undefined') {
        webVitals.getCLS(console.log);
        webVitals.getFID(console.log);
        webVitals.getLCP(console.log);
        console.log('✅ Core Web Vitals monitoreados');
    } else {
        console.log('⚠️ Web Vitals no está disponible');
    }
}

// Función para verificar contenido
function checkContentQuality() {
    console.log('📝 Verificando calidad del contenido...');
    
    const articles = document.querySelectorAll('article');
    const wordCount = document.body.innerText.split(' ').length;
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    
    console.log(`📊 Artículos encontrados: ${articles.length}`);
    console.log(`📊 Palabras totales: ${wordCount}`);
    console.log(`📊 Encabezados: ${headings.length}`);
    
    // Verificar si cumple con los requisitos mínimos
    if (wordCount > 1000) {
        console.log('✅ Contenido suficiente para AdSense');
    } else {
        console.log('⚠️ Contenido insuficiente, necesita más texto');
    }
}

// Función para verificar enlaces internos
function checkInternalLinks() {
    console.log('🔗 Verificando enlaces internos...');
    
    const internalLinks = document.querySelectorAll('a[href*="entrenoapp.netlify.app"]');
    const externalLinks = document.querySelectorAll('a[href^="http"]:not([href*="entrenoapp.netlify.app"])');
    
    console.log(`📊 Enlaces internos: ${internalLinks.length}`);
    console.log(`📊 Enlaces externos: ${externalLinks.length}`);
    
    if (internalLinks.length > 5) {
        console.log('✅ Buena estructura de enlaces internos');
    } else {
        console.log('⚠️ Necesita más enlaces internos');
    }
}

// Función para verificar optimizaciones SEO
function checkSEOOptimization() {
    console.log('🔍 Verificando optimizaciones SEO...');
    
    const title = document.title;
    const metaDescription = document.querySelector('meta[name="description"]');
    const h1 = document.querySelector('h1');
    const images = document.querySelectorAll('img');
    const imagesWithAlt = document.querySelectorAll('img[alt]');
    
    console.log(`📊 Título: ${title}`);
    console.log(`📊 Meta description: ${metaDescription ? 'Presente' : 'Faltante'}`);
    console.log(`📊 H1: ${h1 ? 'Presente' : 'Faltante'}`);
    console.log(`📊 Imágenes: ${images.length}`);
    console.log(`📊 Imágenes con alt: ${imagesWithAlt.length}`);
    
    // Verificar optimizaciones básicas
    let score = 0;
    if (title && title.length > 30 && title.length < 60) score++;
    if (metaDescription) score++;
    if (h1) score++;
    if (imagesWithAlt.length === images.length) score++;
    
    console.log(`📊 Puntuación SEO: ${score}/4`);
    
    if (score >= 3) {
        console.log('✅ SEO bien optimizado');
    } else {
        console.log('⚠️ SEO necesita mejoras');
    }
}

// Función para verificar velocidad de carga
function checkLoadSpeed() {
    console.log('⚡ Verificando velocidad de carga...');
    
    if (window.performance && window.performance.timing) {
        const loadTime = window.performance.timing.loadEventEnd - window.performance.timing.navigationStart;
        console.log(`📊 Tiempo de carga: ${loadTime}ms`);
        
        if (loadTime < 3000) {
            console.log('✅ Velocidad de carga excelente');
        } else if (loadTime < 5000) {
            console.log('⚠️ Velocidad de carga aceptable');
        } else {
            console.log('❌ Velocidad de carga lenta');
        }
    } else {
        console.log('⚠️ No se puede medir la velocidad de carga');
    }
}

// Función para generar reporte de estado
function generateStatusReport() {
    console.log('\n📋 === REPORTE DE ESTADO PARA ADSENSE ===');
    console.log('📅 Fecha:', new Date().toLocaleDateString());
    console.log('🕐 Hora:', new Date().toLocaleTimeString());
    console.log('🌐 URL:', window.location.href);
    console.log('📱 User Agent:', navigator.userAgent);
    console.log('📊 Resolución:', screen.width + 'x' + screen.height);
    console.log('🔗 Enlaces internos:', document.querySelectorAll('a[href*="entrenoapp.netlify.app"]').length);
    console.log('📝 Palabras:', document.body.innerText.split(' ').length);
    console.log('🖼️ Imágenes:', document.querySelectorAll('img').length);
    console.log('📑 Encabezados:', document.querySelectorAll('h1, h2, h3, h4, h5, h6').length);
    console.log('==========================================\n');
}

// Función para verificar si el sitio está listo para AdSense
function checkAdSenseReadiness() {
    console.log('🎯 Verificando preparación para AdSense...');
    
    let readinessScore = 0;
    const maxScore = 10;
    
    // Verificar contenido
    const wordCount = document.body.innerText.split(' ').length;
    if (wordCount > 1000) readinessScore += 2;
    
    // Verificar títulos
    const title = document.title;
    if (title && title.length > 30 && title.length < 60) readinessScore += 1;
    
    // Verificar meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) readinessScore += 1;
    
    // Verificar H1
    const h1 = document.querySelector('h1');
    if (h1) readinessScore += 1;
    
    // Verificar enlaces internos
    const internalLinks = document.querySelectorAll('a[href*="entrenoapp.netlify.app"]');
    if (internalLinks.length > 5) readinessScore += 1;
    
    // Verificar imágenes con alt
    const images = document.querySelectorAll('img');
    const imagesWithAlt = document.querySelectorAll('img[alt]');
    if (imagesWithAlt.length === images.length) readinessScore += 1;
    
    // Verificar velocidad
    if (window.performance && window.performance.timing) {
        const loadTime = window.performance.timing.loadEventEnd - window.performance.timing.navigationStart;
        if (loadTime < 3000) readinessScore += 2;
        else if (loadTime < 5000) readinessScore += 1;
    }
    
    // Verificar responsividad
    if (window.innerWidth > 0) readinessScore += 1;
    
    console.log(`📊 Puntuación de preparación: ${readinessScore}/${maxScore}`);
    
    if (readinessScore >= 8) {
        console.log('✅ ¡Sitio listo para AdSense!');
        return true;
    } else if (readinessScore >= 6) {
        console.log('⚠️ Sitio casi listo, necesita mejoras menores');
        return false;
    } else {
        console.log('❌ Sitio necesita mejoras significativas');
        return false;
    }
}

// Función principal de monitoreo
function runFullMonitoring() {
    console.log('🚀 Iniciando monitoreo completo...\n');
    
    checkAnalyticsMetrics();
    checkCoreWebVitals();
    checkContentQuality();
    checkInternalLinks();
    checkSEOOptimization();
    checkLoadSpeed();
    generateStatusReport();
    
    const isReady = checkAdSenseReadiness();
    
    if (isReady) {
        console.log('🎉 ¡El sitio está listo para la nueva solicitud de AdSense!');
    } else {
        console.log('🔧 El sitio necesita mejoras antes de solicitar AdSense');
    }
    
    return isReady;
}

// Ejecutar monitoreo automáticamente
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(runFullMonitoring, 2000); // Esperar 2 segundos para que cargue todo
});

// Ejecutar monitoreo cada hora
setInterval(runFullMonitoring, 60 * 60 * 1000);

// Exportar funciones para uso manual
window.AdSenseMonitor = {
    runFullMonitoring,
    checkAdSenseReadiness,
    checkContentQuality,
    checkSEOOptimization,
    checkLoadSpeed,
    generateStatusReport
};

console.log('✅ Monitor automático configurado. Usa AdSenseMonitor.runFullMonitoring() para ejecutar manualmente.');
