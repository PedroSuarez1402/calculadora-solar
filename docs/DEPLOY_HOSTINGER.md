# 🚀 Guía de Despliegue en Hostinger (Sin Node.js)

## El Problema

Tu plan de Hostinger es un **hosting compartido** que solo soporta PHP y archivos estáticos (HTML/CSS/JS). No tiene soporte para Node.js, por lo tanto **no puedes ejecutar ni el frontend (Next.js) ni el backend (Express) directamente**.

## La Solución

Dividimos el despliegue en dos partes:

| Componente | Dónde se despliega | Cómo |
|---|---|---|
| **Frontend** (Next.js) | **Hostinger** | Exportación estática (`next export`) → subir archivos HTML/CSS/JS |
| **Backend** (Express) | **Render.com** (gratis) | Servicio Node.js gratuito en la nube |

```
┌──────────────────────┐              ┌──────────────────────┐
│   HOSTINGER           │    HTTP      │   RENDER (gratis)     │
│   (tu dominio)        │ ──────────► │   Backend Express     │
│                       │              │                       │
│   Frontend estático   │ ◄────────── │   POST /api/calcular  │
│   HTML + CSS + JS     │   JSON       │   NREL API proxy      │
└──────────────────────┘              └──────────────────────┘
```

---

## PARTE 1: Desplegar el Backend en Render (Gratis)

