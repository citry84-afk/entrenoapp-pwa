#!/bin/bash

# Script para actualizar todas las URLs de netlify.app a dominio propio
# Uso: ./update-domain-urls.sh entrenoapp.com

if [ -z "$1" ]; then
    echo "❌ Error: Debes especificar el dominio"
    echo "Uso: ./update-domain-urls.sh entrenoapp.com"
    exit 1
fi

NEW_DOMAIN="$1"
OLD_DOMAIN="entrenoapp.netlify.app"

echo "🔄 Actualizando URLs de $OLD_DOMAIN a $NEW_DOMAIN..."

# Contar archivos que necesitan actualización
TOTAL_FILES=$(grep -r "entrenoapp\.netlify\.app" . --include="*.html" --include="*.xml" --include="*.js" --include="*.md" --include="*.txt" | wc -l)
echo "📊 Encontrados $TOTAL_FILES archivos para actualizar"

# Actualizar archivos HTML
echo "📝 Actualizando archivos HTML..."
find . -name "*.html" -exec sed -i '' "s/$OLD_DOMAIN/$NEW_DOMAIN/g" {} \;

# Actualizar sitemap.xml
echo "🗺️ Actualizando sitemap.xml..."
sed -i '' "s/$OLD_DOMAIN/$NEW_DOMAIN/g" sitemap.xml

# Actualizar robots.txt
echo "🤖 Actualizando robots.txt..."
sed -i '' "s/$OLD_DOMAIN/$NEW_DOMAIN/g" robots.txt

# Actualizar archivos JavaScript
echo "⚙️ Actualizando archivos JavaScript..."
find . -name "*.js" -exec sed -i '' "s/$OLD_DOMAIN/$NEW_DOMAIN/g" {} \;

# Actualizar archivos Markdown
echo "📄 Actualizando archivos Markdown..."
find . -name "*.md" -exec sed -i '' "s/$OLD_DOMAIN/$NEW_DOMAIN/g" {} \;

# Verificar cambios
UPDATED_FILES=$(grep -r "$NEW_DOMAIN" . --include="*.html" --include="*.xml" --include="*.js" --include="*.md" --include="*.txt" | wc -l)
echo "✅ Actualizados $UPDATED_FILES archivos"

echo "🎉 ¡Actualización completada!"
echo "📋 Próximos pasos:"
echo "1. git add ."
echo "2. git commit -m '🌐 Actualizado dominio a $NEW_DOMAIN'"
echo "3. git push origin main"
echo "4. Configurar DNS en Netlify"
echo "5. Esperar propagación (24-48h)"
echo "6. Reaplicar a AdSense"
