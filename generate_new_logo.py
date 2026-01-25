#!/usr/bin/env python3
"""
Genera el nuevo logo EntrenoApp basado en la descripción:
- Escudo heráldico
- Microscopio azul oscuro (izquierda)
- Mancuerna roja (cruzando el microscopio)
- ADN (doble hélice azul)
- Texto "ENTRENOAPP"
- Fondo dividido diagonalmente
- Líneas orbitales
"""

from PIL import Image, ImageDraw, ImageFont
import os
import math

# Colores del nuevo logo
DARK_BLUE = (11, 20, 38)  # #0B1426
RED_VIBRANT = (255, 23, 68)  # #FF1744
WHITE = (255, 255, 255)
LIGHT_GRAY = (245, 245, 245)  # Fondo claro

def create_logo(size):
    """Crea el logo completo en el tamaño especificado"""
    img = Image.new('RGBA', (size, size), (255, 255, 255, 0))
    draw = ImageDraw.Draw(img)
    
    scale = size / 512
    
    # 1. Fondo dividido diagonalmente
    # Lado izquierdo: azul oscuro
    draw.polygon([
        (0, 0),
        (size * 0.6, 0),
        (size * 0.4, size),
        (0, size)
    ], fill=DARK_BLUE)
    
    # Lado derecho: blanco/gris claro
    draw.polygon([
        (size * 0.6, 0),
        (size, 0),
        (size, size),
        (size * 0.4, size)
    ], fill=LIGHT_GRAY)
    
    # 2. Líneas orbitales en el lado azul
    for i in range(3):
        y = int(size * (0.3 + i * 0.15))
        radius = int(size * (0.15 + i * 0.1))
        center_x = int(size * 0.3)
        center_y = int(size * 0.3)
        
        # Arco orbital
        bbox = [
            center_x - radius, center_y - radius,
            center_x + radius, center_y + radius
        ]
        draw.arc(bbox, start=0, end=180, fill=(79, 195, 247, 200), width=int(3 * scale))
    
    # 3. Microscopio (izquierda, azul oscuro)
    scope_x = int(size * 0.25)
    scope_y = int(size * 0.35)
    
    # Base del microscopio
    base_width = int(40 * scale)
    base_height = int(60 * scale)
    draw.ellipse([
        scope_x - base_width//2, scope_y - base_height//2,
        scope_x + base_width//2, scope_y + base_height//2
    ], fill=(25, 118, 210, 255))  # Azul más claro para visibilidad
    
    # Tubo del microscopio
    tube_width = int(15 * scale)
    tube_height = int(80 * scale)
    draw.rectangle([
        scope_x - tube_width//2, scope_y - base_height//2 - tube_height,
        scope_x + tube_width//2, scope_y - base_height//2
    ], fill=(25, 118, 210, 255))
    
    # Ocular (círculo superior)
    ocular_radius = int(20 * scale)
    draw.ellipse([
        scope_x - ocular_radius, scope_y - base_height//2 - tube_height - ocular_radius,
        scope_x + ocular_radius, scope_y - base_height//2 - tube_height + ocular_radius
    ], fill=(25, 118, 210, 255))
    
    # 4. Mancuerna roja (cruzando el microscopio)
    bar_x = int(size * 0.25)
    bar_y = int(size * 0.5)
    bar_length = int(size * 0.35)
    bar_width = int(12 * scale)
    
    # Barra de la mancuerna (diagonal)
    angle = -30
    bar_start_x = bar_x - bar_length//2
    bar_start_y = bar_y
    bar_end_x = bar_x + bar_length//2
    bar_end_y = bar_y
    
    # Rotar la barra
    bar_img = Image.new('RGBA', (bar_length, bar_width * 3), (0, 0, 0, 0))
    bar_draw = ImageDraw.Draw(bar_img)
    bar_draw.rectangle([
        0, bar_width,
        bar_length, bar_width * 2
    ], fill=RED_VIBRANT)
    
    # Placa superior agrietada
    plate_size = int(35 * scale)
    plate_x = bar_length - plate_size//2
    plate_y = bar_width
    bar_draw.ellipse([
        plate_x - plate_size//2, plate_y - plate_size//2,
        plate_x + plate_size//2, plate_y + plate_size//2
    ], fill=RED_VIBRANT, outline=WHITE, width=int(2 * scale))
    
    # Grieta en la placa
    bar_draw.line([
        plate_x - plate_size//4, plate_y - plate_size//4,
        plate_x + plate_size//4, plate_y + plate_size//4
    ], fill=DARK_BLUE, width=int(2 * scale))
    
    # Rotar y pegar la mancuerna
    bar_rotated = bar_img.rotate(angle, expand=True)
    paste_x = bar_x - bar_rotated.width//2
    paste_y = bar_y - bar_rotated.height//2
    img.paste(bar_rotated, (paste_x, paste_y), bar_rotated)
    
    # 5. ADN (doble hélice azul debajo)
    dna_y = int(size * 0.65)
    dna_height = int(size * 0.15)
    dna_width = int(size * 0.2)
    
    # Hélice izquierda
    for i in range(8):
        x = int(size * 0.2) + int(i * dna_width / 8)
        y = dna_y + int(math.sin(i * math.pi / 4) * dna_height / 2)
        radius = int(8 * scale)
        draw.ellipse([
            x - radius, y - radius,
            x + radius, y + radius
        ], fill=(25, 118, 210, 255))
    
    # Hélice derecha
    for i in range(8):
        x = int(size * 0.2) + int(i * dna_width / 8)
        y = dna_y + int(math.sin(i * math.pi / 4 + math.pi) * dna_height / 2)
        radius = int(8 * scale)
        draw.ellipse([
            x - radius, y - radius,
            x + radius, y + radius
        ], fill=(25, 118, 210, 255))
    
    # Conexiones entre hélices
    for i in range(7):
        x1 = int(size * 0.2) + int(i * dna_width / 8)
        y1 = dna_y + int(math.sin(i * math.pi / 4) * dna_height / 2)
        x2 = int(size * 0.2) + int((i + 1) * dna_width / 8)
        y2 = dna_y + int(math.sin((i + 1) * math.pi / 4 + math.pi) * dna_height / 2)
        draw.line([(x1, y1), (x2, y2)], fill=(25, 118, 210, 180), width=int(2 * scale))
    
    # 6. Texto "ENTRENOAPP"
    text_y = int(size * 0.8)
    
    # Intentar cargar fuente, si no está disponible usar default
    try:
        font_size = int(32 * scale)
        font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", font_size)
    except:
        try:
            font = ImageFont.truetype("/System/Library/Fonts/Arial.ttf", int(32 * scale))
        except:
            font = ImageFont.load_default()
    
    # "ENTRENO" en blanco con borde azul
    texto_entreno = "ENTRENO"
    text_x_entreno = int(size * 0.45)
    
    # Borde azul (dibujar varias veces para crear borde)
    for dx in [-2, -1, 0, 1, 2]:
        for dy in [-2, -1, 0, 1, 2]:
            if dx != 0 or dy != 0:
                draw.text((text_x_entreno + dx, text_y + dy), texto_entreno, 
                         fill=DARK_BLUE, font=font)
    
    # Texto blanco
    draw.text((text_x_entreno, text_y), texto_entreno, fill=WHITE, font=font)
    
    # "APP" en rojo con borde blanco
    texto_app = "APP"
    bbox_entreno = draw.textbbox((text_x_entreno, text_y), texto_entreno, font=font)
    text_x_app = bbox_entreno[2] + int(10 * scale)
    
    # Borde blanco
    for dx in [-2, -1, 0, 1, 2]:
        for dy in [-2, -1, 0, 1, 2]:
            if dx != 0 or dy != 0:
                draw.text((text_x_app + dx, text_y + dy), texto_app, 
                         fill=WHITE, font=font)
    
    # Texto rojo
    draw.text((text_x_app, text_y), texto_app, fill=RED_VIBRANT, font=font)
    
    # 7. Icono de libro con flechas (parte inferior)
    book_y = int(size * 0.92)
    book_x = int(size * 0.5)
    book_width = int(40 * scale)
    book_height = int(25 * scale)
    
    # Libro (rectángulo)
    draw.rectangle([
        book_x - book_width//2, book_y - book_height//2,
        book_x + book_width//2, book_y + book_height//2
    ], fill=(25, 118, 210, 255), outline=DARK_BLUE, width=int(2 * scale))
    
    # Líneas del libro (páginas)
    for i in range(3):
        line_y = book_y - book_height//2 + int((i + 1) * book_height / 4)
        draw.line([
            (book_x - book_width//2 + int(5 * scale), line_y),
            (book_x + book_width//2 - int(5 * scale), line_y)
        ], fill=DARK_BLUE, width=int(1 * scale))
    
    # Flechas hacia arriba
    arrow_size = int(8 * scale)
    arrow_x1 = book_x - book_width//2 - int(15 * scale)
    arrow_x2 = book_x + book_width//2 + int(15 * scale)
    
    # Flecha izquierda
    draw.polygon([
        (arrow_x1, book_y),
        (arrow_x1 - arrow_size//2, book_y - arrow_size),
        (arrow_x1 + arrow_size//2, book_y - arrow_size)
    ], fill=RED_VIBRANT)
    
    # Flecha derecha
    draw.polygon([
        (arrow_x2, book_y),
        (arrow_x2 - arrow_size//2, book_y - arrow_size),
        (arrow_x2 + arrow_size//2, book_y - arrow_size)
    ], fill=RED_VIBRANT)
    
    return img

def create_svg_logo():
    """Crea el logo en formato SVG"""
    svg_content = '''<?xml version="1.0" encoding="UTF-8"?>
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <!-- Fondo dividido diagonalmente -->
  <polygon points="0,0 307,0 205,512 0,512" fill="#0B1426"/>
  <polygon points="307,0 512,0 512,512 205,512" fill="#F5F5F5"/>
  
  <!-- Líneas orbitales -->
  <path d="M 100 150 Q 150 100 200 150" stroke="#4FC3F7" stroke-width="3" fill="none" opacity="0.8"/>
  <path d="M 80 200 Q 180 150 280 200" stroke="#4FC3F7" stroke-width="3" fill="none" opacity="0.8"/>
  <path d="M 60 250 Q 220 200 360 250" stroke="#4FC3F7" stroke-width="3" fill="none" opacity="0.8"/>
  
  <!-- Microscopio -->
  <ellipse cx="128" cy="180" rx="20" ry="30" fill="#1976D2"/>
  <rect x="121" y="120" width="15" height="60" fill="#1976D2"/>
  <circle cx="128" cy="100" r="10" fill="#1976D2"/>
  
  <!-- Mancuerna roja -->
  <g transform="rotate(-30 256 256)">
    <rect x="200" y="245" width="112" height="6" fill="#FF1744"/>
    <circle cx="310" cy="248" r="18" fill="#FF1744" stroke="#FFFFFF" stroke-width="2"/>
    <line x1="295" y1="235" x2="325" y2="261" stroke="#0B1426" stroke-width="2"/>
  </g>
  
  <!-- ADN (doble hélice) -->
  <g opacity="0.9">
    <!-- Hélice izquierda -->
    <circle cx="100" cy="330" r="4" fill="#1976D2"/>
    <circle cx="120" cy="315" r="4" fill="#1976D2"/>
    <circle cx="140" cy="330" r="4" fill="#1976D2"/>
    <circle cx="160" cy="315" r="4" fill="#1976D2"/>
    <circle cx="180" cy="330" r="4" fill="#1976D2"/>
    <circle cx="200" cy="315" r="4" fill="#1976D2"/>
    <circle cx="220" cy="330" r="4" fill="#1976D2"/>
    <circle cx="240" cy="315" r="4" fill="#1976D2"/>
    
    <!-- Hélice derecha -->
    <circle cx="100" cy="350" r="4" fill="#1976D2"/>
    <circle cx="120" cy="365" r="4" fill="#1976D2"/>
    <circle cx="140" cy="350" r="4" fill="#1976D2"/>
    <circle cx="160" cy="365" r="4" fill="#1976D2"/>
    <circle cx="180" cy="350" r="4" fill="#1976D2"/>
    <circle cx="200" cy="365" r="4" fill="#1976D2"/>
    <circle cx="220" cy="350" r="4" fill="#1976D2"/>
    <circle cx="240" cy="365" r="4" fill="#1976D2"/>
    
    <!-- Conexiones -->
    <line x1="100" y1="330" x2="120" y2="365" stroke="#1976D2" stroke-width="2" opacity="0.7"/>
    <line x1="120" y1="315" x2="140" y2="350" stroke="#1976D2" stroke-width="2" opacity="0.7"/>
    <line x1="140" y1="330" x2="160" y2="365" stroke="#1976D2" stroke-width="2" opacity="0.7"/>
    <line x1="160" y1="315" x2="180" y2="350" stroke="#1976D2" stroke-width="2" opacity="0.7"/>
  </g>
  
  <!-- Texto ENTRENOAPP -->
  <text x="230" y="410" font-family="Arial, sans-serif" font-size="32" font-weight="bold" fill="#FFFFFF">
    <tspan fill="#FFFFFF" stroke="#0B1426" stroke-width="1">ENTRENO</tspan>
    <tspan fill="#FF1744" stroke="#FFFFFF" stroke-width="1">APP</tspan>
  </text>
  
  <!-- Libro con flechas -->
  <rect x="236" y="470" width="40" height="25" fill="#1976D2" stroke="#0B1426" stroke-width="2"/>
  <line x1="246" y1="478" x2="270" y2="478" stroke="#0B1426" stroke-width="1"/>
  <line x1="246" y1="485" x2="270" y2="485" stroke="#0B1426" stroke-width="1"/>
  <line x1="246" y1="492" x2="270" y2="492" stroke="#0B1426" stroke-width="1"/>
  
  <!-- Flechas -->
  <polygon points="220,482 215,472 225,472" fill="#FF1744"/>
  <polygon points="292,482 287,472 297,472" fill="#FF1744"/>
</svg>'''
    
    return svg_content

def main():
    """Genera todos los archivos del logo"""
    os.makedirs('assets/icons', exist_ok=True)
    
    print("🎨 Generando nuevo logo EntrenoApp...\n")
    
    # Generar PNGs en diferentes tamaños
    sizes = [
        (192, 'icon-192x192.png'),
        (512, 'icon-512x512.png'),
        (180, 'apple-touch-icon.png'),
        (144, 'icon-144x144.png')
    ]
    
    for size, filename in sizes:
        print(f'📸 Creando {filename} ({size}x{size})...')
        logo = create_logo(size)
        logo.save(f'assets/icons/{filename}', 'PNG', optimize=True)
        print(f'   ✅ {filename} creado exitosamente')
    
    # Generar SVG
    print(f'\n📐 Creando icon.svg...')
    svg_content = create_svg_logo()
    with open('assets/icons/icon.svg', 'w', encoding='utf-8') as f:
        f.write(svg_content)
    print(f'   ✅ icon.svg creado exitosamente')
    
    # Copiar icon.svg a logo-custom.svg (mismo contenido)
    print(f'\n📐 Creando logo-custom.svg...')
    with open('assets/icons/logo-custom.svg', 'w', encoding='utf-8') as f:
        f.write(svg_content)
    print(f'   ✅ logo-custom.svg creado exitosamente')
    
    print('\n🎉 ¡Todos los archivos del logo han sido generados exitosamente!')
    print('\n📋 Archivos creados:')
    print('   - icon-192x192.png')
    print('   - icon-512x512.png')
    print('   - apple-touch-icon.png')
    print('   - icon-144x144.png')
    print('   - icon.svg')
    print('   - logo-custom.svg')
    print('\n✨ El logo está listo para usar en el sitio web!')

if __name__ == '__main__':
    main()
