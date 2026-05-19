import { create } from "zustand";
import type { ThermoParams, ThermoState } from "../../shared/thermo/types";
import { calcularBalance, DEFAULT_THERMO_PARAMS } from "../../shared/thermo/balanceEngine";
import { validateRefrigerant } from "../../shared/thermo/refrigerants";

interface ThermoStore extends ThermoState {
  setT_c1: (t: number) => void;
  setDeltaTCaliente: (deltaT: number) => void;
  setT_piscina_in: (t: number) => void;
  setTempSalidaPiscina: (t: number) => void;
  setCOP: (cop: number) => void;
  setRefrigerant: (name: string) => void;
  togglePerdidas: () => void;
  setPerdidas: (q: number) => void;
  setQDiseño: (q: number) => void;
  resetParams: () => void;
  syncToEconomic: () => { cargaKW: number; cop: number } | null;
}

function computeState(params: ThermoParams, refrigerant: string): ThermoState {
  try {
    const result = calcularBalance(params);
    const validation = validateRefrigerant(
      refrigerant,
      params.T_c2,
      params.T_piscina_out,
      params.copOperativo
    );
    return { params, result, refrigerant, refrigerantValidation: validation };
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Error en motor termodinámico:", err);
    // Fallback: usar parámetros seguros
    const fallbackParams = { ...params, T_c2: 93.0, T_piscina_out: 20.0 };
    const fallbackResult = calcularBalance(fallbackParams);
    return {
      params,
      result: fallbackResult,
      refrigerant,
      refrigerantValidation: {
        viable: false,
        warnings: ["Error de cálculo térmico — parámetros fuera de rango"],
        copCarnot: 0,
        marginK: 0,
      },
    };
  }
}

const initial = computeState(structuredClone(DEFAULT_THERMO_PARAMS), "R744");

export const useThermoStore = create<ThermoStore>()((set, get) => ({
  ...initial,

  /** Cambia temperatura de entrada WFI (Tanque 7). Mantiene ΔT constante. */
  setT_c1: (t) =>
    set((state) => {
      const deltaT = state.params.T_c2 - state.params.T_c1;
      const params = { ...state.params, T_c1: t, T_c2: t + deltaT };
      return computeState(params, state.refrigerant);
    }),

  /** Cambia ΔT del lado caliente; T_c1 permanece fija */
  setDeltaTCaliente: (deltaT) =>
    set((state) => {
      const params = { ...state.params, T_c2: state.params.T_c1 + deltaT };
      return computeState(params, state.refrigerant);
    }),

  /** Cambia temperatura de entrada de piscina al evaporador */
  setT_piscina_in: (t) =>
    set((state) => {
      const params = { ...state.params, T_piscina_in: t };
      return computeState(params, state.refrigerant);
    }),

  /** Cambia temperatura de salida del agua de piscina del evaporador */
  setTempSalidaPiscina: (t) =>
    set((state) => {
      const params = { ...state.params, T_piscina_out: t };
      return computeState(params, state.refrigerant);
    }),

  setCOP: (cop) =>
    set((state) => {
      const params = { ...state.params, copOperativo: cop };
      return computeState(params, state.refrigerant);
    }),

  setRefrigerant: (name) =>
    set((state) => computeState(state.params, name)),

  togglePerdidas: () =>
    set((state) => {
      const params = { ...state.params, incluirPerdidas: !state.params.incluirPerdidas };
      return computeState(params, state.refrigerant);
    }),

  setPerdidas: (q) =>
    set((state) => {
      const params = { ...state.params, Q_perdidas_kw: q };
      return computeState(params, state.refrigerant);
    }),

  setQDiseño: (q) =>
    set((state) => {
      const params = { ...state.params, Q_diseño_kw: q };
      return computeState(params, state.refrigerant);
    }),

  resetParams: () => set(() => computeState(structuredClone(DEFAULT_THERMO_PARAMS), "R744")),

  syncToEconomic: () => {
    const { result, params } = get();
    const cargaKW = params.incluirPerdidas ? result.Q_disp_kw : result.Q_cond_kw;
    return { cargaKW, cop: params.copOperativo };
  },
}));
