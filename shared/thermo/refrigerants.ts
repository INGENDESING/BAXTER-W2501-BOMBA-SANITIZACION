// ───────────────────────────────────────────────────────────────
// Base de datos de refrigerantes — 2025BC
// Validación térmica contra condiciones de operación
// ───────────────────────────────────────────────────────────────

import type { RefrigerantData, RefrigerantValidation } from "./types";

export const REFRIGERANTS: RefrigerantData[] = [
  {
    name: "R513A",
    formula: "R1234yf / R134a (56/44)",
    T_crit_C: 96.5,
    P_crit_bar: 40.0,
    GWP: 573,
    ashraeClass: "A1",
    copRange: "2,8 – 3,2",
    notes: "Mezcla zeotrópica HFO/HFC. Refrigerante base congelado REV3. Mayor robustez climática para Cali.",
  },
  {
    name: "R744 (CO₂)",
    formula: "CO₂",
    T_crit_C: 31.1,
    P_crit_bar: 73.8,
    GWP: 1,
    ashraeClass: "A1",
    copRange: "3,0 – 3,5*",
    notes: "Ciclo transcrítico. GWP=1. Diseño 2025BC: P_evap=57,8 bar (T_sat≈22°C), P_gas_cooler=95-97 bar. Fuente fría WFI retorno 70°C → CO₂ superheat 72°C. T_crit=31,1°C bien por debajo de P_evap.",
    isTranscritical: true,
    T_evap_design_C: 22, // T_sat CO₂ a P_evap=57,8 bar (2025BC-DT002 R0 §3.2)
  },
  {
    name: "R717 (NH₃)",
    formula: "NH₃",
    T_crit_C: 132.4,
    P_crit_bar: 113.3,
    GWP: 0,
    ashraeClass: "B2L",
    copRange: "3,2 – 3,8",
    notes: "Tóxico/ligeramente inflamable. ASHRAE 15 impone salas separadas, detectores, EPP — inaceptable para planta farmacéutica sin búnker.",
  },
  {
    name: "R1234ze(Z)",
    formula: "C₃H₂F₄",
    T_crit_C: 150.1,
    P_crit_bar: 35.0,
    GWP: 1,
    ashraeClass: "A2L",
    copRange: "2,8 – 3,3",
    notes: "Temperatura máxima práctica ~85 °C. Insuficiente para 93 °C sin cascada. Inflamabilidad A2L.",
    T_max_practical: 85,
  },
  {
    name: "R1233zd(E)",
    formula: "C₃H₂ClF₃",
    T_crit_C: 166.5,
    P_crit_bar: 36.0,
    GWP: 1,
    ashraeClass: "A1",
    copRange: "2,7 – 3,2",
    notes: "TRL 7–8. Presiones moderadas. Opción de mediano plazo si se valida disponibilidad de compresores.",
  },
  {
    name: "R1336mzz(Z)",
    formula: "C₆H₂F₆",
    T_crit_C: 171.3,
    P_crit_bar: 29.0,
    GWP: 2,
    ashraeClass: "A1",
    copRange: "2,5 – 3,2",
    notes: "Flujos volumétricos muy elevados. TRL 6–7. Requiere compresores de gran desplazamiento.",
  },
];

export function getRefrigerant(name: string): RefrigerantData | undefined {
  return REFRIGERANTS.find((r) => r.name === name);
}

// Pinch térmico mínimo estimado para intercambiadores de placas [K]
const PINCH_MIN_K = 3;

/** Valida un refrigerante contra las temperaturas de condensación y evaporación
 *
 * NOTA: Las temperaturas T_cond_C y T_evap_C son las del AGUA, no del refrigerante.
 * Se aplica PINCH_MIN_K para estimar las temperaturas reales del refrigerante.
 */
