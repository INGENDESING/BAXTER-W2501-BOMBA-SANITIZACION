import type {
  ProjectParams,
  CapexBreakdown,
  OpexBreakdown,
  CashFlowModel,
  CashFlowYear,
  Indicadores,
  Emisiones,
  ScenarioResult,
  SensitivityResult,
  SensitivityCase,
  ProjectResults,
} from "./types";
import {
  SCENARIOS,
  FACTOR_CO2_GAS,
  FACTOR_CO2_ELEC,
  FACTOR_ARBOLES,
} from "./constants";

// ───────────────────────────────────────────────────────────────
// CAPEX
// ───────────────────────────────────────────────────────────────
export function calcularCAPEX(params: ProjectParams): CapexBreakdown {
  const items = params.capexItems.map((item) => ({
    ...item,
    costoTotal: item.cantidad * item.costoUnitario,
  }));

  const subtotal = items.reduce((sum, item) => sum + item.costoTotal, 0);
  const contingencia = subtotal * params.contingenciaPct;
  const escalacion = subtotal * params.escalacionPct;
  const totalBase = subtotal + contingencia + escalacion;
  const totalConEscenario = totalBase * params.capexMult;
  const capexPorKW = totalBase / params.cargaDiseno;

  return {
    items: params.capexItems,
    subtotal,
    contingencia,
    escalacion,
    totalBase,
    totalConEscenario,
    capexPorKW,
  };
}

// ───────────────────────────────────────────────────────────────
// OPEX
// ───────────────────────────────────────────────────────────────
export function calcularOPEX(params: ProjectParams): OpexBreakdown {
  // ratio = 1.0 cuando cargaKW=490, horasAnio=4000 (caso base del estudio 2025BC).
  // Escala proporcional en análisis de sensibilidad cuando se varía la carga.
  // "Costo energía" y "Emisiones CO₂" ya están en opexFactors (valores del
  // estudio de proceso 2025BC-DT005 R1); no se recalculan aquí.
  const ratio = (params.cargaKW * params.horasAnio) / (490 * 4000);

  const enriched = params.opexFactors.map((f) => {
    // Operador especializado: costo fijo (salario); no escala con ratio
    const gas = f.concepto === "Operador especializado" ? f.gas : f.gas * ratio;
    const bc  = f.concepto === "Operador especializado" ? f.bc  : f.bc  * ratio;
    return { concepto: f.concepto, gas, bc, ahorro: gas - bc };
  });

  const totalGas   = enriched.reduce((s, i) => s + i.gas, 0);
  const totalBC    = enriched.reduce((s, i) => s + i.bc,  0);
  const totalAhorro = totalGas - totalBC;

  return { items: enriched, totalGas, totalBC, totalAhorro };
}

// ───────────────────────────────────────────────────────────────
// Cash Flow
// ───────────────────────────────────────────────────────────────
export function calcularCashFlow(
  params: ProjectParams,
  capexTotal: number,
  ahorroAnio1: number
): CashFlowModel {
  const years: CashFlowYear[] = [];

  for (let t = 0; t <= params.horizonte; t++) {
    const capex = t === 0 ? -capexTotal : 0;
    const ahorroOpex =
      t === 0 ? 0 : ahorroAnio1 * Math.pow(1 + params.escalaOpex, t - 1);
    const valorResidual =
      t === params.horizonte ? capexTotal * params.valorResidualPct : 0;
    const flujoCaja = capex + ahorroOpex + valorResidual;
    const flujoDescontado =
      t === 0 ? flujoCaja : flujoCaja / Math.pow(1 + params.wacc, t);

    years.push({
      year: t,
      capex,
      ahorroOpex,
      valorResidual,
      flujoCaja,
      flujoDescontado,
      flujoAcumulado: 0, // se calcula después
    });
  }

  // Acumulado descontado
  let acum = 0;
  for (const y of years) {
    acum += y.flujoDescontado;
    y.flujoAcumulado = acum;
  }

  const flujos = years.map((y) => y.flujoCaja);
  const vpn = calcularNPV(flujos, params.wacc);
  const tir = calcularIRR(flujos);
  const payback = calcularPayback(years);

  return { years, vpn, tir, payback };
}

