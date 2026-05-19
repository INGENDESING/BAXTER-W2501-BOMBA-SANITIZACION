export interface OpexFactor {
  concepto: string;
  gas: number;
  bc: number;
}

export interface ProjectParams {
  cargaKW: number;
  cargaDiseno: number;
  cop: number;
  horasAnio: number;
  precioElec: number;
  precioGas: number;
  eficCaldera: number;
  pcsGas: number;
  wacc: number;
  escalaOpex: number;
  tirObj: number;
  horizonte: number;
  valorResidualPct: number;
  capexMult: number;
  tasaImpuesto: number;
  capexItems: CapexItem[];
  opexFactors: OpexFactor[];
  contingenciaPct: number;
  escalacionPct: number;
}

export interface CapexItem {
  concepto: string;
  cantidad: number;
  costoUnitario: number;
  categoria: string;
}

export interface CapexBreakdown {
  items: CapexItem[];
  subtotal: number;
  contingencia: number;
  escalacion: number;
  totalBase: number;
  totalConEscenario: number;
  capexPorKW: number;
}

export interface OpexItem {
  concepto: string;
  gas: number;
  bc: number;
  ahorro: number;
}

export interface OpexBreakdown {
  items: OpexItem[];
  totalGas: number;
  totalBC: number;
  totalAhorro: number;
}

export interface CashFlowYear {
  year: number;
  capex: number;
  ahorroOpex: number;
  valorResidual: number;
  flujoCaja: number;
  flujoDescontado: number;
  flujoAcumulado: number;
}

export interface CashFlowModel {
  years: CashFlowYear[];
  vpn: number;
  tir: number;
  payback: number;
}

export interface Indicadores {
  vpn: number;
  tir: number;
  payback: number;
  tirObjetivo: number;
  relacionTirObj: number;
  capexBase: number;
  capexTotal: number;
  ahorroOpexAnio1: number;
  capexPorKW: number;
  potenciaElectrica: number;
  breakEvenCapex: number;
  breakEvenAhorro: number;
}

export interface Emisiones {
  co2Gas: number;
  co2BC: number;
  gasNaturalEvitado: number;
  equivalenteArboles: number;
}

export interface Scenario {
  nombre: string;
  capexMult: number;
  escalamiento: number;
  wacc: number;
  valorResidual: number;
}

export interface ScenarioResult {
  nombre: string;
  capex: number;
  ahorroAnio1: number;
  vpn: number;
  tir: number;
  payback: number;
  decision: string;
}

export interface SensitivityCase {
  variable: string;
  nivel: string;
  vpn: number;
}

export interface SensitivityResult {
  baseVPN: number;
  cases: SensitivityCase[];
  tornadoData: { variable: string; low: number; high: number }[];
}

export interface ProjectResults {
  params: ProjectParams;
  capex: CapexBreakdown;
  opex: OpexBreakdown;
  cashFlow: CashFlowModel;
  indicadores: Indicadores;
  emisiones: Emisiones;
  scenarios: ScenarioResult[];
  sensibilidad: SensitivityResult;
}
