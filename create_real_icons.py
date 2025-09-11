#!/usr/bin/env python3
from PIL import Image, ImageDraw, ImageFilter
import os

def create_gradient_background(width, height):
    """Crear fondo con gradiente"""
    img = Image.new('RGBA', (width, height), (13, 20, 33, 255))  # #0D1421
    return img

def create_icon(size):
    """Crear icono con el diseño personalizado"""
    img = create_gradient_background(size, size)
    draw = ImageDraw.Draw(img)
    
    # Calcular escalas basadas en el tamaño
    scale = size / 512
    
    # Colores del gradiente
    blue_start = (79, 195, 247, 255)  # #4FC3F7
    blue_end = (25, 118, 210, 255)    # #1976D2
    
    # Speed lines
    line_width = int(8 * scale)
    line_height = int(8 * scale)
    
    # Línea 1
    draw.rectangle([
        int(80 * scale), int(200 * scale),
        int(140 * scale), int(208 * scale)
    ], fill=blue_start)
    
    # Línea 2
    draw.rectangle([
        int(80 * scale), int(220 * scale),
        int(160 * scale), int(228 * scale)
    ], fill=blue_start)
    
    # Línea 3
    draw.rectangle([
        int(80 * scale), int(240 * scale),
        int(180 * scale), int(248 * scale)
    ], fill=blue_start)
    
    # Kettlebell handle (círculo)
    kettlebell_center_x = int(320 * scale)
    kettlebell_center_y = int(120 * scale)
    kettlebell_radius = int(40 * scale)
    
    # Círculo exterior (kettlebell)
    draw.ellipse([
        kettlebell_center_x - kettlebell_radius,
        kettlebell_center_y - kettlebell_radius,
        kettlebell_center_x + kettlebell_radius,
        kettlebell_center_y + kettlebell_radius
    ], fill=blue_end)
    
    # Círculo interior (agujero)
    inner_radius = int(15 * scale)
    draw.ellipse([
        kettlebell_center_x - inner_radius,
        kettlebell_center_y - inner_radius,
        kettlebell_center_x + inner_radius,
        kettlebell_center_y + inner_radius
    ], fill=(13, 20, 33, 255))
    
    # Body (torso)
    body_x = int(320 * scale)
    body_y = int(200 * scale)
    body_width = int(25 * scale)
    body_height = int(60 * scale)
    
    draw.ellipse([
        body_x - body_width, body_y - body_height,
        body_x + body_width, body_y + body_height
    ], fill=blue_end)
    
    # Left arm (forward)
    arm_x = int(280 * scale)
    arm_y = int(180 * scale)
    arm_width = int(15 * scale)
    arm_height = int(40 * scale)
    
    # Rotar el brazo izquierdo
    left_arm = Image.new('RGBA', (arm_width * 2, arm_height * 2), (0, 0, 0, 0))
    left_arm_draw = ImageDraw.Draw(left_arm)
    left_arm_draw.ellipse([
        arm_width - arm_width//2, arm_height - arm_height//2,
        arm_width + arm_width//2, arm_height + arm_height//2
    ], fill=blue_end)
    
    # Rotar y pegar el brazo izquierdo
    left_arm_rotated = left_arm.rotate(-20, expand=True)
    img.paste(left_arm_rotated, (arm_x - left_arm_rotated.width//2, arm_y - left_arm_rotated.height//2), left_arm_rotated)
    
    # Right arm (back)
    arm_x = int(360 * scale)
    arm_y = int(190 * scale)
    
    right_arm = Image.new('RGBA', (arm_width * 2, arm_height * 2), (0, 0, 0, 0))
    right_arm_draw = ImageDraw.Draw(right_arm)
    right_arm_draw.ellipse([
        arm_width - arm_width//2, arm_height - arm_height//2,
        arm_width + arm_width//2, arm_height + arm_height//2
    ], fill=blue_end)
    
    # Rotar y pegar el brazo derecho
    right_arm_rotated = right_arm.rotate(20, expand=True)
    img.paste(right_arm_rotated, (arm_x - right_arm_rotated.width//2, arm_y - right_arm_rotated.height//2), right_arm_rotated)
    
    # Left leg (forward)
    leg_x = int(300 * scale)
    leg_y = int(280 * scale)
    leg_width = int(20 * scale)
    leg_height = int(60 * scale)
    
    left_leg = Image.new('RGBA', (leg_width * 2, leg_height * 2), (0, 0, 0, 0))
    left_leg_draw = ImageDraw.Draw(left_leg)
    left_leg_draw.ellipse([
        leg_width - leg_width//2, leg_height - leg_height//2,
        leg_width + leg_width//2, leg_height + leg_height//2
    ], fill=blue_end)
    
    # Rotar y pegar la pierna izquierda
    left_leg_rotated = left_leg.rotate(-15, expand=True)
    img.paste(left_leg_rotated, (leg_x - left_leg_rotated.width//2, leg_y - left_leg_rotated.height//2), left_leg_rotated)
    
    # Right leg (back)
    leg_x = int(340 * scale)
    leg_y = int(290 * scale)
    
    right_leg = Image.new('RGBA', (leg_width * 2, leg_height * 2), (0, 0, 0, 0))
    right_leg_draw = ImageDraw.Draw(right_leg)
    right_leg_draw.ellipse([
        leg_width - leg_width//2, leg_height - leg_height//2,
        leg_width + leg_width//2, leg_height + leg_height//2
    ], fill=blue_end)
    
    # Rotar y pegar la pierna derecha
    right_leg_rotated = right_leg.rotate(15, expand=True)
    img.paste(right_leg_rotated, (leg_x - right_leg_rotated.width//2, leg_y - right_leg_rotated.height//2), right_leg_rotated)
    
    # Left foot
    foot_x = int(280 * scale)
    foot_y = int(340 * scale)
    foot_width = int(25 * scale)
    foot_height = int(15 * scale)
    
    draw.ellipse([
        foot_x - foot_width, foot_y - foot_height,
        foot_x + foot_width, foot_y + foot_height
    ], fill=blue_end)
    
    # Right foot
    foot_x = int(360 * scale)
    foot_y = int(350 * scale)
    
    draw.ellipse([
        foot_x - foot_width, foot_y - foot_height,
        foot_x + foot_width, foot_y + foot_height
    ], fill=blue_end)
    
    return img

def main():
    # Crear directorio si no existe
    os.makedirs('assets/icons', exist_ok=True)
    
    # Crear iconos en diferentes tamaños
    sizes = [
        (192, 'icon-192x192.png'),
        (512, 'icon-512x512.png'),
        (180, 'apple-touch-icon.png')
    ]
    
    for size, filename in sizes:
        print(f'Creando {filename} ({size}x{size})...')
        icon = create_icon(size)
        icon.save(f'assets/icons/{filename}', 'PNG')
        print(f'✅ {filename} creado exitosamente')
    
    print('\n🎉 Todos los iconos PNG creados exitosamente!')

if __name__ == '__main__':
    main()
