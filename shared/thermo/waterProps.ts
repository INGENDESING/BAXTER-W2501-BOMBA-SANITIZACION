// ───────────────────────────────────────────────────────────────
// Propiedades termodinámicas del agua líquida — 2025BC
// Método: tabla de lookup IAPWS-IF97 + interpolación lineal
// Rango válido: 15–100 °C, presiones 0,5–2,0 bar(a)
// Error estimado vs IAPWS-IF97 exacto: < 0,05 %
//
// NOTA: Para líquido subenfriado a baja presión, el efecto de P en h, cp,
// rho es < 0,01 % en el rango 0,5–2,0 bar(a) (IAPWS-IF97, Region 1).
// Se desprecia en esta implementación simplificada.
// ───────────────────────────────────────────────────────────────

import type { WaterProps } from "./types";

// ── Tabla de datos IAPWS-IF97 (líquido subenfriado, P ≈ 1 bar) ──
// T [°C], ρ [kg/m³], cp [kJ/(kg·K)], h [kJ/kg], μ [mPa·s], k [W/(m·K)]
const WATER_TABLE: [number, number, number, number, number, number][] = [
  [15,  999.103, 4.1855,  63.08,  1.138, 0.595],
  [20,  998.207, 4.1818,  83.91,  1.002, 0.599],
  [25,  997.048, 4.1796, 104.83,  0.890, 0.607],
  [30,  995.650, 4.1781, 125.73,  0.797, 0.615],
  [35,  994.035, 4.1774, 146.63,  0.719, 0.623],
  [40,  992.216, 4.1776, 167.53,  0.653, 0.631],
  [45,  990.216, 4.1784, 188.43,  0.596, 0.638],
  [50,  988.039, 4.1797, 209.34,  0.547, 0.644],
  [55,  985.698, 4.1814, 230.26,  0.504, 0.650],
  [60,  983.216, 4.1834, 251.18,  0.467, 0.655],
  [65,  980.586, 4.1856, 272.12,  0.434, 0.660],
  [70,  977.808, 4.1880, 293.07,  0.404, 0.664],
  [75,  974.864, 4.1906, 314.03,  0.378, 0.668],
  [80,  971.803, 4.1933, 335.01,  0.355, 0.672],
  [85,  968.620, 4.1962, 356.01,  0.334, 0.675],
  [90,  965.323, 4.1993, 377.02,  0.315, 0.677],
  [95,  961.908, 4.2026, 398.06,  0.298, 0.680],
  [100, 958.366, 4.2061, 419.10,  0.282, 0.682],
];

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function interpolate(T_C: number): { rho: number; cp: number; h: number; mu_mPas: number; k: number; wasClamped: boolean } {
  // Clamp suave a los límites de la tabla para evitar ruptura de la UI
  const T_clamped = Math.max(15, Math.min(100, T_C));
  const wasClamped = T_C !== T_clamped;
  if (wasClamped) {
    // eslint-disable-next-line no-console
    console.warn(`Temperatura ${T_C}°C clampada a ${T_clamped}°C (fuera de rango 15–100 °C)`);
  }
  const T = T_clamped;

  // Encontrar el intervalo
  let i = 0;
  while (i < WATER_TABLE.length - 1 && WATER_TABLE[i + 1][0] <= T) {
    i++;
  }

  const [T_lo, rho_lo, cp_lo, h_lo, mu_lo, k_lo] = WATER_TABLE[i];
  const [T_hi, rho_hi, cp_hi, h_hi, mu_hi, k_hi] = WATER_TABLE[i + 1];

  const t = (T - T_lo) / (T_hi - T_lo);

  return {
    rho: lerp(rho_lo, rho_hi, t),
    cp: lerp(cp_lo, cp_hi, t),
    h: lerp(h_lo, h_hi, t),
    mu_mPas: lerp(mu_lo, mu_hi, t),
    k: lerp(k_lo, k_hi, t),
    wasClamped,
  };
}

/** Presión atmosférica en función de la altitud [msnm] — ISO 2533 */
export function calcAtmPressure(altitud_msnm: number): number {
  // P [kPa] = 101.325 × (1 − 2.25577×10⁻⁵ × H)^5.2559
  const P_kPa = 101.325 * Math.pow(1 - 0.0000225577 * altitud_msnm, 5.2559);
  return P_kPa / 100.0; // convertir a bar
}

/** Propiedades termodinámicas del agua líquida a T y P_g
 *
 * El efecto de la presión manométrica en las propiedades del líquido
 * subenfriado se desprecia (< 0,01 % vs IAPWS-IF97 exacto) en el rango
 * de operación de este proyecto (P_abs ≈ 0,9 bar(a)).
 *
 * @returns WaterProps con flag wasClamped si T_C quedó fuera de 15–100 °C.
 */
export function waterProps(T_C: number, P_g_bar: number, altitud_msnm: number): WaterProps {
  const P_atm_bar = calcAtmPressure(altitud_msnm);
  const P_abs_bar = P_atm_bar + P_g_bar;

  const interp = interpolate(T_C);

  return {
    T_C: interp.wasClamped ? (T_C > 100 ? 100 : 15) : T_C,
    P_bar: P_abs_bar,
    rho: interp.rho,
    mu_cP: interp.mu_mPas, // 1 mPa·s = 1 cP para agua
    k: interp.k,
    cp: interp.cp,
    h: interp.h,
    wasClamped: interp.wasClamped,
  };
}

// ── Validación rápida contra caso base (ejecutar en test) ──
// waterProps(58.8, 0.6, 997)  →  rho≈983.78, h≈246.19
// waterProps(93.0, 0.6, 997)  →  rho≈963.49, h≈389.55
// waterProps(28.89, 0.0, 997) →  rho≈995.98, h≈121.16
// waterProps(20.89, 0.0, 997) →  rho≈998.02, h≈87.71
// Diferencias < 0.1 % vs gen_balance_r03.py (aceptable para aplicación web)
