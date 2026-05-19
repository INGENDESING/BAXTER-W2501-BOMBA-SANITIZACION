// ───────────────────────────────────────────────────────────────
// Tipos del motor termodinámico — Balance M&E 2025BC
// ───────────────────────────────────────────────────────────────

/** Propiedades termodinámicas de una corriente de agua líquida */
export interface WaterProps {
  T_C: number;      // Temperatura [°C]
  P_bar: number;    // Presión absoluta [bar(a)]
  rho: number;      // Densidad [kg/m³]
  mu_cP: number;    // Viscosidad dinámica [cP]
  k: number;        // Conductividad térmica [W/(m·K)]
  cp: number;       // Calor específico [kJ/(kg·°C)]
  h: number;        // Entalpía específica [kJ/kg]
  wasClamped?: boolean; // true si T_C estuvo fuera del rango 15–100 °C
}

/** Corriente del proceso con flujo y propiedades */
export interface Stream {
  name: string;           // C1, C2, C3, C4
  description: string;
  T_C: number;
  P_g_bar: number;        // Presión manométrica [barg]
  volFlow: number;        // Caudal volumétrico [m³/h]
  massFlow: number;       // Flujo másico [kg/h]
  props: WaterProps;
  heatFlow: number;       // M × h [kJ/h]
}

/** Resultado completo del balance de materia y energía */
export interface BalanceResult {
  streams: Stream[];
  Q_cond_kw: number;      // Calor entregado al lado caliente [kW]
  Q_evap_kw: number;      // Calor extraído del lado frío [kW]
  W_comp_kw: number;      // Potencia eléctrica del compresor [kW]
  COP_calc: number;       // COP calculado [-]
  Q_perdidas_kw: number;  // Pérdidas térmicas del tanque [kW]
  Q_disp_kw: number;      // Potencia térmica disponible (incl. pérdidas) [kW]
  W_comp_disp_kw: number; // Potencia eléctrica incluyendo pérdidas [kW]
  COP_disp: number;       // COP disponible (incl. pérdidas) [-]
  massClosurePct: number; // Error de cierre de masa [%]
  energyClosurePct: number; // Error de cierre de energía [%]
  P_atm_bar: number;      // Presión atmosférica calculada [bar(a)]
  // ── Métricas de refrigeración ──
  TR_evap: number;        // Toneladas de refrigeración del evaporador [TR]
  kw_per_TR: number;      // Potencia eléctrica por TR [kW/TR]
  costo_bc_refrig_usd_año: number; // Costo eléctrico BC como refrigerador [USD/año]
  costo_chiller_equiv_usd_año: number; // Costo chiller eléctrico estándar (COP_R=3,5) [USD/año]
  ahorro_vs_chiller_usd_año: number;  // Ahorro vs chiller estándar [USD/año]
}

/** Parámetros de entrada para el cálculo del balance */
export interface ThermoParams {
  T_c1: number;           // WFI Tanque 7 → Gas Cooler (entrada) [°C]
  T_c2: number;           // WFI Gas Cooler → Distribución (salida) [°C]
  T_c3: number;           // WFI retorno → Evaporador (entrada) [°C]
  T_c4: number;           // WFI Evaporador → Tanque 7 (salida) [°C]
  P_g_caliente: number;   // Presión manométrica lado caliente [barg]
  P_g_frio: number;       // Presión manométrica lado frío [barg]
  V_c1: number;           // Caudal volumétrico C1 [m³/h] (output del cálculo)
  V_c3: number;           // Caudal volumétrico C3 [m³/h] (output del cálculo)
  altitud_msnm: number;   // Altitud del sitio [msnm]
  incluirPerdidas: boolean;
  Q_perdidas_kw: number;  // Pérdidas térmicas [kW]
  copOperativo: number;   // COP operativo
  Q_diseño_kw: number;    // Carga térmica base del proceso (invariante) [kW]
}

/** Datos de un refrigerante */
export interface RefrigerantData {
  name: string;
  formula: string;
  T_crit_C: number;       // Temperatura crítica [°C]
  P_crit_bar: number;     // Presión crítica [bar]
  GWP: number;
  ashraeClass: string;    // A1, A2L, B2L, etc.
  copRange: string;       // Rango típico de COP
  notes: string;
  isTranscritical?: boolean;
  T_max_practical?: number;    // Temperatura máxima práctica [°C] si aplica
  T_evap_design_C?: number;    // T saturación del refrigerante en el evaporador a presión de diseño [°C]
                               // Solo para transcríticos donde la T_agua no representa la T_refrig
}

/** Resultado de validación térmica de un refrigerante */
export interface RefrigerantValidation {
  viable: boolean;
  warnings: string[];
  copCarnot: number;
  marginK: number;        // Margen T_crit - T_cond [K]
}

/** Estado termodinámico completo para el store */
export interface ThermoState {
  params: ThermoParams;
  result: BalanceResult;
  refrigerant: string;
  refrigerantValidation: RefrigerantValidation;
}
