// Fuente: 2025BC-MC001 REV6.xlsx + 2025BC-DT005 R1 ESTUDIO TECNICO ECONOMICO
// Proyecto: Sistema Bomba de Calor Transcrítica CO₂ — Sanitización
// Cliente: Laboratorios BAXTER S.A., Planta Cali, Colombia
import type { ProjectParams, Scenario, CapexItem, OpexFactor } from "./types";

// ── CAPEX ─────────────────────────────────────────────────────────────────────
// Valores FOB en USD. Fuente: 2025BC-MC001 REV6.xlsx, hoja CAPEX_DET.
// Cantidades según PDF Cuadro 11 (2025BC-DT005 R1, p.20). Subtotal = $536,825; +8% = $579,771.
// Los ítems con cantidad=0 están incluidos en el precio del sistema principal o son fase futura.
export const CAPEX_ITEMS: CapexItem[] = [
  // Equipos principales
  { concepto: "Sistema bomba calor transcrítica CO₂ completo", cantidad: 1, costoUnitario: 285000, categoria: "Equipos principales" },
  // Instrumentación y control (21 CFR Part 11 / ASME BPE)
  { concepto: "PLC Siemens S7-1500 (SIL2)", cantidad: 1, costoUnitario: 45000, categoria: "Instrumentación y control" },
  { concepto: "SCADA WinCC + módulo 21 CFR Part 11", cantidad: 0, costoUnitario: 10000, categoria: "Instrumentación y control" },
  { concepto: "Sensores temperatura certificados (10×)", cantidad: 0, costoUnitario: 1200, categoria: "Instrumentación y control" },
  { concepto: "Caudalímetros certificados (3×)", cantidad: 0, costoUnitario: 4000, categoria: "Instrumentación y control" },
  { concepto: "Transductores presión SIL2 (4×)", cantidad: 4, costoUnitario: 2800, categoria: "Instrumentación y control" },
  { concepto: "Analizadores calidad agua (2×)", cantidad: 2, costoUnitario: 8500, categoria: "Instrumentación y control" },
  // Sistemas auxiliares (ASME BPE — acero inoxidable 316L)
  { concepto: "Tuberías AISI 316L sanitarias (120 m)", cantidad: 120, costoUnitario: 120, categoria: "Sistemas auxiliares" },
  { concepto: "Válvulas sanitarias AISI 316L (15×)", cantidad: 3, costoUnitario: 5800, categoria: "Sistemas auxiliares" },
  { concepto: "Conexiones y accesorios ASME BPE", cantidad: 1, costoUnitario: 3000, categoria: "Sistemas auxiliares" },
  { concepto: "Aislamiento térmico certificado (45 m²)", cantidad: 45, costoUnitario: 85, categoria: "Sistemas auxiliares" },
  // Ingeniería
  { concepto: "Ingeniería conceptual (240 h)", cantidad: 0, costoUnitario: 30, categoria: "Ingeniería" },
  { concepto: "Ingeniería básica (680 h)", cantidad: 0, costoUnitario: 30, categoria: "Ingeniería" },
  { concepto: "Ingeniería de detalle (1 200 h)", cantidad: 0, costoUnitario: 30, categoria: "Ingeniería" },
  { concepto: "Gestión de proyecto", cantidad: 0, costoUnitario: 10000, categoria: "Ingeniería" },
  // Instalación
  { concepto: "Obra civil", cantidad: 1, costoUnitario: 10000, categoria: "Instalación" },
  { concepto: "Instalación mecánica", cantidad: 1, costoUnitario: 35000, categoria: "Instalación" },
  { concepto: "Instalación eléctrica (tablero SIL2 + fuerza)", cantidad: 1, costoUnitario: 50000, categoria: "Instalación" },
  { concepto: "Integración hidráulica", cantidad: 1, costoUnitario: 10000, categoria: "Instalación" },
  // Puesta en marcha y validación (GMP)
  { concepto: "Commissioning y arranque supervisado", cantidad: 1, costoUnitario: 15000, categoria: "Puesta en marcha" },
  { concepto: "Validación IQ/OQ/PQ", cantidad: 1, costoUnitario: 20000, categoria: "Puesta en marcha" },
  { concepto: "Mapeo térmico", cantidad: 0, costoUnitario: 18000, categoria: "Puesta en marcha" },
  { concepto: "Capacitación técnica", cantidad: 0, costoUnitario: 15000, categoria: "Puesta en marcha" },
  { concepto: "Soporte técnico primer año", cantidad: 0, costoUnitario: 12000, categoria: "Puesta en marcha" },
];

export const CONTINGENCIA_PCT = 0.08;
export const ESCALACION_PCT = 0.00;

