// ───────────────────────────────────────────────────────────────
// Motor de cálculo — Balance de Materia y Energía 2025BC
// Proceso: Circuitos abiertos independientes
//   Lado caliente: Tanque 7 (75°C) → Gas Cooler CO₂ → 90°C → Consumo sanitización
//   Lado frío:     Piscina (28.9°C) → Evaporador CO₂ → 15°C → Descarte/recirculación
// Fuente: 2025BC-DT002 R0 (IAPWS-IF97) — validado
// ───────────────────────────────────────────────────────────────

import type { ThermoParams, BalanceResult, Stream } from "./types";
import { waterProps, calcAtmPressure } from "./waterProps";

// Constantes de refrigeración
const KW_PER_TR = 3.51685;           // 1 TR (americana) = 3,51685 kW
const HORAS_AÑO = 4000;              // h/año — operación sanitización 2025BC (2025BC-DT005 R1)
const PRECIO_ELEC_USD_KWH = 0.113;   // USD/kWh — tarifa industrial negociada BAXTER
const COP_R_CHILLER_STD = 3.5;       // COP de chiller eléctrico estándar (referencia ASHRAE)
// cp y rho se calculan dinámicamente vía IAPWS-IF97 (waterProps.ts)

export function calcularBalance(params: ThermoParams): BalanceResult {
  const P_atm_bar = calcAtmPressure(params.altitud_msnm);

  // ── 1. CARGA TÉRMICA DEL PROCESO (invariante) ──
  const Q_cond_kw = params.Q_diseño_kw + (params.incluirPerdidas ? params.Q_perdidas_kw : 0);

  // ── 2. POTENCIA ELÉCTRICA Y CALOR EVAPORADOR (según COP operativo) ──
  const W_comp_kw = params.copOperativo > 0 ? Q_cond_kw / params.copOperativo : 0;
  const Q_evap_kw = Q_cond_kw - W_comp_kw;

  // ── 3. PROPIEDADES DE CADA CORRIENTE ──
  const p1 = waterProps(params.T_c1, params.P_g_caliente, params.altitud_msnm);
  const p2 = waterProps(params.T_c2, params.P_g_caliente, params.altitud_msnm);
  const p_p1 = waterProps(params.T_piscina_in, params.P_g_frio, params.altitud_msnm);
  const p_p2 = waterProps(params.T_piscina_out, params.P_g_frio, params.altitud_msnm);

  // ── 4. CAUDALES CALCULADOS ──
  // Lado caliente (sanitización): Q_cond = ṁ × cp × ΔT
  const dh_caliente = p2.h - p1.h; // [kJ/kg]
  const m_dot_caliente_kgs = dh_caliente > 0.001 ? Q_cond_kw / dh_caliente : 0;
  const M_caliente = m_dot_caliente_kgs * 3600; // [kg/h]
  const V_caliente = M_caliente / p1.rho;       // [m³/h]

  // Lado frío (piscina): Q_evap = ṁ × cp × ΔT
  const dh_piscina = p_p1.h - p_p2.h; // [kJ/kg] (entrada - salida porque se enfría)
  const m_dot_piscina_kgs = dh_piscina > 0.001 ? Q_evap_kw / dh_piscina : 0;
  const M_piscina = m_dot_piscina_kgs * 3600; // [kg/h]
  const V_piscina = M_piscina / p_p1.rho;     // [m³/h]

  // ── 5. BALANCE DE ENERGÍA (heat flows) [kJ/h] ──
  const HF1 = M_caliente * p1.h;
  const HF2 = M_caliente * p2.h;
  const HF_p1 = M_piscina * p_p1.h;
  const HF_p2 = M_piscina * p_p2.h;

  // COP calculado del balance
  const COP_calc = W_comp_kw > 0 ? Q_cond_kw / W_comp_kw : 0;

  // ── 6. PÉRDIDAS TÉRMICAS DEL TANQUE ──
  const Q_perdidas_kw = params.incluirPerdidas ? params.Q_perdidas_kw : 0;
  const Q_disp_kw = Q_cond_kw;
  const W_comp_disp_kw = W_comp_kw;
  const COP_disp = COP_calc;

  // ── 7. CIERRE DE BALANCES ──
  const massClosurePct = 0.0;
  const Q_cond_from_streams = M_caliente * (p2.h - p1.h) / 3600;
  const Q_evap_from_streams = M_piscina * (p_p1.h - p_p2.h) / 3600;
  const energyClosurePct =
    Math.max(
      Math.abs(Q_cond_kw - Q_cond_from_streams) / (Q_cond_kw || 1),
      Math.abs(Q_evap_kw - Q_evap_from_streams) / (Q_evap_kw || 1)
    ) * 100;

  // ── 8. MÉTRICAS DE REFRIGERACIÓN ──
  const TR_evap = Q_evap_kw / KW_PER_TR;
  const kw_per_TR = TR_evap > 0 ? W_comp_kw / TR_evap : 0;

  const costo_bc_refrig_usd_año = W_comp_kw * HORAS_AÑO * PRECIO_ELEC_USD_KWH;
  const W_chiller_equiv_kw = Q_evap_kw / COP_R_CHILLER_STD;
  const costo_chiller_equiv_usd_año = W_chiller_equiv_kw * HORAS_AÑO * PRECIO_ELEC_USD_KWH;
  const ahorro_vs_chiller_usd_año = costo_chiller_equiv_usd_año - costo_bc_refrig_usd_año;

  // ── 9. CONSTRUIR CORRIENTES ──
  const streams: Stream[] = [
    {
      name: "C1",
      description: "Tanque 7 → Gas Cooler CO₂ (WFI entrada 75°C)",
      T_C: params.T_c1,
      P_g_bar: params.P_g_caliente,
      volFlow: V_caliente,
      massFlow: M_caliente,
      props: p1,
      heatFlow: HF1,
    },
    {
      name: "C2",
      description: "Gas Cooler CO₂ → Distribución Sanitización (WFI salida 90°C, consumo)",
      T_C: params.T_c2,
      P_g_bar: params.P_g_caliente,
      volFlow: V_caliente,
      massFlow: M_caliente,
      props: p2,
      heatFlow: HF2,
    },
    {
      name: "P1",
      description: "Piscina → Evaporador CO₂ (entrada 28.9°C)",
      T_C: params.T_piscina_in,
      P_g_bar: params.P_g_frio,
      volFlow: V_piscina,
      massFlow: M_piscina,
      props: p_p1,
      heatFlow: HF_p1,
    },
    {
      name: "P2",
      description: "Evaporador CO₂ → Salida agua fría (15°C)",
      T_C: params.T_piscina_out,
      P_g_bar: params.P_g_frio,
      volFlow: V_piscina,
      massFlow: M_piscina,
      props: p_p2,
      heatFlow: HF_p2,
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
    volFlow_sanitizacion_m3h: V_caliente,
    volFlow_piscina_m3h: V_piscina,
  };
}

/** Parámetros por defecto del balance — 2025BC (Simultaneidad 2)
 *
 * Lado caliente: Tanque 7 (75°C) → Gas Cooler CO₂ → 90°C → Consumo sanitización
 * Lado frío: Piscina (28.9°C) → Evaporador CO₂ → 15°C → Descarte/recirculación
 * Q_diseño = 490 kW → Q_evap = 327 kW (COP = 3.0)
 * Caudal piscina calculado: ṁ = 327 / (4.186 × 13.9) ≈ 5.62 kg/s ≈ 20.2 m³/h
 * Altitud Cali: 1.018 msnm (2025BC-DT002 Cuadro 1)
 */
export const DEFAULT_THERMO_PARAMS: ThermoParams = {
  T_c1: 75.0,           // WFI Tanque 7 → Gas Cooler (entrada)
  T_c2: 90.0,           // WFI Gas Cooler → Distribución (salida 90°C, consumo)
  T_piscina_in: 28.9,   // Piscina → Evaporador (entrada 28.9°C)
  T_piscina_out: 15.0,  // Evaporador → Salida agua fría (15°C)
  P_g_caliente: 0.0,    // barg — circuito WFI atmosférico
  P_g_frio: 0.0,        // barg — circuito piscina atmosférico
  altitud_msnm: 1018.0, // msnm — Planta Cali (2025BC-DT002 Cuadro 1)
  incluirPerdidas: false,
  Q_perdidas_kw: 0.0,
  copOperativo: 3.0,
  Q_diseño_kw: 490.0,
};
