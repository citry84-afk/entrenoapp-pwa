# Email de confirmación de EntrenoApp Plus

Plantillas preparadas:

- `netlify/identity-emails/confirmation.html`
- `netlify/identity-emails/confirmation.txt`

Uso recomendado:

1. Entra en Netlify.
2. Abre el sitio `entrenoapp`.
3. Ve a Identity / Emails o a la configuración equivalente de emails de Identity.
4. Edita el email de confirmación/invitación de usuario.
5. Usa esta ruta publicada:

`/identity-emails/confirmation.html`

También queda una copia de trabajo en `netlify/identity-emails/`.

Variable importante:

- `{{ .ConfirmationURL }}` es el enlace que Netlify sustituye por la URL real de confirmación.

Asunto recomendado:

`Confirma tu cuenta EntrenoApp Plus`

Preheader recomendado:

`Activa tu cuenta y desbloquea una experiencia premium, guiada y sin anuncios.`