export function validateRefrigerant(
  refrigerantName: string,
  T_cond_C: number,
  T_evap_C: number,
  copOperativo: number
): RefrigerantValidation {
  const ref = getRefrigerant(refrigerantName);
  if (!ref) {
    return { viable: false, warnings: ["Refrigerante no encontrado"], copCarnot: 0, marginK: 0 };
  }

  const warnings: string[] = [];
  let viable = true;

  // ── Margen sobre temperatura crítica (con pinch térmico) ──
  // T_cond del refrigerante = T_cond del agua + pinch (lado caliente)
  // T_evap del refrigerante = T_evap del agua − pinch (lado frío)
  const T_cond_refrig = T_cond_C + PINCH_MIN_K;
  const T_evap_refrig = T_evap_C - PINCH_MIN_K;
  const marginK = ref.T_crit_C - T_cond_refrig;

  if (ref.isTranscritical) {
    // Para ciclos transcríticos la temperatura de evaporación del REFRIGERANTE
    // la fija la presión de succión (P_evap), no la temperatura del agua.
    // T_evap_design_C: temperatura de saturación CO₂ a P_evap de diseño.
    // La temperatura del agua (T_evap_refrig) es la FUENTE de calor y debe
    // ser mayor que T_evap_design_C + pinch, lo que es siempre cierto en 2025BC
    // (agua 60°C >> CO₂ evap 22°C).
    const T_evap_co2 = ref.T_evap_design_C ?? T_evap_refrig;

    if (T_evap_co2 >= ref.T_crit_C) {
      warnings.push(
        `${ref.name} transcrítico: temperatura de evaporación CO₂ (${T_evap_co2.toFixed(1)} °C) supera T_crit (${ref.T_crit_C} °C). Operación imposible.`
      );
      viable = false;
    } else {
      const evapMarginK = ref.T_crit_C - T_evap_co2;
      // Verificar que la fuente de calor (agua) esté por encima de T_evap_co2 + pinch
      if (T_evap_refrig < T_evap_co2 + PINCH_MIN_K) {
        warnings.push(
          `Fuente de calor del evaporador (${T_evap_refrig.toFixed(1)} °C) insuficiente — debe superar T_evap CO₂ (${T_evap_co2.toFixed(1)} °C) + pinch ${PINCH_MIN_K} K.`
        );
        viable = false;
      } else {
        warnings.push(
          `${ref.name} transcrítico: T_evap CO₂ ≈ ${T_evap_co2} °C (${evapMarginK.toFixed(1)} K bajo T_crit). Fuente calor agua ${T_evap_refrig.toFixed(1)} °C ✓`
        );
      }
      if (marginK < 0) {
        // Transcrítico: T_cond > T_crit por diseño. El margen negativo es esperado.
        warnings.push(
          `${ref.name} transcrítico: T_cond efectiva (${T_cond_refrig.toFixed(1)} °C) supera T_crit (${ref.T_crit_C} °C) por ${Math.abs(marginK).toFixed(1)} K. Operación supercrítica confirmada — diseño 2025BC.`
        );
      } else if (marginK < 3) {
        warnings.push(
          `${ref.name} transcrítico: margen de solo ${marginK.toFixed(1)} K sobre T_crit. Monitorear degradación del COP en picos de carga.`
        );
      }
    }
  } else {
    // Subcrítico: margen mínimo de 5 K recomendado
    if (marginK < 0) {
      warnings.push(
        `T_cond efectiva (${T_cond_refrig.toFixed(1)} °C) supera T_crit (${ref.T_crit_C} °C). Refrigerante no viable en ciclo subcrítico (pinch ${PINCH_MIN_K} K incluido).`
      );
      viable = false;
    } else if (marginK < 5) {
      warnings.push(
        `Margen térmico de solo ${marginK.toFixed(1)} K sobre T_crit (con pinch ${PINCH_MIN_K} K). Recomendado ≥ 5 K para ciclo subcrítico robusto.`
      );
    }
  }

  // ── Temperatura máxima práctica ──
  if (ref.T_max_practical !== undefined && T_cond_C > ref.T_max_practical) {
    warnings.push(
      `T_cond (${T_cond_C} °C) excede la temperatura máxima práctica del refrigerante (${ref.T_max_practical} °C). Requiere ciclo en cascada.`
    );
    viable = false;
  }

  // ── COP de Carnot (límite termodinámico absoluto) ──
  // Usa temperaturas efectivas del refrigerante (con pinch térmico)
  const T_cond_K = T_cond_refrig + 273.15;
  const T_evap_K = T_evap_refrig + 273.15;
  const deltaT_K = T_cond_K - T_evap_K;

  const copCarnot = deltaT_K > 0 ? T_cond_K / deltaT_K : Infinity;

  // Comparación COP operativo vs Carnot
  if (copOperativo > 0.75 * copCarnot) {
    warnings.push(
      `COP operativo (${copOperativo.toFixed(2)}) supera el 75 % del límite de Carnot (${copCarnot.toFixed(2)}). Irrealista para un ciclo real con una sola etapa.`
    );
  }

  if (copOperativo > copCarnot) {
    warnings.push(
      `COP operativo (${copOperativo.toFixed(2)}) excede el límite de Carnot (${copCarnot.toFixed(2)}). Violación de la 2.ª ley.`
    );
    viable = false;
  }

  // ── Notas adicionales por refrigerante ──
  if (ref.ashraeClass.startsWith("B")) {
    warnings.push(
      `Clasificación ASHRAE ${ref.ashraeClass}: requiere detectores, alarmas y equipos de respiración autónoma según ASHRAE 15.`
    );
  }
  if (ref.ashraeClass === "A2L") {
    warnings.push(
      `Clasificación ASHRAE A2L (ligeramente inflamable): verificar normativa local de instalaciones con refrigerantes inflamables.`
    );
  }

  return { viable, warnings, copCarnot, marginK };
}
