# EntrenoApp – App para iOS (Capacitor)

La misma web empaquetada como app nativa para iPhone/iPad. Muy fácil de usar: al abrir la app se va directo a la pantalla de entrenamiento (running, gym, retos, etc.).

## Requisitos

- **Mac** con Xcode instalado (App Store).
- **Cuenta de desarrollador Apple** (ya la tienes).
- Node.js (v18 o superior). Si no lo tienes: [nodejs.org](https://nodejs.org).

## Pasos para generar el proyecto iOS

Abre la **Terminal** y ve a la carpeta del proyecto (la que contiene `package.json` y `index.html`):

```bash
cd "/Users/papi/entrenoapp HTML"
```

1. **Instalar dependencias**

```bash
npm install
```

2. **Añadir la plataforma iOS** (solo la primera vez)

```bash
npx cap add ios
```

3. **Copiar la web al proyecto iOS y abrir Xcode**

```bash
npx cap sync ios
npx cap open ios
```

Si al hacer `cap sync ios` falla al final con un error de **CocoaPods** (Ruby/encoding), no pasa nada: los archivos ya se han copiado. Abre Xcode igual:

```bash
npx cap open ios
```

En Xcode, si pide instalar pods, acepta. O en la Terminal, desde la carpeta del proyecto:

```bash
export LANG=en_US.UTF-8
cd ios/App && pod install && cd ../..
```

Luego **Product** → **Run** (▶️). Elige un simulador (ej. iPhone 15) o tu iPhone conectado.

## Comportamiento de la app

- Al abrir la app se carga **index.html**; si detecta que está en iOS (Capacitor), redirige automáticamente a **app.html** (pantalla de entrenamiento).
- Misma experiencia que la web: planes de running, gym, calculadoras, retos, etc.
- Funciona offline con el contenido ya cargado (PWA/service worker si lo tienes activo).

## Publicar en App Store

1. En Xcode: selecciona el proyecto **App** en el panel izquierdo.
2. Pestaña **Signing & Capabilities**: elige tu **Team** (cuenta de desarrollador) y deja que Xcode gestione el certificado.
3. Menú **Product** → **Archive**.
4. Cuando termine, se abrirá el **Organizer**. Selecciona el archive y pulsa **Distribute App**.
5. Elige **App Store Connect** → **Upload** y sigue los pasos.
6. En [App Store Connect](https://appstoreconnect.apple.com) crea la ficha de la app (nombre **EntrenoApp**, descripción, capturas, etc.) y envía a revisión.

## Actualizar la app cuando cambies la web

Cada vez que modifiques HTML, CSS o JS de la web:

```bash
npx cap sync ios
```

Luego en Xcode: **Product** → **Archive** y vuelve a subir si quieres publicar una nueva versión.

## Identificador de la app (Bundle ID)

En `capacitor.config.json` está configurado como:

- **appId:** `com.lipastudios.entrenoapp`

Si quieres otro (por ejemplo `com.tudominio.entrenoapp`), cámbialo en `capacitor.config.json` y luego en Xcode (target **App** → **General** → **Bundle Identifier**), y vuelve a hacer **Signing** y **Archive**.

---

¿Dudas? Revisa la [documentación de Capacitor](https://capacitorjs.com/docs).
