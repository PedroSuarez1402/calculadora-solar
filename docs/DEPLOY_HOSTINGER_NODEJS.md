# 🚀 Guía de Despliegue en Hostinger (Con Node.js)

Tu plan de Hostinger soporta aplicaciones Node.js. Tanto **Next.js** (frontend) como **Express.js** (backend) son frameworks soportados oficialmente.

---

## Estrategia de Despliegue

Tu proyecto es un monorepo con dos aplicaciones independientes. En Hostinger, cada una se despliega como un **website separado**:

| Aplicación | Framework | Website en Hostinger |
|---|---|---|
| **Frontend** | Next.js 16 | Website #1 (dominio principal) |
| **Backend** | Express 5 | Website #2 (subdominio: `api.tudominio.com`) |

```
┌──────────────────────────────┐     ┌──────────────────────────────┐
│  Website #1 — Hostinger       │     │  Website #2 — Hostinger       │
│  tudominio.com                │     │  api.tudominio.com            │
│                               │     │                               │
│  Frontend (Next.js)           │────►│  Backend (Express)            │
│  Páginas + UI                 │     │  POST /api/calcular           │
│                               │◄────│  NREL API proxy               │
└──────────────────────────────┘     └──────────────────────────────┘
```

Hay **dos métodos** de despliegue disponibles:
- **Método A:** Desde GitHub (recomendado — auto-deploy en cada push)
- **Método B:** Subida de archivos .zip (manual)

---

## Requisitos Previos

