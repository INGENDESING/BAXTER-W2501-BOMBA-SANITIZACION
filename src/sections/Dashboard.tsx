import { motion } from "framer-motion";
import {
  TrendingUp,
  Clock,
  DollarSign,
  Zap,
  Leaf,
  Flame,
  TreePine,
  Gauge,
  FileSpreadsheet,
  FileText,
  Download,
} from "lucide-react";
import KpiCard from "../components/kpi/KpiCard";
import CashFlowChart from "../components/charts/CashFlowChart";
import OpexChart from "../components/charts/OpexChart";
import CapexChart from "../components/charts/CapexChart";
import RadarChart from "../components/charts/RadarChart";
import TornadoChart from "../components/charts/TornadoChart";
import EmissionsChart from "../components/charts/EmissionsChart";
import { useProjectStore } from "../store/useProjectStore";
import { formatPercent } from "../lib/utils";

export default function Dashboard() {
  const { results } = useProjectStore();
  const { indicadores, emisiones } = results;

  const kpis = [
    {
      label: "VPN (Base)",
      value: "",
      rawValue: indicadores.vpn,
      prefix: "$",
      decimals: 0,
      sub: `WACC ${formatPercent(results.params.wacc, 1)}, ${results.params.horizonte} años`,
      variant: "success" as const,
      icon: TrendingUp,
    },
    {
      label: "TIR",
      value: "",
      rawValue: indicadores.tir * 100,
      suffix: "%",
      decimals: 1,
      sub: `Supera WACC en ${(indicadores.tir / results.params.wacc).toFixed(2)}×`,
      variant: "success" as const,
      icon: Gauge,
    },
    {
      label: "Payback Descontado",
      value: "",
      rawValue: indicadores.payback,
      suffix: " años",
      decimals: 1,
      sub: "Benchmark: 5–10 años",
      variant: "caution" as const,
      icon: Clock,
    },
    {
      label: "CAPEX Total",
      value: "",
      rawValue: indicadores.capexTotal,
      prefix: "$",
      decimals: 0,
      sub: `${Math.round(indicadores.capexPorKW).toLocaleString("es-CO")} USD/kW`,
      variant: "capex" as const,
      icon: DollarSign,
    },
    {
      label: "Ahorro OPEX Año 1",
      value: "",
      rawValue: indicadores.ahorroOpexAnio1,
      prefix: "$",
      decimals: 0,
      sub: `Reducción ${formatPercent(1 - results.opex.totalBC / results.opex.totalGas, 1)} vs caldera`,
      variant: "success" as const,
      icon: Zap,
    },
    {
      label: "Reducción CO₂",
      value: "",
      rawValue: emisiones.co2Gas - emisiones.co2BC,
      suffix: " t/año",
      decimals: 1,
      sub: `${formatPercent(1 - emisiones.co2BC / emisiones.co2Gas, 1)} vs caldera gas`,
      variant: "success" as const,
      icon: Leaf,
    },
    {
      label: "Gas Evitado",
      value: "",
      rawValue: emisiones.gasNaturalEvitado,
      suffix: " m³/año",
      decimals: 0,
      sub: `~${Math.round(emisiones.gasNaturalEvitado / 1000).toLocaleString("es-CO")} km³/año`,
      variant: "warning" as const,
      icon: Flame,
    },
    {
      label: "Equivalente Árboles",
      value: "",
      rawValue: emisiones.equivalenteArboles,
      suffix: "",
      decimals: 0,
      sub: "árboles/año absorbidos",
      variant: "success" as const,
      icon: TreePine,
    },
  ];

  return (
    <section id="dashboard" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-2xl font-bold text-[#E6EDF3]">Dashboard Financiero</h2>
        <p className="mt-1 text-sm text-[#8B949E]">
          Indicadores actualizados en tiempo real según los parámetros del estudio
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="mt-6 flex flex-col gap-3 rounded-xl border border-[#79C0FF]/20 bg-[#79C0FF]/[0.03] p-4 backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex items-start gap-3">
          <div className="mt-0.5 rounded-lg bg-[#79C0FF]/10 p-2 ring-1 ring-[#79C0FF]/20">
            <Download className="h-4 w-4 text-[#79C0FF]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#E6EDF3]">
              Entregables oficiales del estudio
            </p>
            <p className="text-xs text-[#8B949E]">
              Para un análisis detallado con metodología, supuestos y desglose completo,
              descarga los documentos originales aprobados.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <a
            href="/2025BC-MC001-REV6.xlsx"
            download
            className="inline-flex items-center gap-2 rounded-lg bg-[#3FB950]/10 px-3 py-2 text-xs font-semibold text-[#3FB950] ring-1 ring-[#3FB950]/30 transition-all hover:bg-[#3FB950]/20 hover:shadow-[0_0_12px_rgba(63,185,80,0.12)]"
          >
            <FileSpreadsheet className="h-3.5 w-3.5" />
            Caso base — Excel
          </a>
          <a
            href="/2025BC-DT005-R1.pdf"
            download
            className="inline-flex items-center gap-2 rounded-lg bg-[#F85149]/10 px-3 py-2 text-xs font-semibold text-[#F85149] ring-1 ring-[#F85149]/30 transition-all hover:bg-[#F85149]/20 hover:shadow-[0_0_12px_rgba(248,81,73,0.12)]"
          >
            <FileText className="h-3.5 w-3.5" />
            Informe base — PDF
          </a>
        </div>
      </motion.div>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi, i) => (
          <KpiCard
            key={kpi.label}
            label={kpi.label}
            value={kpi.value}
            rawValue={kpi.rawValue}
            prefix={kpi.prefix}
            suffix={kpi.suffix}
            decimals={kpi.decimals}
            sub={kpi.sub}
            variant={kpi.variant}
            icon={kpi.icon}
            index={i}
          />
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="rounded-xl border border-[rgba(48,54,61,0.5)] bg-[#161B22]/60 p-5 backdrop-blur-md shadow-sm transition-all hover:border-[rgba(48,54,61,0.8)] hover:shadow-[0_0_20px_rgba(121,192,255,0.04)]"
        >
          <h3 className="mb-4 text-sm font-semibold text-[#E6EDF3]">
            Flujo de Caja Descontado Acumulado
          </h3>
          <CashFlowChart />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="rounded-xl border border-[rgba(48,54,61,0.5)] bg-[#161B22]/60 p-5 backdrop-blur-md shadow-sm transition-all hover:border-[rgba(48,54,61,0.8)] hover:shadow-[0_0_20px_rgba(121,192,255,0.04)]"
        >
          <h3 className="mb-4 text-sm font-semibold text-[#E6EDF3]">
            Composición del OPEX (%)
          </h3>
          <OpexChart />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="rounded-xl border border-[rgba(48,54,61,0.5)] bg-[#161B22]/60 p-5 backdrop-blur-md shadow-sm transition-all hover:border-[rgba(48,54,61,0.8)] hover:shadow-[0_0_20px_rgba(121,192,255,0.04)]"
        >
          <h3 className="mb-4 text-sm font-semibold text-[#E6EDF3]">
            Distribución del CAPEX
          </h3>
          <CapexChart />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="rounded-xl border border-[rgba(48,54,61,0.5)] bg-[#161B22]/60 p-5 backdrop-blur-md shadow-sm transition-all hover:border-[rgba(48,54,61,0.8)] hover:shadow-[0_0_20px_rgba(121,192,255,0.04)]"
        >
          <h3 className="mb-4 text-sm font-semibold text-[#E6EDF3]">
            Perfil Comparativo: Caldera vs BC
          </h3>
          <RadarChart />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="rounded-xl border border-[rgba(48,54,61,0.5)] bg-[#161B22]/60 p-5 backdrop-blur-md shadow-sm transition-all hover:border-[rgba(48,54,61,0.8)] hover:shadow-[0_0_20px_rgba(121,192,255,0.04)]"
        >
          <h3 className="mb-4 text-sm font-semibold text-[#E6EDF3]">
            Tornado — ΔVPN (±25%)
          </h3>
          <TornadoChart />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="rounded-xl border border-[rgba(48,54,61,0.5)] bg-[#161B22]/60 p-5 backdrop-blur-md shadow-sm transition-all hover:border-[rgba(48,54,61,0.8)] hover:shadow-[0_0_20px_rgba(121,192,255,0.04)]"
        >
          <h3 className="mb-4 text-sm font-semibold text-[#E6EDF3]">
            Emisiones CO₂ (t/año)
          </h3>
          <EmissionsChart />
        </motion.div>
      </div>
    </section>
  );
}
