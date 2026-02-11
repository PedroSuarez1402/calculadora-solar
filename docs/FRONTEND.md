# 🖥 Documentación del Frontend — Calculadora Solar ANS

## Información General

| Dato | Valor |
|---|---|
| **Framework** | Next.js 16.1.6 (App Router) |
| **Lenguaje** | TypeScript 5.x |
| **Estilos** | TailwindCSS 4.x |
| **Mapa** | Leaflet 1.9.4 + React-Leaflet 5.0.0 |
| **Iconos** | Font Awesome 6.4.0 (CDN) |
| **Fuentes** | Geist Sans / Geist Mono (Google Fonts) |

---

## Páginas (App Router)

### `/` — Landing Page
**Archivo:** `app/page.tsx`

Página de bienvenida con fondo decorativo, logo de la empresa y botón "Comenzar Ahora" que redirige a `/ubicacion`.

- **Componentes usados:** `Image`, `Link` (Next.js)
- **Tipo:** Server Component

---

### `/ubicacion` — Selección de Ubicación
**Archivo:** `app/ubicacion/page.tsx`

Página de mapa interactivo donde el usuario selecciona la ubicación de instalación de los paneles.

- **Tipo:** Client Component (`'use client'`)
- **Componentes usados:** `MapBase`, `Navbar`

#### Funcionalidades
| Función | Descripción |
|---|---|
| **Clic en mapa** | Coloca un marcador y obtiene el nombre de la ciudad vía geocodificación inversa (Nominatim) |
| **Buscador** | Busca una ciudad por nombre usando geocodificación directa (Nominatim) y centra el mapa |
| **Confirmar** | Guarda las coordenadas y nombre en `localStorage` (`solarLocation`) y navega a `/calculadora` |

#### Estado local
| Estado | Tipo | Descripción |
|---|---|---|
| `selectedLocation` | `{lat, lon, nombre?} \| null` | Ubicación seleccionada por el usuario |
| `mapCenter` | `[number, number]` | Centro actual del mapa (default: Bogotá) |
| `searchQuery` | `string` | Texto del buscador |
| `isSearching` | `boolean` | Indicador de búsqueda en progreso |

---

### `/calculadora` — Cálculo y Resultados
**Archivo:** `app/calculadora/page.tsx`

Página principal de cálculo. Muestra un formulario a la izquierda y los resultados a la derecha en un layout de dos columnas.

- **Tipo:** Client Component (`'use client'`)
- **Componentes usados:** `CalculadoraForm`, `Navbar`

#### Funcionalidades
- Lee la ubicación desde `localStorage` al montar. Si no existe, redirige a `/ubicacion`.
- Envía los datos al backend (`POST /api/calcular`) y muestra los resultados.
- Formatea moneda en pesos colombianos (`Intl.NumberFormat`).

#### Interfaz de respuesta (`SolarResponse`)
```typescript
interface SolarResponse {
  inputs: { consumoKWh: number; tarifaAplicada: number };
  situacionActual: { gastoMensual: number; gastoAnual: number };
  situacionSolar: {
    ahorroMensual: number;
    ahorroAnual: number;
    ahorro25Anios: number;
    co2Toneladas: string;
  };
  sistema: {
    tamanoKW: number;
    numeroPaneles: number;
    generacionAnualEstimada: number;
  };
  mensaje: string;
}
```

#### Secciones de resultados
1. **Análisis Financiero** — Comparación lado a lado: situación actual vs. situación solar
2. **Tu Sistema Ideal** — Potencia (kWp) y número de paneles recomendados
3. **Impacto Ambiental** — Toneladas de CO₂ evitadas y equivalencia en árboles plantados

---

## Componentes

### `MapBase`
**Archivo:** `app/components/MapBase.tsx`

Mapa interactivo basado en Leaflet con soporte para clic y recentrado dinámico.

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| `onLocationSelect` | `(lat, lng) => void` | — | Callback al hacer clic en el mapa |
| `center` | `[number, number]` | `[4.6097, -74.0817]` | Centro inicial del mapa (Bogotá) |

**Subcomponentes internos:**
- `LocationMarker` — Escucha clics del mapa y coloca un marcador.
- `FlyToLocation` — Reacciona a cambios en `center` y anima el mapa con `flyTo`.

**Nota:** Se importa con `dynamic()` y `ssr: false` para evitar errores de Leaflet en el servidor.

---

### `CalculadoraForm`
**Archivo:** `app/components/CalculadoraForm.tsx`

Formulario con dos modos de entrada (tabs) para ingresar el consumo energético.

| Prop | Tipo | Descripción |
|---|---|---|
| `ciudadNombre` | `string` | Nombre de la ciudad seleccionada |
| `onSubmit` | `(data) => void` | Callback con `{ mode, valor, costoUnitario }` |
| `loading` | `boolean` | Estado de carga para deshabilitar el botón |

**Modos:**
| Modo | Campo principal | Campo adicional |
|---|---|---|
| `dinero` | Valor de factura (COP) | — (tarifa por defecto: 650) |
| `kwh` | Consumo mensual (kWh) | Tarifa por kWh (editable) |

---

### `Navbar`
**Archivo:** `app/components/Navbar.tsx`

Barra de navegación superior con logo y indicador de progreso dinámico.

- Detecta la ruta actual con `usePathname()`.
- Muestra el `StepIndicator` solo en `/ubicacion` (paso 1) y `/calculadora` (paso 2).

---

### `StepIndicator`
**Archivo:** `app/components/StepIndicator.tsx`

Indicador visual de progreso con barra animada.

| Prop | Tipo | Descripción |
|---|---|---|
| `currentStep` | `number` | Paso actual (1 o 2) |
| `totalSteps` | `number` | Total de pasos (2) |
| `title` | `string` | Título del paso actual |

- En el paso 2, es clickeable y navega de vuelta a `/ubicacion`.
- Muestra una barra de progreso proporcional al paso actual.

---

## Almacenamiento Local

La aplicación usa `localStorage` para persistir datos entre páginas:

| Clave | Valor | Usado en |
|---|---|---|
| `solarLocation` | `{ lat: number, lon: number, nombre: string }` | `/ubicacion` → `/calculadora` |

---

## Estilos Globales

**Archivo:** `app/globals.css`

- Importa TailwindCSS v4.
- Define variables CSS para tema claro/oscuro.
- Incluye animación personalizada `fadeIn` usada con la clase `.animate-fade-in`.

---

## Configuración Next.js

**Archivo:** `next.config.ts`

```typescript
experimental: {
  serverActions: {
    allowedOrigins: ["localhost:3000", "172.17.144.1:3000"]
  }
}
```

Permite Server Actions desde orígenes locales de desarrollo.
