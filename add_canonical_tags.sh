#!/bin/bash

# Script para añadir etiquetas canonical a todos los archivos HTML

BASE_URL="https://entrenoapp.com"

# Lista de archivos HTML (excluyendo los ya procesados: index.html, home.html, app.html)
HTML_FILES=(
    "about.html"
    "blog.html"
    "contact.html"
    "faq.html"
    "fitness-calculators.html"
    "fitness-tips.html"
    "news.html"
    "pricing.html"
    "privacy.html"
    "resources.html"
    "terms.html"
    "testimonials.html"
    "workout-guides.html"
    "exercises-library.html"
    "nutricion-corredores.html"
    "empezar-correr-guia-completa.html"
    "suplementos-recomendados.html"
    "suplementos-para-perder-grasa.html"
    "relojes-fitness-smartwatch.html"
    "ropa-deportiva-amazon.html"
    "equipamiento-fitness-casa.html"
    "guia-completa-fitness-casa-2025.html"
    "youtube-gallery.html"
    "lipa-studios-network.html"
    "gamificacion-fitness-gaming.html"
    "almohadas-mejorar-sueno-2025.html"
    "cortisol-face-suplementos-2025.html"
    "75-hard-challenge-suplementos-2025.html"
    "proteina-cuanta-realmente-necesitas-2025.html"
    "proteinas-vegetales-2025.html"
    "gym-anxiety-guia-completa-2025.html"
    "sleep-hacking-recuperacion-fitness-2025.html"
    "pesas-equipamiento-casa-2025.html"
    "libros-nutricion-deportiva-2025.html"
    "nutricion-deportiva-guia-completa-2025.html"
    "esterillas-yoga-2025.html"
    "batidoras-proteina-2025.html"
)

for file in "${HTML_FILES[@]}"; do
    if [ -f "$file" ]; then
        # Verificar si ya tiene canonical
        if ! grep -q 'rel="canonical"' "$file"; then
            # Buscar donde insertar (después de twitter:image o antes de Iconos)
            if grep -q 'twitter:image' "$file"; then
                # Insertar después de twitter:image
                sed -i '' "/twitter:image/a\\
    \\
    <!-- Canonical URL -->\\
    <link rel=\"canonical\" href=\"${BASE_URL}/${file}\">\\
" "$file"
            elif grep -q '<!-- Iconos' "$file"; then
                # Insertar antes de Iconos
                sed -i '' "/<!-- Iconos/i\\
    <!-- Canonical URL -->\\
    <link rel=\"canonical\" href=\"${BASE_URL}/${file}\">\\
    \\
" "$file"
            elif grep -q 'og:image' "$file"; then
                # Insertar después de og:image
                sed -i '' "/og:image/a\\
    \\
    <!-- Canonical URL -->\\
    <link rel=\"canonical\" href=\"${BASE_URL}/${file}\">\\
" "$file"
            else
                # Insertar antes de los estilos o scripts
                sed -i '' "/<!-- Estilos/i\\
    <!-- Canonical URL -->\\
    <link rel=\"canonical\" href=\"${BASE_URL}/${file}\">\\
    \\
" "$file"
            fi
            echo "✅ Añadido canonical a $file"
        else
            echo "⏭️  $file ya tiene canonical"
        fi
    else
        echo "⚠️  $file no existe"
    fi
done

echo ""
echo "✅ Proceso completado!"