// ───────────────────────────────────────────────────────────────
// NPV
// ───────────────────────────────────────────────────────────────
export function calcularNPV(flujos: number[], tasa: number): number {
  return flujos.reduce(
    (sum, flujo, t) => sum + flujo / Math.pow(1 + tasa, t),
    0
  );
}

// ───────────────────────────────────────────────────────────────
// IRR (Newton-Raphson)
// ───────────────────────────────────────────────────────────────
export function calcularIRR(flujos: number[]): number {
  let r = 0.1;
  for (let i = 0; i < 100; i++) {
    const npv = calcularNPV(flujos, r);
    const dNpv = flujos.reduce(
      (sum, flujo, t) =>
        sum - (t * flujo) / Math.pow(1 + r, t + 1),
      0
    );
    if (Math.abs(dNpv) < 1e-12) break;
    const rNew = r - npv / dNpv;
    if (Math.abs(rNew - r) < 1e-8) return rNew;
    r = rNew;
  }
  return r;
}

// ───────────────────────────────────────────────────────────────
// Payback descontado (interpolación lineal)
// ───────────────────────────────────────────────────────────────
export function calcularPayback(years: CashFlowYear[]): number {
  for (let i = 0; i < years.length - 1; i++) {
    const curr = years[i].flujoAcumulado;
    const next = years[i + 1].flujoAcumulado;
    if (curr < 0 && next >= 0) {
      const frac = Math.abs(curr) / (next - curr);
      return i + frac;
    }
  }
  return years.length - 1;
}

// ───────────────────────────────────────────────────────────────
// Indicadores
// ───────────────────────────────────────────────────────────────
export function calcularIndicadores(
  params: ProjectParams,
  capex: CapexBreakdown,
  cashFlow: CashFlowModel
): Indicadores {
  const opex = calcularOPEX(params);
  const ahorroAnio1 = opex.totalAhorro;

  // Break-even CAPEX (fórmula de anualidad creciente)
  const ratio = (1 + params.escalaOpex) / (1 + params.wacc);
  const anualidadFactor =
    params.wacc === params.escalaOpex
      ? params.horizonte / (1 + params.wacc)
      : (1 - Math.pow(ratio, params.horizonte)) /
        (params.wacc - params.escalaOpex);
  const breakEvenCapex = ahorroAnio1 * anualidadFactor;
  const breakEvenAhorro = capex.totalConEscenario / anualidadFactor;

  return {
    vpn: cashFlow.vpn,
    tir: cashFlow.tir,
    payback: cashFlow.payback,
    tirObjetivo: params.tirObj,
    relacionTirObj:
      params.tirObj > 0 ? cashFlow.tir / params.tirObj : 0,
    capexBase: capex.totalBase,
    capexTotal: capex.totalConEscenario,
    ahorroOpexAnio1: ahorroAnio1,
    capexPorKW: capex.capexPorKW,
    potenciaElectrica: params.cargaKW / params.cop,
    breakEvenCapex,
    breakEvenAhorro,
  };
}

// ───────────────────────────────────────────────────────────────
// Emisiones
// ───────────────────────────────────────────────────────────────
export function calcularEmisiones(params: ProjectParams): Emisiones {
  const co2Gas =
    ((params.cargaKW / params.eficCaldera) *
      params.horasAnio /
      params.pcsGas *
      FACTOR_CO2_GAS) /
    1000;
  const co2BC =
    ((params.cargaKW / params.cop) *
      params.horasAnio *
      FACTOR_CO2_ELEC) /
    1000;
  const gasNaturalEvitado =
    (params.cargaKW / params.eficCaldera) * params.horasAnio / params.pcsGas;
  const equivalenteArboles = (co2Gas - co2BC) * FACTOR_ARBOLES;

  return { co2Gas, co2BC, gasNaturalEvitado, equivalenteArboles };
}

