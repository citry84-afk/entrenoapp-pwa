#!/bin/bash

# Script de restauración para EntrenoApp
# Uso: ./restore-backup.sh

echo "🔄 Iniciando restauración de EntrenoApp..."

# Verificar si estamos en el directorio correcto
if [ ! -f "index.html" ]; then
    echo "❌ Error: No estás en el directorio correcto de EntrenoApp"
    echo "Por favor, ejecuta este script desde el directorio 'entrenoapp HTML'"
    exit 1
fi

# Mostrar opciones de restauración
echo ""
echo "📋 Opciones de restauración:"
echo "1) Restaurar desde tag Git (v1.0-monetization-complete)"
echo "2) Restaurar desde copia local"
echo "3) Ver estado actual"
echo "4) Salir"
echo ""

read -p "Selecciona una opción (1-4): " option

case $option in
    1)
        echo "🔄 Restaurando desde tag Git..."
        git fetch --tags
        git checkout v1.0-monetization-complete
        git push origin main --force
        echo "✅ Restauración desde Git completada"
        ;;
    2)
        echo "🔄 Restaurando desde copia local..."
        BACKUP_DIR="../entrenoapp-backup-20250921-122447"
        if [ -d "$BACKUP_DIR" ]; then
            echo "⚠️  ADVERTENCIA: Esto sobrescribirá todos los archivos actuales"
            read -p "¿Estás seguro? (y/N): " confirm
            if [[ $confirm == [yY] || $confirm == [yY][eE][sS] ]]; then
                cp -r "$BACKUP_DIR"/* .
                git add .
                git commit -m "Restaurar versión estable v1.0 desde backup local"
                git push origin main
                echo "✅ Restauración desde backup local completada"
            else
                echo "❌ Restauración cancelada"
            fi
        else
            echo "❌ No se encontró la copia de seguridad local"
        fi
        ;;
    3)
        echo "📊 Estado actual del repositorio:"
        echo ""
        echo "📍 Rama actual:"
        git branch --show-current
        echo ""
        echo "📅 Últimos commits:"
        git log --oneline -5
        echo ""
        echo "🏷️  Tags disponibles:"
        git tag -l
        echo ""
        echo "📁 Archivos modificados:"
        git status --porcelain
        ;;
    4)
        echo "👋 Saliendo..."
        exit 0
        ;;
    *)
        echo "❌ Opción inválida"
        exit 1
        ;;
esac

echo ""
echo "🚀 Para hacer deploy de la versión restaurada:"
echo "   netlify deploy --prod"
echo ""
echo "🌐 Tu sitio estará disponible en:"
echo "   https://entrenoapp.netlify.app"