El backend **necesita** Node.js, así que lo desplegamos en [Render.com](https://render.com) (plan gratuito).

### Paso 1.1 — Crear cuenta en Render

1. Ir a [render.com](https://render.com) y crear una cuenta (puedes usar GitHub).

### Paso 1.2 — Subir el backend a un repositorio Git

Si aún no tienes el backend en un repositorio separado o en un monorepo en GitHub:

1. Crear un repositorio en GitHub (ej: `calculadora-solar-backend`).
2. Subir **solo la carpeta `backend/`** como raíz del repositorio:

```bash
cd backend
git init
git add .
git commit -m "Initial commit - Backend Calculadora Solar"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/calculadora-solar-backend.git
git push -u origin main
```

> **Alternativa:** Si ya tienes todo en un monorepo, Render permite configurar el Root Directory como `backend/`.

### Paso 1.3 — Crear el servicio en Render

1. En el dashboard de Render, clic en **"New" → "Web Service"**.
2. Conectar tu repositorio de GitHub.
3. Configurar:

| Campo | Valor |
|---|---|
| **Name** | `calculadora-solar-api` |
| **Region** | Oregon (US West) o el más cercano |
| **Branch** | `main` |
| **Root Directory** | `backend` (si es monorepo) o dejar vacío |
| **Runtime** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Instance Type** | **Free** |

4. En **Environment Variables**, agregar:

| Variable | Valor |
|---|---|
| `PORT` | `10000` (Render usa este puerto por defecto) |
| `NREL_API_KEY` | Tu API key de NREL |

5. Clic en **"Create Web Service"**.

### Paso 1.4 — Obtener la URL del backend

Una vez desplegado, Render te dará una URL como:
```
https://calculadora-solar-api.onrender.com
```

**Guarda esta URL**, la necesitarás para configurar el frontend.

### Paso 1.5 — Actualizar CORS en el backend

Antes de desplegar, agrega tu dominio de Hostinger a la lista de orígenes permitidos en `backend/app.js`:

```javascript
const allowedOrigins = [
    'http://localhost:3000',
    'https://calculadora-solar-six.vercel.app',
    'https://tudominio.com',           // ← Tu dominio en Hostinger
    'https://www.tudominio.com',       // ← Con www también
];
```

Haz commit y push para que Render redespliegue automáticamente.

---

## PARTE 2: Preparar el Frontend para Exportación Estática

### Paso 2.1 — Configurar Next.js para exportación estática

Editar `frontend/next.config.ts` para habilitar el export estático:

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',        // ← CLAVE: Genera HTML estático
  images: {
    unoptimized: true,     // ← Necesario: Hostinger no tiene el servidor de imágenes de Next.js
  },
  trailingSlash: true,     // ← Recomendado: Genera /ubicacion/index.html en vez de /ubicacion.html
};

export default nextConfig;
```

> **Nota:** Se eliminó `experimental.serverActions` porque no es compatible con export estático (y no lo necesitas, tu app no usa Server Actions).

### Paso 2.2 — Configurar la URL del backend

Crear o editar `frontend/.env.production`:

```env
NEXT_PUBLIC_BACKEND_URL=https://calculadora-solar-api.onrender.com
```

Reemplaza la URL con la que obtuviste en el Paso 1.4.

### Paso 2.3 — Ajustar el layout para export estático

Las fuentes de Google (`next/font/google`) funcionan con export estático, pero se descargan en tiempo de build. No requiere cambios.

### Paso 2.4 — Generar el build estático

```bash
cd frontend
npm run build
```

Esto generará una carpeta **`frontend/out/`** con todos los archivos estáticos:

```
frontend/out/
├── index.html              ← Landing page
├── ubicacion/
│   └── index.html          ← Página de ubicación
├── calculadora/
│   └── index.html          ← Página de calculadora
├── _next/
│   ├── static/             ← CSS, JS bundles
│   └── ...
├── img/
│   └── logo_energia.png
└── favicon.ico
```

### Paso 2.5 — Verificar localmente (opcional)

Puedes probar el build estático antes de subirlo:

```bash
npx serve out
```

Abre `http://localhost:3000` y verifica que todo funcione.

---

## PARTE 3: Subir el Frontend a Hostinger

### Paso 3.1 — Acceder al File Manager de Hostinger

1. Inicia sesión en [hpanel.hostinger.com](https://hpanel.hostinger.com).
2. Ve a **"Hosting"** → selecciona tu plan.
3. Clic en **"Administrador de archivos"** (File Manager).

### Paso 3.2 — Limpiar la carpeta public_html

1. Navega a la carpeta `public_html/`.
2. **Elimina** todo el contenido existente (o haz un backup antes).

### Paso 3.3 — Subir los archivos

**Opción A — File Manager (interfaz web):**

1. Dentro de `public_html/`, clic en **"Subir archivos"**.
2. Selecciona **todo el contenido** de la carpeta `frontend/out/` y súbelo.
3. Asegúrate de que la estructura quede así:

```
public_html/
├── index.html
├── ubicacion/
│   └── index.html
├── calculadora/
│   └── index.html
├── _next/
│   ├── static/
│   └── ...
├── img/
│   └── logo_energia.png
└── favicon.ico
```

> **Importante:** Los archivos deben estar **directamente dentro de `public_html/`**, NO dentro de una subcarpeta como `public_html/out/`.

**Opción B — FTP (más rápido para muchos archivos):**

1. En Hostinger, ve a **"Archivos" → "Cuentas FTP"** y crea una cuenta o usa la existente.
2. Conéctate con un cliente FTP como [FileZilla](https://filezilla-project.org/):

| Campo | Valor |
|---|---|
| **Host** | Tu dominio o IP de Hostinger |
| **Usuario** | Tu usuario FTP |
| **Contraseña** | Tu contraseña FTP |
| **Puerto** | `21` |

3. Navega a `public_html/` en el servidor remoto.
4. Sube todo el contenido de `frontend/out/` ahí.

### Paso 3.4 — Configurar .htaccess para SPA routing

Crea un archivo `.htaccess` dentro de `public_html/` para que las rutas funcionen correctamente:

```apache
RewriteEngine On

# Si el archivo o directorio existe, servirlo directamente
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d

# Si la petición no termina en slash y existe un directorio con ese nombre, agregar slash
RewriteCond %{REQUEST_FILENAME}/ -d
RewriteRule ^(.*)$ /$1/ [L,R=301]

# Para rutas que no existen como archivo, buscar el index.html del directorio
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ /index.html [L]
```

> **Nota:** Gracias a `trailingSlash: true` en next.config.ts, Next.js genera `/ubicacion/index.html`, así que Apache puede servir las rutas directamente como directorios. El `.htaccess` es un respaldo para cualquier ruta inesperada.

---

## PARTE 4: Configurar dominio y HTTPS

### Paso 4.1 — Verificar SSL

1. En Hostinger, ve a **"Seguridad" → "SSL"**.
2. Asegúrate de que el certificado SSL esté activo (Hostinger lo incluye gratis).
3. Activa **"Forzar HTTPS"** si está disponible.

### Paso 4.2 — Verificar que todo funcione

1. Abre `https://tudominio.com` → Debería cargar la landing page.
2. Clic en "Comenzar Ahora" → Debería ir a `/ubicacion/` con el mapa.
3. Selecciona una ubicación → Debería ir a `/calculadora/`.
4. Ingresa un valor y calcula → Debería conectarse al backend en Render y mostrar resultados.

---

## PARTE 5: Consideraciones Importantes

### ⚠️ Limitaciones del plan gratuito de Render

| Limitación | Detalle |
|---|---|
| **Cold starts** | El servidor se "duerme" tras 15 min de inactividad. La primera petición tarda ~30-50 segundos |
| **750 horas/mes** | Suficiente para un solo servicio 24/7 |
| **Ancho de banda** | 100 GB/mes |

**Solución para cold starts:** Puedes usar un servicio como [UptimeRobot](https://uptimerobot.com/) (gratis) para hacer ping al backend cada 14 minutos y mantenerlo activo.

### ⚠️ Fuentes de Google (next/font)

Con export estático, Next.js descarga las fuentes en tiempo de build y las incluye en los archivos estáticos. Funcionan sin problema en Hostinger.

### ⚠️ Imágenes

Con `images: { unoptimized: true }`, el componente `<Image>` de Next.js genera tags `<img>` normales sin optimización del servidor. Las imágenes se sirven tal cual desde Hostinger.

### ⚠️ Leaflet (Mapa)

Leaflet carga tiles desde OpenStreetMap (CDN externo). No depende del servidor, funciona perfectamente en hosting estático.

---

## Resumen de Cambios Necesarios en el Código

### 1. `frontend/next.config.ts` — Habilitar export estático

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
};

export default nextConfig;
```

### 2. `frontend/.env.production` — URL del backend

```env
NEXT_PUBLIC_BACKEND_URL=https://calculadora-solar-api.onrender.com
```

### 3. `backend/app.js` — Agregar dominio de Hostinger al CORS

```javascript
const allowedOrigins = [
    'http://localhost:3000',
    'https://calculadora-solar-six.vercel.app',
    'https://tudominio.com',
    'https://www.tudominio.com',
];
```

### 4. `public_html/.htaccess` — Routing en Apache

```apache
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_FILENAME}/ -d
RewriteRule ^(.*)$ /$1/ [L,R=301]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ /index.html [L]
```

---

## Checklist Final

- [ ] Backend desplegado en Render con variables de entorno configuradas
- [ ] CORS actualizado con tu dominio de Hostinger
- [ ] `next.config.ts` configurado con `output: 'export'`
- [ ] `.env.production` creado con la URL del backend en Render
- [ ] `npm run build` ejecutado exitosamente en `frontend/`
- [ ] Contenido de `frontend/out/` subido a `public_html/` en Hostinger
- [ ] `.htaccess` creado en `public_html/`
- [ ] SSL activo y HTTPS forzado
- [ ] Prueba completa del flujo: Landing → Ubicación → Calculadora → Resultados
