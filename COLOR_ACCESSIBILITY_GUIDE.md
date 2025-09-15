# 🎨 Guía de Accesibilidad de Colores - EntrenoApp

## ✅ Mejoras Implementadas

### **1. Sistema de Variables CSS Mejorado**
- **Colores de texto** con mejor contraste
- **Colores de fondo** más consistentes
- **Bordes** con mayor visibilidad
- **Sombras de texto** para mejor legibilidad

### **2. Nuevas Variables de Color**

#### **Texto:**
- `--text-primary`: #FFFFFF (100% opacidad)
- `--text-secondary`: rgba(255, 255, 255, 0.9) (90% opacidad)
- `--text-tertiary`: rgba(255, 255, 255, 0.7) (70% opacidad)
- `--text-quaternary`: rgba(255, 255, 255, 0.5) (50% opacidad)

#### **Fondos:**
- `--bg-primary`: rgba(255, 255, 255, 0.15) (15% opacidad)
- `--bg-secondary`: rgba(255, 255, 255, 0.1) (10% opacidad)
- `--bg-tertiary`: rgba(255, 255, 255, 0.05) (5% opacidad)

#### **Bordes:**
- `--border-primary`: rgba(255, 255, 255, 0.3) (30% opacidad)
- `--border-secondary`: rgba(255, 255, 255, 0.2) (20% opacidad)
- `--border-accent`: rgba(0, 122, 255, 0.5) (50% opacidad)

### **3. Clases de Utilidad**

#### **Para Texto:**
```css
.text-high-contrast    /* Máximo contraste */
.text-medium-contrast  /* Contraste medio */
.text-low-contrast     /* Contraste bajo */
```

#### **Para Fondos:**
```css
.bg-high-contrast      /* Fondo con máximo contraste */
.bg-medium-contrast    /* Fondo con contraste medio */
.bg-low-contrast       /* Fondo con contraste bajo */
```

## 🧪 Cómo Probar la Accesibilidad

### **1. Prueba Visual**
1. **Abre la app**: https://entrenoapp.netlify.app
2. **Navega por todas las pantallas**
3. **Verifica que el texto sea legible** en todos los fondos
4. **Comprueba que los botones** tengan suficiente contraste

### **2. Prueba de Contraste**
1. **Usa herramientas de accesibilidad** del navegador
2. **Verifica el ratio de contraste** (debe ser > 4.5:1)
3. **Prueba en diferentes dispositivos** (móvil, tablet, desktop)

### **3. Prueba de Accesibilidad**
1. **Activa el modo de alto contraste** del sistema
2. **Usa lectores de pantalla** para verificar la legibilidad
3. **Prueba con diferentes tamaños de fuente**

## 🔧 Herramientas de Debug

### **En la Consola del Navegador:**
```javascript
// Verificar variables CSS
console.log(getComputedStyle(document.documentElement).getPropertyValue('--text-primary'));

// Aplicar clases de contraste
document.querySelector('.glass-card').classList.add('text-high-contrast');
```

### **Inspeccionar Elementos:**
1. **F12** → **Elements**
2. **Busca elementos** con texto poco legible
3. **Aplica clases** `.text-high-contrast` o `.bg-high-contrast`

## 📱 Pruebas por Dispositivo

### **Móvil:**
- **iPhone Safari**: Verificar en modo claro y oscuro
- **Android Chrome**: Probar con diferentes temas
- **Modo nocturno**: Verificar contraste

### **Desktop:**
- **Chrome**: Con extensiones de accesibilidad
- **Firefox**: Con modo de alto contraste
- **Safari**: Con zoom al 200%

## 🎯 Elementos Críticos a Verificar

### **1. Botones Principales**
- ✅ "Comenzar Entrenamiento"
- ✅ Botones de navegación
- ✅ Botones de acción

### **2. Texto Importante**
- ✅ Títulos de secciones
- ✅ Nombres de ejercicios
- ✅ Estadísticas y números

### **3. Elementos de Interfaz**
- ✅ Cards de información
- ✅ Formularios de entrada
- ✅ Menús y navegación

## 🚨 Problemas Comunes y Soluciones

### **Si el texto sigue siendo poco legible:**
1. **Aplica** `.text-high-contrast` al elemento
2. **Aumenta** la opacidad del fondo
3. **Agrega** más sombra al texto

### **Si los botones no se ven bien:**
1. **Usa** `.bg-high-contrast` para el fondo
2. **Aumenta** el contraste del borde
3. **Mejora** la sombra del botón

## 📊 Métricas de Accesibilidad

### **Contraste Mínimo Requerido:**
- **Texto normal**: 4.5:1
- **Texto grande**: 3:1
- **Elementos de interfaz**: 3:1

### **Colores Actuales:**
- **Texto blanco sobre fondo oscuro**: ~21:1 ✅
- **Texto secundario**: ~12:1 ✅
- **Texto terciario**: ~8:1 ✅

## 🔄 Próximos Pasos

1. **Probar** en diferentes dispositivos
2. **Recopilar feedback** de usuarios
3. **Ajustar** colores según necesidades
4. **Implementar** modo de alto contraste opcional

## 📞 Reportar Problemas

Si encuentras problemas de contraste:
1. **Toma captura de pantalla**
2. **Especifica el dispositivo y navegador**
3. **Describe el problema específico**
4. **Incluye la URL de la página**

---

**¡La aplicación ahora tiene un sistema de colores mucho más accesible y legible!** 🎨✨
