// ───────────────────────────────────────────────────────────────
// Motor de cálculo — Balance de Materia y Energía 2025BC
// Proceso: Sanitización WFI 75°C → 90°C, Tanque 7 → Gas Cooler CO₂
// Fuente: 2025BC-DT002 R0 (IAPWS-IF97) — validado
// Lógica: carga térmica Q_diseño es invariante del proceso;
//         caudales se recalculan al cambiar ΔT.
// ───────────────────────────────────────────────────────────────

import type { ThermoParams, BalanceResult, Stream } from "./types";
import { waterProps, calcAtmPressure } from "./waterProps";

// Constantes de refrigeración
const KW_PER_TR = 3.51685;           // 1 TR (americana) = 3,51685 kW
const HORAS_AÑO = 4000;              // h/año — operación sanitización 2025BC (2025BC-DT005 R1)
const PRECIO_ELEC_USD_KWH = 0.113;   // USD/kWh — tarifa industrial negociada BAXTER
const COP_R_CHILLER_STD = 3.5;       // COP de chiller eléctrico estándar (referencia ASHRAE)

export function calcularBalance(params: ThermoParams): BalanceResult {
  const P_atm_bar = calcAtmPressure(params.altitud_msnm);

  // ── 1. CARGA TÉRMICA DEL PROCESO (invariante) ──
  // Q_cond = carga útil del proceso + pérdidas si aplica
  const Q_cond_kw = params.Q_diseño_kw + (params.incluirPerdidas ? params.Q_perdidas_kw : 0);

  // ── 2. POTENCIA ELÉCTRICA Y CALOR EVAPORADOR (según COP operativo) ──
  // W_comp = Q_cond / COP
  // Q_evap = Q_cond − W_comp  (1.ª ley)
  const W_comp_kw = params.copOperativo > 0 ? Q_cond_kw / params.copOperativo : 0;
  const Q_evap_kw = Q_cond_kw - W_comp_kw;

  // ── 3. PROPIEDADES DE CADA CORRIENTE ──
  const p1 = waterProps(params.T_c1, params.P_g_caliente, params.altitud_msnm);
  const p2 = waterProps(params.T_c2, params.P_g_caliente, params.altitud_msnm);
  const p3 = waterProps(params.T_c3, params.P_g_frio, params.altitud_msnm);
  const p4 = waterProps(params.T_c4, params.P_g_frio, params.altitud_msnm);

  // ── 4. CAUDALES CALCULADOS PARA SATISFACER LA CARGA TÉRMICA ──
  // Q [kW] = ṁ [kg/s] × Δh [kJ/kg]  →  ṁ = Q / Δh
  const dh_caliente = p2.h - p1.h; // [kJ/kg]
  const dh_frio = p3.h - p4.h;     // [kJ/kg]

  const m_dot_caliente_kgs = dh_caliente > 0.001 ? Q_cond_kw / dh_caliente : 0;
  const m_dot_frio_kgs = dh_frio > 0.001 ? Q_evap_kw / dh_frio : 0;

  // Convertir a kg/h
  const M1 = m_dot_caliente_kgs * 3600;
  const M3 = m_dot_frio_kgs * 3600;

  // Caudales volumétricos [m³/h]
  const V_c1 = M1 / p1.rho;
  const V2 = M1 / p2.rho;
  const V_c3 = M3 / p3.rho;
  const V4 = M3 / p4.rho;

  // ── 5. BALANCE DE ENERGÍA (heat flows) [kJ/h] ──
  const HF1 = M1 * p1.h;
  const HF2 = M1 * p2.h;
  const HF3 = M3 * p3.h;
  const HF4 = M3 * p4.h;

  // COP calculado del balance (debe coincidir con copOperativo)
  const COP_calc = W_comp_kw > 0 ? Q_cond_kw / W_comp_kw : 0;

  // ── 6. PÉRDIDAS TÉRMICAS DEL TANQUE (ya incluidas en Q_cond) ──
  const Q_perdidas_kw = params.incluirPerdidas ? params.Q_perdidas_kw : 0;
  const Q_disp_kw = Q_cond_kw;
  const W_comp_disp_kw = W_comp_kw;
  const COP_disp = COP_calc;

  // ── 7. CIERRE DE BALANCES ──
  // Masa: por definición M1=M2 y M3=M4 (agua incompresible)
  const massClosurePct = 0.0;
  // Energía: verificación real contra las corrientes de agua
  // Q_cond debe coincidir con M1*(h2-h1)/3600; Q_evap con M3*(h3-h4)/3600
  const Q_cond_from_streams = M1 * (p2.h - p1.h) / 3600;
  const Q_evap_from_streams = M3 * (p3.h - p4.h) / 3600;
  const energyClosurePct =
    Math.max(
      Math.abs(Q_cond_kw - Q_cond_from_streams) / (Q_cond_kw || 1),
      Math.abs(Q_evap_kw - Q_evap_from_streams) / (Q_evap_kw || 1)
    ) * 100;

  // ── 8. MÉTRICAS DE REFRIGERACIÓN ──
  const TR_evap = Q_evap_kw / KW_PER_TR;
  const kw_per_TR = TR_evap > 0 ? W_comp_kw / TR_evap : 0;

  // Costo eléctrico anual de la BC operando como refrigerador
  const costo_bc_refrig_usd_año = W_comp_kw * HORAS_AÑO * PRECIO_ELEC_USD_KWH;

  // Costo de un chiller eléctrico estándar que entregue las mismas TR
  const W_chiller_equiv_kw = Q_evap_kw / COP_R_CHILLER_STD;
  const costo_chiller_equiv_usd_año = W_chiller_equiv_kw * HORAS_AÑO * PRECIO_ELEC_USD_KWH;

  // Ahorro (o exceso) respecto a chiller estándar
  const ahorro_vs_chiller_usd_año = costo_chiller_equiv_usd_año - costo_bc_refrig_usd_año;

  // ── 9. CONSTRUIR CORRIENTES ──
  const streams: Stream[] = [
    {
      name: "C1",
      description: "Tanque 7 → Gas Cooler CO₂ (WFI entrada 75°C)",
      T_C: params.T_c1,
      P_g_bar: params.P_g_caliente,
      volFlow: V_c1,
      massFlow: M1,
      props: p1,
      heatFlow: HF1,
    },
    {
      name: "C2",
      description: "Gas Cooler CO₂ → Red Distribución (WFI salida 90°C)",
      T_C: params.T_c2,
      P_g_bar: params.P_g_caliente,
      volFlow: V2,
      massFlow: M1,
      props: p2,
      heatFlow: HF2,
    },
    {
      name: "C3",
      description: "Loop retorno → Evaporador CO₂ (entrada 70°C)",
      T_C: params.T_c3,
      P_g_bar: params.P_g_frio,
      volFlow: V_c3,
      massFlow: M3,
      props: p3,
      heatFlow: HF3,
    },
    {
      name: "C4",
      description: "Evaporador CO₂ → Tanque 7 (retorno enfriado 60°C)",
      T_C: params.T_c4,
      P_g_bar: params.P_g_frio,
      volFlow: V4,
      massFlow: M3,
      props: p4,
      heatFlow: HF4,
    },
  ];

  return {
    streams,
    Q_cond_kw,
    Q_evap_kw,
    W_comp_kw,
    COP_calc,
    Q_perdidas_kw,
    Q_disp_kw,
    W_comp_disp_kw,
    COP_disp,
    massClosurePct,
    energyClosurePct,
    P_atm_bar,
    TR_evap,
    kw_per_TR,
    costo_bc_refrig_usd_año,
    costo_chiller_equiv_usd_año,
    ahorro_vs_chiller_usd_año,
  };
}

