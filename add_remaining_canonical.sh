#!/bin/bash

BASE_URL="https://entrenoapp.com"

# Archivos importantes que faltan
declare -A FILES=(
    ["contact.html"]="<meta name=\"google-site-verification\""
    ["terms.html"]="<meta name=\"google-site-verification\""
    ["lipa-studios-network.html"]="twitter:image"
    ["relojes-fitness-smartwatch.html"]="twitter:image"
    ["ropa-deportiva-amazon.html"]="twitter:image"
    ["equipamiento-fitness-casa.html"]="twitter:image"
    ["almohadas-mejorar-sueno-2025.html"]="twitter:image"
    ["proteinas-vegetales-2025.html"]="twitter:image"
    ["pesas-equipamiento-casa-2025.html"]="twitter:image"
    ["libros-nutricion-deportiva-2025.html"]="twitter:image"
    ["esterillas-yoga-2025.html"]="twitter:image"
    ["batidoras-proteina-2025.html"]="twitter:image"
)

for file in "${!FILES[@]}"; do
    if [ -f "$file" ] && ! grep -q 'rel="canonical"' "$file"; then
        marker="${FILES[$file]}"
        if grep -q "$marker" "$file"; then
            if [[ "$marker" == "twitter:image" ]]; then
                sed -i '' "/$marker/a\\
    \\
    <!-- Canonical URL -->\\
    <link rel=\"canonical\" href=\"${BASE_URL}/${file}\">\\
" "$file"
            else
                sed -i '' "/$marker/a\\
    <!-- Canonical URL -->\\
    <link rel=\"canonical\" href=\"${BASE_URL}/${file}\">\\
    \\
" "$file"
            fi
            echo "✅ Añadido canonical a $file"
        else
            # Buscar otro marcador o añadir al principio del head
            if grep -q '<link rel="stylesheet"' "$file"; then
                sed -i '' "/<link rel=\"stylesheet\"/i\\
    <!-- Canonical URL -->\\
    <link rel=\"canonical\" href=\"${BASE_URL}/${file}\">\\
    \\
" "$file"
                echo "✅ Añadido canonical a $file (después de meta tags)"
            fi
        fi
    fi
done