// ───────────────────────────────────────────────────────────────
// Escenarios
// ───────────────────────────────────────────────────────────────
export function calcularEscenarios(params: ProjectParams): ScenarioResult[] {
  const opexBase = calcularOPEX(params);
  const ahorroBase = opexBase.totalAhorro;

  return SCENARIOS.map((sc) => {
    const p: ProjectParams = {
      ...params,
      capexMult: sc.capexMult,
      wacc: sc.wacc,
      escalaOpex: sc.escalamiento,
      valorResidualPct: sc.valorResidual,
    };

    const capex = calcularCAPEX(p);
    // Ahorro se escala proporcionalmente al cambio de WACC/escalamiento
    // pero para escenarios usamos multiplicadores simples sobre base
    const ahorroMult = sc.nombre === "Pesimista" ? 0.75 : sc.nombre === "Optimista" ? 1.25 : 1.0;
    const ahorroEsc = ahorroBase * ahorroMult;

    const cf = calcularCashFlow(p, capex.totalConEscenario, ahorroEsc);

    let decision = "Aceptar";
    if (sc.nombre === "Pesimista") decision = "Aceptar con mitigación";
    if (sc.nombre === "Optimista") decision = "Aceptar urgentemente";

    return {
      nombre: sc.nombre,
      capex: capex.totalConEscenario,
      ahorroAnio1: ahorroEsc,
      vpn: cf.vpn,
      tir: cf.tir,
      payback: cf.payback,
      decision,
    };
  });
}

// ───────────────────────────────────────────────────────────────
// Sensibilidad
// ───────────────────────────────────────────────────────────────
export function calcularSensibilidad(
  params: ProjectParams
): SensitivityResult {
  const capex = calcularCAPEX(params);
  const opex = calcularOPEX(params);
  const baseCF = calcularCashFlow(
    params,
    capex.totalConEscenario,
    opex.totalAhorro
  );
  const baseVPN = baseCF.vpn;

  const variables = ["CAPEX", "Ahorro", "WACC", "EscOPEX", "Horas"] as const;
  const levels = [
    { nivel: "Bajo", mult: 0.75 },
    { nivel: "Alto", mult: 1.25 },
  ];

  const cases: SensitivityCase[] = [];
  const tornadoData: { variable: string; low: number; high: number }[] = [];

  for (const variable of variables) {
    const lowRes: number[] = [];
    const highRes: number[] = [];

    for (const { nivel, mult } of levels) {
      const p: ProjectParams = { ...params };
      if (variable === "CAPEX") p.capexMult = params.capexMult * mult;
      if (variable === "Ahorro") {
        // se aplica al ahorro indirectamente ajustando carga o precios
        // simplificación: ajustamos carga térmica proporcionalmente
        p.cargaKW = params.cargaKW * mult;
      }
      if (variable === "WACC") p.wacc = params.wacc * mult;
      if (variable === "EscOPEX") p.escalaOpex = params.escalaOpex * mult;
      if (variable === "Horas") p.horasAnio = params.horasAnio * mult;

      const c = calcularCAPEX(p);
      const o = calcularOPEX(p);
      const cf = calcularCashFlow(p, c.totalConEscenario, o.totalAhorro);
      cases.push({ variable: `${variable} (${nivel})`, nivel, vpn: cf.vpn });

      if (nivel === "Bajo") lowRes.push(cf.vpn);
      else highRes.push(cf.vpn);
    }

    tornadoData.push({
      variable,
      low: lowRes[0] - baseVPN,
      high: highRes[0] - baseVPN,
    });
  }

  return { baseVPN, cases, tornadoData };
}

// ───────────────────────────────────────────────────────────────
// Todo
// ───────────────────────────────────────────────────────────────
export function calcularTodo(params: ProjectParams): ProjectResults {
  const capex = calcularCAPEX(params);
  const opex = calcularOPEX(params);
  const cashFlow = calcularCashFlow(
    params,
    capex.totalConEscenario,
    opex.totalAhorro
  );
  const indicadores = calcularIndicadores(params, capex, cashFlow);
  const emisiones = calcularEmisiones(params);
  const scenarios = calcularEscenarios(params);
  const sensibilidad = calcularSensibilidad(params);

  return {
    params,
    capex,
    opex,
    cashFlow,
    indicadores,
    emisiones,
    scenarios,
    sensibilidad,
  };
}

