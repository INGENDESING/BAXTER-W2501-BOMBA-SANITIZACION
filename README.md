# W2601 — Estudio Técnico-Económico (Web App)

Aplicación web interactiva del Estudio Técnico-Económico **W2601 REV2** para el proyecto *Bomba de Calor para Tanques de Condensados* — E3PRO Engineering Solutions para Laboratorios BAXTER S.A.

## ✨ Características

- **Recálculo en tiempo real**: Modifica parámetros (CAPEX, WACC, COP, precios energía, etc.) y observa cómo se actualizan todos los indicadores al instante.
- **Dashboard visual tipo Power BI**: KPIs animados, gráficos interactivos y tablas comparativas con tema dark premium E3PRO.
- **Backend Node.js + Express**: API REST para validación server-side, exportación de Excel/PDF y endpoints de escenarios/sensibilidad.
- **Comparación de escenarios**: Pesimista, Base y Optimista con decisiones de viabilidad.
- **Análisis de sensibilidad**: Tornado chart ±25% en variables clave.
- **Exportación**: Descarga el dashboard en PDF o genera un Excel multi-hoja con todos los datos.
- **Diseño responsive**: Adaptable a desktop, tablet y móvil.
- **Tema dark premium**: Paleta E3PRO con glassmorphism, acentos translúcidos y colores vibrantes.

## 🚀 Stack Tecnológico

### Frontend
- **React 19** + **TypeScript** + **Vite**
- **Tailwind CSS v4** (estilos utilitarios)
- **Recharts** (visualizaciones)
- **Framer Motion** (animaciones)
- **Zustand** (estado global)
- **html2canvas** + **jsPDF** (export PDF cliente)
- **SheetJS** (export Excel cliente)

### Backend
- **Express 4** + **TypeScript** (vía `tsx`)
- **CORS** habilitado
- **Motor de cálculo compartido** (`shared/engine/` / `server/engine/`)
- API endpoints: `/api/health`, `/api/calculate`, `/api/scenarios`, `/api/sensitivity`, `/api/export/*`

## 🛠️ Desarrollo local

```bash
# Instalar dependencias
npm install

# Instalar hooks de Git (obligatorio, una sola vez)
python ../scripts/install_hooks.py

# Solo frontend (Vite dev server en :5173, proxy /api → :3001)
npm run dev

# Solo backend (Express en :3001)
npm run dev:server

# Frontend + backend en paralelo
npm run dev:full

# Sincronizar entregables (Excel + PDF) desde ESTUDIOECONOMICO/ a public/
npm run sync

# Build de producción (React + server type-check)
npm run build

# Preview del build frontend
npm run preview
```

## 📦 Despliegue en Render

1. Crea un nuevo **Web Service** en [Render](https://render.com).
2. Conecta tu repositorio de GitHub.
3. Render detectará automáticamente el `render.yaml` (Blueprint).
4. La app estará disponible en: `https://w2601-estudio-web-fl87.onrender.com/`

### Configuración manual (si no usas Blueprint)
- **Runtime**: Node
- **Root Directory**: `w2601-estudio-web`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`

## 📁 Estructura del proyecto

```
w2601-estudio-web/
├── server/
│   ├── index.ts              # Express app (API + static serve)
│   └── engine/               # Motor de cálculo para backend (copia de shared/)
├── shared/
│   └── engine/               # Motor de cálculo compartido (types, constants, calculator)
├── src/
│   ├── components/
│   │   ├── charts/           # Gráficos Recharts
│   │   ├── kpi/              # Tarjetas de indicadores
│   │   ├── layout/           # Header, Footer
│   │   └── ui/               # Componentes base
│   ├── sections/             # Portada, Dashboard, Escenarios, etc.
│   ├── store/                # Zustand store
│   ├── context/              # ThemeContext (dark por defecto)
│   ├── hooks/                # useExport, useChartColors
│   ├── App.tsx
│   └── main.tsx
├── server/index.ts           # Entry point Express
├── vite.config.ts            # Vite config + proxy /api
├── tsconfig.server.json      # TS config para backend
└── render.yaml               # Configuración Render Blueprint
```

## 🔌 API Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/health` | Healthcheck |
| POST | `/api/calculate` | Recalcula modelo completo |
| POST | `/api/scenarios` | Devuelve escenarios P/Base/O |
| POST | `/api/sensitivity` | Devuelve matriz de sensibilidad |
| POST | `/api/export/excel` | Genera Excel server-side |
| POST | `/api/export/pdf` | Endpoint reservado (PDF en cliente) |

## ✅ Validación

Los cálculos del motor han sido validados contra el Excel original **W2601PRMC001-R02.xlsx**.

| Indicador | Excel REV2 | Web App |
|-----------|------------|---------|
| VPN | $2,062,321 | $2,062,321 |
| TIR | 72.8% | 72.8% |
| Payback | 1.6 años | 1.6 años |
| CAPEX | $303,561 | $303,561 |
| Ahorro Año 1 | $205,947 | $205,947 |

## 📝 Licencia

Documento confidencial — Uso interno E3PRO Engineering Solutions.