- Plan **Business Web Hosting**, **Cloud Startup** o superior en Hostinger
- Cuenta de GitHub (para Método A)
- API Key de NREL (obtener gratis en [developer.nrel.gov/signup](https://developer.nrel.gov/signup/))

---

## PARTE 1: Preparar el Código

Antes de desplegar, hay que hacer algunos ajustes en el código.

### 1.1 — Preparar el Backend

#### Actualizar CORS (`backend/app.js`)

Agrega tu dominio de Hostinger a la lista de orígenes permitidos:

```javascript
const allowedOrigins = [
    'http://localhost:3000',                          // Desarrollo local
    'https://calculadora-solar-six.vercel.app',       // Vercel (si lo mantienes)
    'https://tudominio.com',                          // ← Tu dominio en Hostinger
    'https://www.tudominio.com',                      // ← Con www
];
```

#### Verificar el puerto

Hostinger asigna el puerto automáticamente vía la variable de entorno `PORT`. Tu código ya lo maneja correctamente:

```javascript
const PORT = process.env.PORT ?? 3001;
```

No necesitas cambiar nada aquí.

### 1.2 — Preparar el Frontend

#### Configurar la URL del backend

Crear el archivo `frontend/.env.production`:

```env
NEXT_PUBLIC_BACKEND_URL=https://api.tudominio.com
```

> Reemplaza `api.tudominio.com` con el subdominio real que asignarás al backend. Si aún no tienes dominio personalizado, usa el dominio temporal que Hostinger te asignará al backend y actualízalo después.

#### Verificar `next.config.ts`

Tu configuración actual funciona bien para Hostinger. No necesitas `output: 'export'` porque Hostinger ejecuta Next.js con su servidor Node.js nativo.

Si quieres, puedes limpiar la config de `serverActions` que ya no necesitas:

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Hostinger ejecuta Next.js con Node.js, no necesitas config especial
};

export default nextConfig;
```

### 1.3 — Hacer commit y push

```bash
git add .
git commit -m "Preparar para despliegue en Hostinger"
git push origin main
```

---

## PARTE 2: Desplegar el Backend (Express)

### Método A — Desde GitHub (Recomendado)

#### Paso 1 — Acceder a hPanel

1. Inicia sesión en [hpanel.hostinger.com](https://hpanel.hostinger.com).
2. En el sidebar, ve a **"Websites"**.
3. Clic en **"Add Website"**.

#### Paso 2 — Seleccionar Node.js App

1. Elige **"Node.js Apps"** de las opciones disponibles.

#### Paso 3 — Elegir GitHub

1. Selecciona **"Import Git Repository"**.
2. Autoriza el acceso a GitHub si es la primera vez.

#### Paso 4 — Seleccionar repositorio

1. Busca y selecciona tu repositorio `calculadora-solar`.

#### Paso 5 — Configurar Build Settings

Hostinger detectará automáticamente el framework Express. Verifica o ajusta estos valores:

| Campo | Valor |
|---|---|
| **Root Directory** | `backend` |
| **Node.js Version** | `22.x` |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |

#### Paso 6 — Variables de Entorno

En la sección de variables de entorno, agrega:

| Variable | Valor |
|---|---|
| `NREL_API_KEY` | `tu_api_key_de_nrel` |

> **No** necesitas definir `PORT` — Hostinger lo asigna automáticamente.

#### Paso 7 — Deploy

1. Clic en **"Deploy"**.
2. Espera a que el build termine (puedes ver los logs en tiempo real).
3. Hostinger te asignará un **dominio temporal** (ej: `algo.hostingersite.com`).

#### Paso 8 — Verificar

Abre el dominio temporal en el navegador. Deberías ver la landing page del API con el mensaje **"API ONLINE & RUNNING"**.

Prueba el endpoint:

```bash
curl -X POST https://TU_DOMINIO_TEMPORAL/api/calcular \
  -H "Content-Type: application/json" \
  -d '{"lat": 4.6097, "lon": -74.0817, "valor": 200000}'
```

---

### Método B — Subida de Archivos .zip

Si prefieres no usar GitHub:

#### Paso 1 — Comprimir el backend

Comprime **solo el contenido** de la carpeta `backend/` en un archivo `.zip`:

```
backend.zip
├── app.js
├── package.json
├── package-lock.json
├── controllers/
│   └── SolarController.js
├── models/
│   └── User.js
├── routes/
│   ├── api.js
│   └── web.js
└── public/
    └── index.html
```

> **No incluyas** `node_modules/` ni `.env` en el .zip. Hostinger ejecutará `npm install` automáticamente.

#### Paso 2 — Subir en hPanel

1. Ve a **"Websites" → "Add Website" → "Node.js Apps"**.
2. Selecciona **"Upload your website files"**.
3. Sube el archivo `backend.zip`.
4. Configura los build settings (igual que en Método A, Paso 5).
5. Agrega las variables de entorno (igual que en Método A, Paso 6).
6. Clic en **"Deploy"**.

---

## PARTE 3: Desplegar el Frontend (Next.js)

Repite el proceso pero para el frontend.

### Método A — Desde GitHub

#### Paso 1 — Agregar otro website

1. En hPanel, ve a **"Websites" → "Add Website"**.
2. Selecciona **"Node.js Apps"** nuevamente.

#### Paso 2 — Conectar GitHub

1. Selecciona **"Import Git Repository"**.
2. Elige el mismo repositorio `calculadora-solar`.

#### Paso 3 — Configurar Build Settings

| Campo | Valor |
|---|---|
| **Root Directory** | `frontend` |
| **Node.js Version** | `22.x` |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm start` |

> Hostinger debería auto-detectar Next.js y sugerir estos valores.

#### Paso 4 — Variables de Entorno

| Variable | Valor |
|---|---|
| `NEXT_PUBLIC_BACKEND_URL` | `https://TU_DOMINIO_DEL_BACKEND` |

> Usa el dominio temporal del backend que obtuviste en la Parte 2, o el subdominio personalizado si ya lo configuraste.

#### Paso 5 — Deploy

1. Clic en **"Deploy"**.
2. Espera a que el build de Next.js termine.
3. Hostinger te asignará otro **dominio temporal**.

#### Paso 6 — Verificar

1. Abre el dominio temporal del frontend.
2. Deberías ver la landing page con "Calculadora Solar".
3. Prueba el flujo completo: Landing → Ubicación → Calculadora → Resultados.

---

### Método B — Subida de Archivos .zip

#### Paso 1 — Comprimir el frontend

Comprime **solo el contenido** de la carpeta `frontend/` en un archivo `.zip`:

```
frontend.zip
├── app/
│   ├── components/
│   ├── calculadora/
│   ├── ubicacion/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── public/
│   └── img/
├── next.config.ts
├── package.json
├── package-lock.json
├── tsconfig.json
├── postcss.config.mjs
└── eslint.config.mjs
```

> **No incluyas** `node_modules/`, `.next/`, ni `.env.local` en el .zip.

#### Paso 2 — Subir y desplegar

1. Ve a **"Websites" → "Add Website" → "Node.js Apps"**.
2. Selecciona **"Upload your website files"**.
3. Sube `frontend.zip`.
4. Configura build settings y variables de entorno (igual que Método A).
5. Clic en **"Deploy"**.

---

## PARTE 4: Conectar Dominio Personalizado

Una vez ambas apps estén desplegadas con dominios temporales, puedes conectar tu dominio real.

### 4.1 — Asignar dominio al Frontend

1. En hPanel, ve al website del **frontend**.
2. Busca la opción de **conectar dominio** o sigue la guía oficial:
   [Cómo conectar un dominio en Hostinger](https://www.hostinger.com/support/10085905-how-to-connect-a-preferred-domain-name-instead-of-a-temporary-one-at-hostinger/)
3. Asigna tu dominio principal: `tudominio.com`

### 4.2 — Asignar subdominio al Backend

1. Crea un subdominio en Hostinger: `api.tudominio.com`
2. Conéctalo al website del **backend**.

### 4.3 — Actualizar la URL del backend en el frontend

Una vez tengas el subdominio del backend configurado, actualiza la variable de entorno del frontend:

| Variable | Nuevo Valor |
|---|---|
| `NEXT_PUBLIC_BACKEND_URL` | `https://api.tudominio.com` |

Redespliega el frontend para que tome el cambio.

### 4.4 — Actualizar CORS en el backend

Asegúrate de que `backend/app.js` tenga tu dominio final en la lista de orígenes:

```javascript
const allowedOrigins = [
    'http://localhost:3000',
    'https://tudominio.com',
    'https://www.tudominio.com',
];
```

Redespliega el backend.

---

## PARTE 5: SSL / HTTPS

Hostinger incluye certificados SSL gratuitos. Verifica que estén activos:

1. En hPanel, ve a **"Seguridad" → "SSL"** para cada website.
2. Activa el certificado SSL si no está activo.
3. Activa **"Forzar HTTPS"** para ambos websites.

---

## Resumen de Cambios en el Código

### Archivo 1: `backend/app.js` — Actualizar CORS

```javascript
const allowedOrigins = [
    'http://localhost:3000',
    'https://tudominio.com',
    'https://www.tudominio.com',
    // Agrega aquí los dominios temporales de Hostinger si es necesario
];
```

### Archivo 2: `frontend/.env.production` — URL del backend (crear nuevo)

```env
NEXT_PUBLIC_BACKEND_URL=https://api.tudominio.com
```

---

## Redespliegues

### Si usaste GitHub:
Cada `git push` a la rama `main` redesplegará automáticamente la app correspondiente. También puedes redesplegar manualmente desde el dashboard de hPanel.

### Si subiste archivos .zip:
Sube un nuevo .zip desde el dashboard del website en hPanel y haz clic en redesplegar.

---

## Troubleshooting

### El frontend no se conecta al backend
- **Verifica la variable** `NEXT_PUBLIC_BACKEND_URL` — debe apuntar al dominio exacto del backend (con `https://`).
- **Verifica CORS** — el dominio del frontend debe estar en `allowedOrigins` del backend.
- **Verifica SSL** — ambos deben usar HTTPS. Peticiones mixtas (HTTP→HTTPS) son bloqueadas por el navegador.

### Error de build en el frontend
- Asegúrate de que el **Root Directory** sea `frontend`.
- Verifica que el **Build Command** sea `npm install && npm run build`.
- Revisa los logs de build en hPanel para errores específicos.

### Error de build en el backend
- Asegúrate de que el **Root Directory** sea `backend`.
- Verifica que la versión de Node.js sea **22.x** (tu código usa ES Modules y `node --watch`).

### El mapa no carga
- Leaflet carga tiles desde OpenStreetMap (CDN externo). No depende del servidor.
- Verifica que no haya un firewall o política de seguridad bloqueando las peticiones a `tile.openstreetmap.org`.

### La API de NREL falla
- Si usas `DEMO_KEY`, tiene límite de 30 requests/hora.
- Obtén una key propia gratis en [developer.nrel.gov/signup](https://developer.nrel.gov/signup/).
- Verifica que la variable `NREL_API_KEY` esté configurada en las variables de entorno del backend en hPanel.

---

## Checklist Final

- [ ] Backend desplegado en Hostinger como Website #1
- [ ] Variable `NREL_API_KEY` configurada en el backend
- [ ] Backend responde correctamente en su dominio temporal
- [ ] CORS actualizado con los dominios finales
- [ ] Frontend desplegado en Hostinger como Website #2
- [ ] Variable `NEXT_PUBLIC_BACKEND_URL` apuntando al backend
- [ ] Frontend carga correctamente en su dominio temporal
- [ ] Flujo completo funciona: Landing → Ubicación → Calculadora → Resultados
- [ ] Dominio personalizado conectado al frontend
- [ ] Subdominio `api.*` conectado al backend
- [ ] SSL activo y HTTPS forzado en ambos websites
- [ ] Variables de entorno actualizadas con dominios finales
- [ ] Redespliegue final de ambas apps