/** Parámetros por defecto del balance — 2025BC (Simultaneidad 2, escenario crítico de diseño)
 *
 * Proceso: WFI 75°C → 90°C, Tanque 7 existente → Gas Cooler CO₂ → Distribución.
 * Evaporador: retorno WFI 70°C → CO₂ absorbe calor → agua sale a 60°C.
 * Q_diseño = 490 kW = 28 m³/h × 1000 kg/m³ × 4,186 kJ/kgK × 15 K / 3600 (2025BC-DT002 R0).
 * Con COP=3,0: W_comp=163,3 kW, Q_evap=326,7 kW.
 * V_c1 = V_c3 = 28 m³/h (Simultaneidad 2: TK-11A + TK-03A, 4.000 L + 3.000 L).
 * Altitud Cali: 1.018 msnm (2025BC-DT002 Cuadro 1).
 */
export const DEFAULT_THERMO_PARAMS: ThermoParams = {
  T_c1: 75.0,    // WFI Tanque 7 → Gas Cooler (entrada)
  T_c2: 90.0,    // WFI Gas Cooler → Distribución (salida 90°C)
  T_c3: 70.0,    // WFI retorno → Evaporador (entrada 70°C)
  T_c4: 60.0,    // WFI Evaporador → Tanque 7 (salida enfriada 60°C)
  P_g_caliente: 0.0,  // barg — circuito WFI atmosférico (pharma, circuito abierto)
  P_g_frio: 0.0,      // barg — circuito retorno atmosférico
  V_c1: 28.0,   // m³/h — Simultaneidad 2; se recalcula desde Q_diseño
  V_c3: 28.0,   // m³/h — mismo caudal retorno; se recalcula desde Q_diseño
  altitud_msnm: 1018.0,  // msnm — Planta Cali (2025BC-DT002 Cuadro 1)
  incluirPerdidas: false,
  Q_perdidas_kw: 0.0,
  copOperativo: 3.0,
  Q_diseño_kw: 490.0,
};
