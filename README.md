# ☀️ Calculadora Solar ANS

Aplicación web fullstack que permite a los usuarios estimar el ahorro económico y el impacto ambiental de instalar paneles solares en su hogar. Utiliza datos de radiación solar satelital de la **API PVWatts v8 de NREL** para generar cálculos precisos basados en la ubicación geográfica real del usuario.

> **Demo en producción:** [calculadora-solar-six.vercel.app](https://calculadora-solar-six.vercel.app)

---

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Arquitectura](#-arquitectura)
- [Tech Stack](#-tech-stack)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Requisitos Previos](#-requisitos-previos)
- [Instalación](#-instalación)
- [Variables de Entorno](#-variables-de-entorno)
- [Ejecución](#-ejecución)
- [API Reference](#-api-reference)
- [Flujo de la Aplicación](#-flujo-de-la-aplicación)
- [Lógica de Cálculo Solar](#-lógica-de-cálculo-solar)
- [Despliegue](#-despliegue)
- [Licencia](#-licencia)

---

## ✨ Características

- **Selección de ubicación interactiva** con mapa Leaflet (clic o búsqueda por ciudad)
- **Geocodificación directa e inversa** mediante Nominatim (OpenStreetMap)
- **Dos modos de entrada**: por valor de factura (COP) o por consumo en kWh
- **Cálculos basados en datos satelitales reales** (NREL PVWatts v8)
- **Proyección financiera** a 25 años con factor de degradación
- **Estimación de impacto ambiental** (toneladas de CO₂ evitadas y equivalencia en árboles)
- **Diseño responsivo** con TailwindCSS v4
- **Navegación por pasos** con indicador de progreso visual

---

## 🏗 Arquitectura

La aplicación sigue una arquitectura **cliente-servidor desacoplada**:

```
┌─────────────────────┐         ┌─────────────────────┐         ┌──────────────┐
│     Frontend        │  HTTP   │      Backend         │  HTTP   │   NREL API   │
│   (Next.js 16)      │ ──────► │   (Express 5)        │ ──────► │  PVWatts v8  │
│   Vercel             │ ◄────── │   Render / Railway   │ ◄────── │              │
└─────────────────────┘         └─────────────────────┘         └──────────────┘
         │
         │  HTTP
         ▼
┌──────────────────┐
│   Nominatim API  │
│  (OpenStreetMap) │
└──────────────────┘
```

- **Frontend** → Se comunica con el backend para los cálculos solares y con Nominatim para geocodificación.
- **Backend** → Recibe los datos del usuario, consulta la API de NREL y devuelve los resultados procesados.

---

## 🛠 Tech Stack

### Frontend
| Tecnología | Versión | Uso |
|---|---|---|
| **Next.js** | 16.1.6 | Framework React con App Router |
| **React** | 19.2.3 | Librería de UI |
| **TypeScript** | 5.x | Tipado estático |
| **TailwindCSS** | 4.x | Estilos utilitarios |
| **Leaflet** | 1.9.4 | Mapa interactivo |
| **React-Leaflet** | 5.0.0 | Integración Leaflet + React |
| **Font Awesome** | 6.4.0 | Iconografía (CDN) |

### Backend
| Tecnología | Versión | Uso |
|---|---|---|
| **Node.js** | 22+ | Runtime (ES Modules) |
| **Express** | 5.2.1 | Framework HTTP |
| **dotenv** | 17.x | Variables de entorno |
| **cors** | 2.8.6 | Control de acceso CORS |

### APIs Externas
| API | Propósito |
|---|---|
| **NREL PVWatts v8** | Datos de radiación solar y rendimiento fotovoltaico |
| **Nominatim (OSM)** | Geocodificación directa e inversa |

---

## 📁 Estructura del Proyecto

```
calculadora-solar/
├── backend/
│   ├── controllers/
│   │   └── SolarController.js    # Lógica de cálculo solar
│   ├── models/
│   │   └── User.js               # Modelo de usuario (reservado)
│   ├── public/
│   │   └── index.html            # Landing page del API
│   ├── routes/
│   │   ├── api.js                # Rutas API (POST /api/calcular)
│   │   └── web.js                # Rutas web (landing + redirecciones)
│   ├── .gitignore
│   ├── app.js                    # Punto de entrada del servidor
│   └── package.json
│
├── frontend/
│   ├── app/
│   │   ├── components/
│   │   │   ├── CalculadoraForm.tsx  # Formulario de consumo
│   │   │   ├── MapBase.tsx          # Componente de mapa Leaflet
│   │   │   ├── Navbar.tsx           # Barra de navegación
│   │   │   └── StepIndicator.tsx    # Indicador de progreso
│   │   ├── calculadora/
│   │   │   └── page.tsx             # Página de cálculo y resultados
│   │   ├── ubicacion/
│   │   │   └── page.tsx             # Página de selección de ubicación
│   │   ├── globals.css
│   │   ├── layout.tsx               # Layout raíz
│   │   └── page.tsx                 # Landing page
│   ├── public/
│   │   └── img/                     # Imágenes y logos
│   ├── next.config.ts
│   ├── package.json
│   └── tsconfig.json
│
└── README.md
```

---

## 📌 Requisitos Previos

- **Node.js** >= 22.0.0
- **npm** >= 10.0.0
- **API Key de NREL** (opcional, funciona con `DEMO_KEY` para pruebas limitadas)
  - Obtener gratis en: [https://developer.nrel.gov/signup/](https://developer.nrel.gov/signup/)

---

## 🚀 Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/PedroSuarez1402/calculadora-solar.git
cd calculadora-solar
```

### 2. Instalar dependencias del Backend

```bash
cd backend
npm install
```

### 3. Instalar dependencias del Frontend

```bash
cd ../frontend
npm install
```

---

## 🔐 Variables de Entorno

### Backend (`backend/.env`)

Crear un archivo `.env` en la carpeta `backend/`:

```env
PORT=3001
NREL_API_KEY=tu_api_key_de_nrel
```

| Variable | Descripción | Default |
|---|---|---|
| `PORT` | Puerto del servidor Express | `3001` |
| `NREL_API_KEY` | Clave de la API de NREL PVWatts | `DEMO_KEY` |

### Frontend (`frontend/.env.local`)

Crear un archivo `.env.local` en la carpeta `frontend/` (solo si el backend no corre en `localhost:3001`):

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
```

| Variable | Descripción | Default |
|---|---|---|
| `NEXT_PUBLIC_BACKEND_URL` | URL base del backend | `http://localhost:3001` |

---

## ▶️ Ejecución

### Desarrollo local

Abrir **dos terminales**:

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
```
El servidor se iniciará en `http://localhost:3001` con hot-reload (`--watch`).

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
```
La aplicación se abrirá en `http://localhost:3000`.

### Producción

**Backend:**
```bash
cd backend
npm start
```

**Frontend:**
```bash
cd frontend
npm run build
npm start
```

---

## 📡 API Reference

### `POST /api/calcular`

Calcula el ahorro solar basado en la ubicación y consumo del usuario.

#### Request Body

```json
{
  "lat": 7.1193,
  "lon": -73.1227,
  "tipo": "dinero",
  "valor": 200000,
  "costoUnitario": 650
}
```

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `lat` | `number` | ✅ | Latitud de la ubicación |
| `lon` | `number` | ✅ | Longitud de la ubicación |
| `valor` | `number` | ✅ | Valor de factura (COP) o consumo (kWh) |
| `tipo` | `string` | ❌ | `"dinero"` o `"kwh"` (modo de entrada) |
| `costoUnitario` | `number` | ❌ | Tarifa por kWh en COP (default: `650`) |

#### Response (200 OK)

```json
{
  "ubicacion": { "lat": 7.1193, "lon": -73.1227 },
  "inputs": {
    "consumoKWh": 308,
    "tarifaAplicada": 650
  },
  "situacionActual": {
    "gastoMensual": 200000,
    "gastoAnual": 2400000
  },
  "situacionSolar": {
    "ahorroMensual": 120000,
    "ahorroAnual": 1440000,
    "ahorro25Anios": 30600000,
    "co2Toneladas": "1.25"
  },
  "sistema": {
    "tamanoKW": "2.75",
    "numeroPaneles": 5,
    "generacionAnualEstimada": 2500
  },
  "mensaje": "Diseñamos un sistema eficiente para cubrir el 60% de tu consumo con 5 paneles."
}
```

#### Errores

| Código | Descripción |
|---|---|
| `400` | Faltan datos requeridos o consumo inválido |
| `500` | Error interno (fallo en API NREL u otro) |

---

## 🔄 Flujo de la Aplicación

```
┌──────────────┐     ┌──────────────────┐     ┌────────────────────┐
│  1. Landing   │ ──► │  2. Ubicación     │ ──► │  3. Calculadora     │
│  page.tsx     │     │  /ubicacion       │     │  /calculadora       │
│               │     │                   │     │                     │
│  "Comenzar    │     │  • Mapa Leaflet   │     │  • Formulario       │
│   Ahora"      │     │  • Buscador       │     │  • Resultados       │
│               │     │  • Clic en mapa   │     │  • Análisis          │
│               │     │  • Confirmar      │     │    financiero        │
└──────────────┘     └──────────────────┘     └────────────────────┘
                            │                          │
                            │  localStorage            │  fetch POST
                            │  (solarLocation)         │  /api/calcular
                            ▼                          ▼
                     Coordenadas + nombre       Backend → NREL → Respuesta
```

1. **Landing** → El usuario inicia el flujo.
2. **Ubicación** → Selecciona su ubicación en el mapa (clic o búsqueda). Las coordenadas y nombre de ciudad se guardan en `localStorage`.
3. **Calculadora** → Ingresa su consumo (por dinero o kWh). El frontend envía los datos al backend, que consulta NREL y devuelve el análisis completo.

---

## 🧮 Lógica de Cálculo Solar

El motor de cálculo en `SolarController.js` sigue estos pasos:

### Parámetros del modelo
| Parámetro | Valor | Descripción |
|---|---|---|
| `FACTOR_COBERTURA` | 0.60 (60%) | Porcentaje del consumo a cubrir con solar |
| `POTENCIA_PANEL_KW` | 0.55 (550W) | Potencia nominal por panel |
| `factorDegradacion` | 0.85 | Factor promedio de degradación a 25 años |

### Flujo de cálculo

1. **Normalización** → Convierte el valor de entrada a kWh mensuales (si se ingresó en dinero, divide por la tarifa).
2. **Consulta NREL** → Obtiene el rendimiento anual por kW instalado (`ac_annual`) para la ubicación dada.
3. **Dimensionamiento** → Calcula la potencia necesaria aplicando el factor de cobertura y redondea hacia arriba el número de paneles.
4. **Generación estimada** → Multiplica la potencia real del sistema por el rendimiento de NREL.
5. **Análisis financiero** → Calcula ahorro mensual, anual y proyección a 25 años con degradación.
6. **Impacto ambiental** → Estima toneladas de CO₂ evitadas (factor: 0.0005 t/kWh).

### Parámetros de consulta a NREL PVWatts v8
| Parámetro | Valor | Descripción |
|---|---|---|
| `system_capacity` | 1 kW | Capacidad base para obtener rendimiento unitario |
| `azimuth` | 180° | Orientación sur |
| `tilt` | 20° | Inclinación del panel |
| `array_type` | 1 | Montaje fijo en techo |
| `module_type` | 1 | Módulo premium |
| `losses` | 14% | Pérdidas del sistema |

---

## 🌐 Despliegue

### Frontend (Vercel)

El frontend está configurado para desplegarse en **Vercel**:

1. Conectar el repositorio en [vercel.com](https://vercel.com).
2. Configurar el **Root Directory** como `frontend`.
3. Agregar la variable de entorno `NEXT_PUBLIC_BACKEND_URL` apuntando al backend en producción.

### Backend (Render / Railway / Fly.io)

El backend puede desplegarse en cualquier servicio que soporte Node.js:

1. Configurar el **Root Directory** como `backend`.
2. **Build Command:** `npm install`
3. **Start Command:** `npm start`
4. Agregar las variables de entorno (`PORT`, `NREL_API_KEY`).

---

## 📄 Licencia

ISC
