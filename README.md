# mediplan-web

Web de MediPlan (Next.js 16, App Router, TypeScript, CSS Modules): la landing pública (desde el diseño de Figma
`Lean - Proyecto UNI`, frames WEB 1920 / TABLET 768 / MOBILE 360) y el panel de la app (acceso, inicio, planes,
cuidadores, historial, notificaciones y perfil), con el mismo lenguaje visual que la landing.

## Correr

La web necesita la API (`mediplan-api`) y Postgres corriendo; ver el README de la API.

```bash
npm install
cp .env.example .env.local   # completar las variables de Firebase
npm run dev                  # http://localhost:3000
npm run build && npm start   # producción
```

El navegador llama a `/api/*` del propio sitio y Next lo reenvía a la API (`API_URL`, por defecto `http://localhost:8080`):
no hace falta CORS.

## Variables de entorno (opcionales)

Copiá `.env.example` a `.env.local`. Lo que falta no rompe nada: la web lo muestra como "próximamente"
en lugar de enlazar a algo que no existe.

| Variable | Para qué |
|---|---|
| `NEXT_PUBLIC_FIREBASE_API_KEY`, `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`, `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | **Obligatorias** para iniciar sesión (consola de Firebase → Tus apps → Web) |
| `API_URL` | Dónde está la API de Go (solo la usa el servidor de Next) |
| `NEXT_PUBLIC_PLAY_STORE_URL` | Habilita los botones "Descargar aplicación / Descargar App" |
| `NEXT_PUBLIC_FACEBOOK_URL`, `NEXT_PUBLIC_INSTAGRAM_URL`, `NEXT_PUBLIC_X_URL` | Convierten los íconos del pie en enlaces |

## Estructura

```
src/app/(auth)/          /iniciar-sesion, /registro, /recuperar, /verificar-correo
src/app/(app)/           panel con barra lateral: /inicio, /planes, /planes/nuevo, /planes/[id],
                         /cuidadores, /historial, /notificaciones, /perfil
src/app/(invite)/        /invitacion/[token]  (página a la que llega quien recibe una invitación)
src/app/                 landing (/) y páginas provisorias (/privacidad, /terminos, /ayuda)
src/components/landing/  una carpeta-sección por bloque del diseño (Header, Hero, Features, ...)
src/components/app/      pantallas del panel (home, plans, caregivers, history, notifications, profile)
src/components/auth/     AuthProvider (sesión de Firebase + usuario de la API), formularios de acceso
src/components/ui/       Logo, Button, Field, Card, Chip, Modal, ConfirmDialog, ...
src/lib/                 api (cliente con token), firebase, fechas en zona horaria del usuario
src/content/landing.ts   TODOS los textos de la landing (se editan acá)
src/config/site.ts       nombre, eslogan y enlaces externos
public/                  imágenes e íconos descargados de Figma (los enlaces de Figma vencen a los 7 días)
```

Los tokens de color y tipografía están en `src/app/globals.css` con los mismos nombres que los estilos de Figma
(`--primary-05`, `--neutral-06`, ...). Fuentes: Poppins e Inter (`next/font`).

## Enlaces de los correos de Firebase (`/accion`)

Los correos de "recuperar contraseña" y "verificar correo" traen un enlace. Por defecto Firebase lo abre en su propia
página, sin diseño. `/accion` es la nuestra: maneja `resetPassword` (formulario de contraseña nueva) y `verifyEmail`.
Para que Firebase la use hay que configurarlo UNA vez en la consola: Authentication → Plantillas → editar una plantilla →
"Personalizar URL de acción" → `http://localhost:3000/accion` en desarrollo, o `https://<tu-dominio>/accion` en producción
(el dominio también tiene que figurar en Authentication → Configuración → Dominios autorizados).

## Publicar en GitHub Pages

`npm run build:pages` genera el sitio estático en `out/` (HTML puro, sin servidor). El flujo `.github/workflows/pages.yml`
lo hace solo en cada cambio de la rama `main`. Pasos, una sola vez:

1. **Repo público** → Settings → Pages → *Build and deployment* → Source: **GitHub Actions**.
2. Settings → Secrets and variables → Actions → pestaña **Variables** → crear (son valores públicos):
   `NEXT_PUBLIC_API_URL` (la dirección de la API desplegada), `NEXT_PUBLIC_FIREBASE_API_KEY`,
   `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`, `NEXT_PUBLIC_FIREBASE_PROJECT_ID` y, cuando exista, `NEXT_PUBLIC_PLAY_STORE_URL`.
3. **Firebase** → Authentication → Configuración → *Dominios autorizados*: agregar `<usuario>.github.io`.
   Y en Plantillas → "Personalizar URL de acción": `https://<usuario>.github.io/<repo>/accion/`.
4. **La API** tiene que aceptar al sitio: variable `WEB_ORIGINS=https://<usuario>.github.io` (ver README de la API).

**Dominio propio (opcional, se puede hacer cuando quieras):** Settings → Pages → Custom domain. Después: crear la variable
`CUSTOM_DOMAIN` del repo (así el sitio se compila en la raíz, sin subcarpeta), agregar el dominio a los dominios autorizados
de Firebase y actualizar la URL de acción de las plantillas, y cambiar `WEB_ORIGINS` en la API.

Particularidades del modo estático: no hay servidor, así que el navegador llama directo a la API (por eso CORS);
las páginas con parámetro usan la dirección (`/planes/ver?id=…`, `/invitacion?token=…`); y las imágenes pasan por
`components/ui/Image` para llevar la subcarpeta del sitio.

## Escala de tamaños (`--k`)

Los tamaños de los estilos van como `calc(N * var(--k))`. `--k` vale `1px` (tamaño original) y se reduce en proporción
cuando la pantalla es más chica que el diseño:

| Zona | Dónde se define | Escala |
|---|---|---|
| Landing (diseño de Figma de 1920px) | `src/app/page.module.css` | de 1px a 0,667px entre 1920 y 1280px de ancho |
| Panel de la app | `src/components/app/AppShell.module.css` | de 1px a 0,85px entre 1600 y 1366px de ancho |

Por debajo de 1280px (landing) o 1024px (panel) rigen los diseños de tablet y celular, con medidas propias. Los textos
no bajan de 14px. Para ajustar cuánto se achica, se cambia el `clamp(...)` de esas dos reglas.

## Notas

- Desktop (1920px) verificado contra Figma: alturas de sección dentro de 1 a 5 px.
- Tablet y mobile son **provisorios**: se armaron con 2 capturas de tablet y las alturas del menú; falta confirmar
  contra el diseño completo (el plan gratuito de Figma MCP tiene límite de llamadas).
- Next.js 16 cambió APIs respecto de versiones anteriores: la documentación local está en
  `node_modules/next/dist/docs/` (ver `AGENTS.md`).

## Licencia

[MIT](LICENSE): podés usar, copiar y modificar el código manteniendo el aviso de autor, sin garantía.

Las **fotos e ilustraciones de `public/images`** provienen del diseño de Figma y son de terceros (material de stock): **no están cubiertas por esta licencia**. Reemplazalas por imágenes propias o con licencia antes de reutilizar el sitio.
