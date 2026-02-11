# 📡 Documentación de la API — Calculadora Solar ANS

## Información General

| Dato | Valor |
|---|---|
| **Base URL (desarrollo)** | `http://localhost:3001` |
| **Base URL (producción)** | Configurar según hosting |
| **Formato de datos** | JSON |
| **Autenticación** | No requerida (API pública) |

---

## Endpoints

### 1. `GET /`

Sirve la landing page del backend (página HTML estática que indica que la API está online).

**Response:** HTML (`public/index.html`)

---

### 2. `GET /ubicacion`

Redirección inteligente al frontend.

**Response:** `302 Redirect` → `https://calculadora-solar-six.vercel.app/ubicacion`

---

### 3. `GET /calculadora`

Redirección inteligente al frontend.

**Response:** `302 Redirect` → `https://calculadora-solar-six.vercel.app/calculadora`

---

### 4. `POST /api/calcular`

Endpoint principal. Recibe datos de ubicación y consumo, consulta la API de NREL PVWatts v8 y devuelve un análisis completo de ahorro solar.

#### Headers

```
Content-Type: application/json
```

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

| Campo | Tipo | Requerido | Default | Descripción |
|---|---|---|---|---|
| `lat` | `number` | ✅ | — | Latitud de la ubicación del usuario |
| `lon` | `number` | ✅ | — | Longitud de la ubicación del usuario |
| `valor` | `number` | ✅ | — | Valor de la factura en COP (si `tipo=dinero`) o consumo en kWh (si `tipo=kwh`) |
| `tipo` | `string` | ❌ | `"dinero"` | Modo de entrada: `"dinero"` para pesos colombianos, `"kwh"` para kilovatios-hora |
| `costoUnitario` | `number` | ❌ | `650` | Tarifa por kWh en pesos colombianos |

#### Response Exitosa (200)

```json
{
  "ubicacion": {
    "lat": 7.1193,
    "lon": -73.1227
  },
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

##### Descripción de campos de respuesta

**`ubicacion`** — Coordenadas enviadas por el usuario.

**`inputs`** — Datos normalizados de entrada:
| Campo | Tipo | Descripción |
|---|---|---|
| `consumoKWh` | `number` | Consumo mensual calculado/ingresado en kWh |
| `tarifaAplicada` | `number` | Tarifa por kWh utilizada en el cálculo (COP) |

**`situacionActual`** — Gasto actual sin paneles solares:
| Campo | Tipo | Descripción |
|---|---|---|
| `gastoMensual` | `number` | Gasto mensual actual en COP |
| `gastoAnual` | `number` | Gasto anual proyectado en COP |

**`situacionSolar`** — Proyección de ahorro con paneles solares:
| Campo | Tipo | Descripción |
|---|---|---|
| `ahorroMensual` | `number` | Ahorro mensual estimado en COP |
| `ahorroAnual` | `number` | Ahorro anual estimado en COP |
| `ahorro25Anios` | `number` | Ahorro acumulado a 25 años (con degradación) en COP |
| `co2Toneladas` | `string` | Toneladas de CO₂ evitadas por año |

**`sistema`** — Especificaciones técnicas del sistema recomendado:
| Campo | Tipo | Descripción |
|---|---|---|
| `tamanoKW` | `string` | Potencia total del sistema en kWp |
| `numeroPaneles` | `number` | Cantidad de paneles de 550W recomendados |
| `generacionAnualEstimada` | `number` | Generación anual estimada en kWh |

**`mensaje`** — Resumen legible del dimensionamiento.

#### Errores

**400 — Datos faltantes o inválidos:**
```json
{ "error": "Faltan datos requeridos" }
```

**400 — Consumo inválido:**
```json
{ "error": "Consumo inválido" }
```

**500 — Error interno:**
```json
{ "error": "Error interno al calcular" }
```

---

## Ejemplos de uso con cURL

### Modo Dinero (valor de factura)

```bash
curl -X POST http://localhost:3001/api/calcular \
  -H "Content-Type: application/json" \
  -d '{
    "lat": 4.6097,
    "lon": -74.0817,
    "tipo": "dinero",
    "valor": 150000,
    "costoUnitario": 650
  }'
```

### Modo Energía (kWh directos)

```bash
curl -X POST http://localhost:3001/api/calcular \
  -H "Content-Type: application/json" \
  -d '{
    "lat": 6.2442,
    "lon": -75.5812,
    "tipo": "kwh",
    "valor": 400,
    "costoUnitario": 700
  }'
```

### Ejemplo mínimo (solo campos requeridos)

```bash
curl -X POST http://localhost:3001/api/calcular \
  -H "Content-Type: application/json" \
  -d '{
    "lat": 10.3910,
    "lon": -75.5144,
    "valor": 250000
  }'
```

---

## APIs Externas Consumidas

### NREL PVWatts v8

- **Documentación:** [https://developer.nrel.gov/docs/solar/pvwatts/v8/](https://developer.nrel.gov/docs/solar/pvwatts/v8/)
- **Endpoint:** `https://developer.nrel.gov/api/pvwatts/v8`
- **Autenticación:** API Key (gratuita, registrarse en [developer.nrel.gov](https://developer.nrel.gov/signup/))
- **Límites con DEMO_KEY:** 30 requests/hora, 50 requests/día

| Parámetro enviado | Valor | Descripción |
|---|---|---|
| `system_capacity` | `1` | 1 kW base para obtener rendimiento unitario |
| `azimuth` | `180` | Orientación sur (óptima hemisferio norte) |
| `tilt` | `20` | Inclinación de 20° |
| `array_type` | `1` | Montaje fijo en techo |
| `module_type` | `1` | Módulo premium |
| `losses` | `14` | 14% de pérdidas del sistema |

### Nominatim (OpenStreetMap)

- **Documentación:** [https://nominatim.org/release-docs/develop/api/](https://nominatim.org/release-docs/develop/api/)
- **Uso:** Geocodificación directa (búsqueda por nombre) e inversa (coordenadas a nombre de ciudad)
- **Consumida desde:** Frontend (cliente)
- **Límites:** 1 request/segundo (política de uso justo)

---

## Configuración CORS

El backend permite peticiones desde los siguientes orígenes:

| Origen | Propósito |
|---|---|
| `http://localhost:3000` | Desarrollo local del frontend |
| `https://calculadora-solar-six.vercel.app` | Producción (Vercel) |
| `*.vercel.app` | Subdominios de preview en Vercel |

Peticiones sin origen (Postman, server-to-server) también son permitidas.