// ── OPEX ──────────────────────────────────────────────────────────────────────
// Valores en USD/año. Fuente: 2025BC-MC001 REV6.xlsx, hoja OPEX_DET.
// "Costo energía" y "Emisiones CO₂" son valores del estudio de proceso
// (2025BC-DT005 R1); no se recalculan dinámicamente. Todos los demás factores
// escalan con ratio = (cargaKW × horasAnio) / (490 × 4 000) en calculator.ts.
// "Operador especializado" es costo fijo (salario); queda excluido del ratio.
export const OPEX_BASE_FACTORS: OpexFactor[] = [
  { concepto: "Costo energía", gas: 76342, bc: 59664 },
  { concepto: "Preventivo", gas: 18000, bc: 8500 },
  { concepto: "Correctivo", gas: 12000, bc: 4200 },
  { concepto: "Inspecciones", gas: 8500, bc: 3200 },
  { concepto: "Químicos caldera", gas: 6500, bc: 0 },
  { concepto: "Agua WFI reposición", gas: 15680, bc: 2140 },
  { concepto: "Análisis calidad", gas: 3200, bc: 1800 },
  { concepto: "Operador especializado", gas: 24000, bc: 0 },
  { concepto: "Supervisión", gas: 8000, bc: 4000 },
  { concepto: "Seguros", gas: 4200, bc: 2800 },
  { concepto: "Certificaciones GMP", gas: 3500, bc: 2100 },
  { concepto: "Emisiones CO₂", gas: 7995, bc: 2165 },
  { concepto: "Gestión residuos", gas: 1500, bc: 250 },
];

// ── PARÁMETROS POR DEFECTO ────────────────────────────────────────────────────
// Fuente: 2025BC-MC001 REV6.xlsx, hoja DEFAULTS + INPUTS.
export const DEFAULT_PARAMS: ProjectParams = {
  cargaKW: 490,                  // kW térmicos de diseño (DEFAULTS, hoja INPUTS)
  cargaDiseno: 490,              // kW nominales de la bomba de calor
  cop: 3.0,                      // COP conservador [Neška, 2002, doi:10.1016/S0140-7007(01)00098-9]
  horasAnio: 4000,               // h/año operación sanitización (DEFAULTS)
  precioElec: 0.113,             // USD/kWh — tarifa industrial negociada (DEFAULTS)
  precioGas: 4000.0 / 10.5 / 4300.0, // USD/kWh eq — referencia 4 000 COP/m³; no drive OPEX (ver OPEX_BASE_FACTORS)
  eficCaldera: 0.79,             // eficiencia caldera pirotubular referencia
  pcsGas: 10.5,                  // kWh/m³ — PCS gas natural Colombia (UPME 2024)
  wacc: 0.08,                    // tasa descuento nominal (DEFAULTS)
  escalaOpex: 0.05,              // escalamiento anual ahorro (DEFAULTS)
  tirObj: 0.08,                  // TIR objetivo semáforo (DEFAULTS)
  horizonte: 15,                 // años (DEFAULTS)
  valorResidualPct: 0.00,        // Excel Python DEFAULTS (l.64) = 0.00; PDF DT005 R1 Cuadro 13 dice 0.15 — conflicto documentado
  capexMult: 1.0,
  tasaImpuesto: 0.0,
  capexItems: CAPEX_ITEMS,
  opexFactors: OPEX_BASE_FACTORS,
  contingenciaPct: CONTINGENCIA_PCT,
  escalacionPct: ESCALACION_PCT,
};

// ── ESCENARIOS ────────────────────────────────────────────────────────────────
export const SCENARIOS: Scenario[] = [
  { nombre: "Pesimista", capexMult: 1.10, escalamiento: 0.03, wacc: 0.10, valorResidual: 0.00 },
  { nombre: "Base",      capexMult: 1.00, escalamiento: 0.05, wacc: 0.08, valorResidual: 0.00 },  // Excel Python SCENARIOS (l.93) = 0.00; PDF Cuadro 13 dice 0.15 — conflicto
  { nombre: "Optimista", capexMult: 0.90, escalamiento: 0.07, wacc: 0.06, valorResidual: 0.15 },
];

// ── FACTORES AMBIENTALES ──────────────────────────────────────────────────────
// Fuentes: 2025BC-DT005 R1, Sección 6.1.1 (Cuadro 15)
// Gas natural: 0.202 kg CO₂/kWh × 10.5 kWh/m³ = 2.121 kg/m³
// Electricidad Colombia: promedio matriz energética 2025
// Árboles: 80 kg CO₂/año árbol maduro → 1000 kg/ton ÷ 80 = 12.5 árboles/ton CO₂
export const FACTOR_CO2_GAS  = 2.121;  // kg CO₂ / m³ gas natural (0.202 kg/kWh × 10.5 kWh/m³)
export const FACTOR_CO2_ELEC = 0.164;  // kg CO₂ / kWh eléctrico (red Colombia, promedio 2025)
export const FACTOR_ARBOLES  = 12.5;   // árboles / t CO₂ (árbol maduro 80 kg CO₂/año, PDF p.23)
export const PRECIO_TON_CO2  = 25;     // USD / t CO₂ (mercado voluntario referencia)
