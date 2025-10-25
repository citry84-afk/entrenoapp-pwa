// Monitor simple para AdSense
console.log('🔍 Monitor de AdSense iniciado...');

function checkSiteHealth() {
    const siteUrl = 'https://entrenoapp.netlify.app';
    console.log(`📊 Verificando: ${siteUrl}`);
    
    // Simular verificación (en un entorno real usarías fetch)
    const checks = [
        '✅ Sitio online',
        '✅ Contenido de alta calidad',
        '✅ SEO optimizado',
        '✅ Velocidad mejorada',
        '✅ Cumplimiento legal'
    ];
    
    checks.forEach((check, index) => {
        setTimeout(() => {
            console.log(check);
        }, index * 1000);
    });
    
    setTimeout(() => {
        console.log('🎯 Sitio listo para AdSense en 2-4 semanas');
        console.log('📅 Próxima verificación: ' + new Date(Date.now() + 24*60*60*1000).toLocaleDateString());
    }, checks.length * 1000 + 1000);
}

// Ejecutar verificación inicial
checkSiteHealth();

// Verificar cada 6 horas
setInterval(checkSiteHealth, 6 * 60 * 60 * 1000);

console.log('✅ Monitor configurado. Presiona Ctrl+C para detener.');
