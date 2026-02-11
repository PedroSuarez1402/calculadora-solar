# ⚙️ Documentación del Backend — Calculadora Solar ANS

## Información General

| Dato | Valor |
|---|---|
| **Runtime** | Node.js 22+ (ES Modules) |
| **Framework** | Express 5.2.1 |
| **Puerto** | 3001 (configurable vía `.env`) |
| **Tipo de módulo** | ESM (`"type": "module"`) |

---

## Punto de Entrada

**Archivo:** `app.js`

Configura y arranca el servidor Express con los siguientes middlewares y rutas:

### Middlewares
| Orden | Middleware | Descripción |
|---|---|---|
| 1 | `cors()` | Control de acceso con lista blanca de orígenes |
| 2 | `express.static('public')` | Sirve archivos estáticos (landing del API) |
| 3 | `express.json()` | Parseo de body JSON |
| 4 | `express.urlencoded()` | Parseo de formularios URL-encoded |

### Rutas registradas
| Prefijo | Archivo | Descripción |
|---|---|---|
| `/` | `routes/web.js` | Landing page y redirecciones |
| `/api` | `routes/api.js` | Endpoints de la API |

---

## Controladores

### `SolarController.js`

**Archivo:** `controllers/SolarController.js`

Contiene la lógica principal de cálculo solar. Exporta un objeto con el método `calcularAhorro`.

#### `calcularAhorro(req, res)`

Método asíncrono que procesa la solicitud de cálculo solar.

##### Flujo de ejecución

```
Entrada (req.body)
    │
    ▼
1. Validación de datos requeridos (lat, lon, valor)
    │
    ▼
2. Normalización del consumo
   ├── tipo === 'dinero' → consumo = valor / tarifa
   └── tipo === 'kwh'   → consumo = valor
    │
    ▼
3. Consulta a NREL PVWatts v8
   └── Obtiene rendimiento anual por kW (ac_annual)
    │
    ▼
4. Cálculos técnicos
   ├── Consumo objetivo = consumo anual × 0.60
   ├── Potencia teórica = consumo objetivo / rendimiento
   ├── Número de paneles = ⌈potencia / 0.55⌉
   └── Generación real = paneles × 0.55 × rendimiento
    │
    ▼
5. Cálculos financieros
   ├── Gasto actual (mensual y anual)
   ├── Ahorro = min(consumo, generación) × tarifa
   ├── Proyección 25 años × factor degradación (0.85)
   └── CO₂ evitado = generación × 0.0005 t/kWh
    │
    ▼
6. Respuesta JSON
```

##### Constantes del modelo

| Constante | Valor | Justificación |
|---|---|---|
| `FACTOR_COBERTURA` | 0.60 | Estándar residencial conservador. No se busca cubrir el 100% |
| `POTENCIA_PANEL_KW` | 0.55 | Panel de 550W, estándar actual del mercado |
| `factorDegradacion` | 0.85 | Promedio global de rendimiento acumulado a 25 años |
| Factor CO₂ | 0.0005 t/kWh | Factor de emisión para conversión a toneladas |

##### Fórmulas clave

**Consumo mensual (modo dinero):**
```
consumoMensualkWh = valorFactura / tarifaPorKWh
```

**Potencia teórica necesaria:**
```
potencia = (consumoMensual × 12 × FACTOR_COBERTURA) / rendimientoPorKW_NREL
```

**Número de paneles:**
```
paneles = ⌈potencia / 0.55⌉   (mínimo 1)
```

**Ahorro mensual:**
```
energiaAhorrada = min(consumoMensual, generacionMensual)
ahorroMensual = energiaAhorrada × tarifa
```

**Proyección a 25 años:**
```
ahorro25 = ahorroAnual × 25 × 0.85
```

---

## Rutas

### `routes/web.js`

Rutas web para servir contenido estático y redirecciones.

| Método | Ruta | Acción |
|---|---|---|
| `GET` | `/` | Sirve `public/index.html` (landing del API) |
| `GET` | `/ubicacion` | Redirige al frontend en producción |
| `GET` | `/calculadora` | Redirige al frontend en producción |

### `routes/api.js`

Rutas de la API REST.

| Método | Ruta | Controlador | Descripción |
|---|---|---|---|
| `POST` | `/api/calcular` | `SolarController.calcularAhorro` | Cálculo de ahorro solar |

---

## Modelos

### `models/User.js`

Archivo reservado para futura implementación de modelo de usuario. Actualmente vacío.

---

## Configuración CORS

**Archivo:** `app.js` (líneas 18-37)

El servidor implementa una política CORS dinámica:

```javascript
const allowedOrigins = [
    'http://localhost:3000',
    'https://calculadora-solar-six.vercel.app',
    'https://calculadora-solar-q97n2eqw7-pedrosuarez1402s-projects.vercel.app'
];
```

**Reglas:**
1. Peticiones sin origen (`origin === undefined`) → **Permitidas** (Postman, server-to-server)
2. Origen en la lista blanca → **Permitido**
3. Cualquier subdominio `*.vercel.app` → **Permitido** (para previews de Vercel)
4. Cualquier otro origen → **Bloqueado** (`Error: Not allowed by CORS`)

---

## Dependencias

| Paquete | Versión | Propósito |
|---|---|---|
| `express` | ^5.2.1 | Framework HTTP |
| `cors` | ^2.8.6 | Middleware de control de acceso |
| `dotenv` | ^17.2.4 | Carga de variables de entorno desde `.env` |

---

## Scripts npm

| Script | Comando | Descripción |
|---|---|---|
| `npm start` | `node app.js` | Inicia el servidor en producción |
| `npm run dev` | `node --watch app.js` | Inicia con hot-reload (Node 22 nativo) |

---

## Variables de Entorno

| Variable | Requerida | Default | Descripción |
|---|---|---|---|
| `PORT` | No | `3001` | Puerto del servidor |
| `NREL_API_KEY` | No | `DEMO_KEY` | API Key de NREL (obtener en [developer.nrel.gov](https://developer.nrel.gov/signup/)) |

**Nota:** `DEMO_KEY` tiene límites de 30 requests/hora y 50/día. Para producción se recomienda obtener una clave propia (gratuita).
