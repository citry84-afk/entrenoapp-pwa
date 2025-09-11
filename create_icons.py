#!/usr/bin/env python3
import base64
import os

# Crear iconos PNG usando base64 (iconos simples pero funcionales)
# Estos son iconos placeholder que funcionarán para PWA

# Icono 192x192 (placeholder)
icon_192_data = '''iVBORw0KGgoAAAANSUhEUgAAAMAAAADACAYAAABS3GwHAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAALEgAACxIB0t1+/AAAABx0RVh0U29mdHdhcmUAQWRvYmUgRmlyZXdvcmtzIENTNui8sowAAAAWdEVYdENyZWF0aW9uIFRpbWUAMDgvMDEvMDfCqk4wAAAAJXRFWHRkYXRlOmNyZWF0ZQAyMDI0LTA5LTExVDA2OjIyOjU4KzAwOjAwJXh5LQAAACV0RVh0ZGF0ZTptb2RpZnkAMjAyNC0wOS0xMVQwNjoyMjo1OCswMDowMCV4eS0AAAAASUVORK5CYII='''

# Icono 512x512 (placeholder)
icon_512_data = '''iVBORw0KGgoAAAANSUhEUgAAAgAAAAIACAYAAAD0eNT6AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAALEgAACxIB0t1+/AAAABx0RVh0U29mdHdhcmUAQWRvYmUgRmlyZXdvcmtzIENTNui8sowAAAAWdEVYdENyZWF0aW9uIFRpbWUAMDgvMDEvMDfCqk4wAAAAJXRFWHRkYXRlOmNyZWF0ZQAyMDI0LTA5LTExVDA2OjIyOjU4KzAwOjAwJXh5LQAAACV0RVh0ZGF0ZTptb2RpZnkAMjAyNC0wOS0xMVQwNjoyMjo1OCswMDowMCV4eS0AAAAASUVORK5CYII='''

# Apple touch icon (placeholder)
apple_icon_data = '''iVBORw0KGgoAAAANSUhEUgAAALQAAAC0CAYAAAA9zQYyAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAALEgAACxIB0t1+/AAAABx0RVh0U29mdHdhcmUAQWRvYmUgRmlyZXdvcmtzIENTNui8sowAAAAWdEVYdENyZWF0aW9uIFRpbWUAMDgvMDEvMDfCqk4wAAAAJXRFWHRkYXRlOmNyZWF0ZQAyMDI0LTA5LTExVDA2OjIyOjU4KzAwOjAwJXh5LQAAACV0RVh0ZGF0ZTptb2RpZnkAMjAyNC0wOS0xMVQwNjoyMjo1OCswMDowMCV4eS0AAAAASUVORK5CYII='''

# Crear directorio si no existe
os.makedirs('assets/icons', exist_ok=True)

# Escribir iconos
with open('assets/icons/icon-192x192.png', 'wb') as f:
    f.write(base64.b64decode(icon_192_data))

with open('assets/icons/icon-512x512.png', 'wb') as f:
    f.write(base64.b64decode(icon_512_data))

with open('assets/icons/apple-touch-icon.png', 'wb') as f:
    f.write(base64.b64decode(apple_icon_data))

print('Iconos PNG creados exitosamente')
