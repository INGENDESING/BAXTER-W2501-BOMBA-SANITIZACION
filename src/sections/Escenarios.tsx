import { motion } from "framer-motion";
import { CheckCircle, AlertTriangle, Rocket } from "lucide-react";
import { useProjectStore } from "../store/useProjectStore";
import { formatCurrency, formatPercent, formatNumber } from "../lib/utils";
import { cn } from "../lib/utils";

const decisionConfig: Record<string, { icon: typeof CheckCircle; color: string; bg: string }> = {
  "Aceptar con mitigación": { icon: AlertTriangle, color: "text-caution", bg: "bg-caution/15" },
  "Aceptar": { icon: CheckCircle, color: "text-warning", bg: "bg-warning/15" },
  "Aceptar urgentemente": { icon: Rocket, color: "text-success", bg: "bg-success/15" },
};

export default function Escenarios() {
  const { results } = useProjectStore();
  const scenarios = results.scenarios;

  return (
    <section id="escenarios" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-2xl font-bold text-text">Indicadores por Escenario</h2>
        <p className="mt-1 text-sm text-text-muted">
          Comparación de resultados bajo diferentes supuestos de riesgo
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mt-8 overflow-hidden rounded-xl border border-border bg-card shadow-sm"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-primary text-left text-white">
                <th className="px-6 py-4 font-semibold">Indicador</th>
                {scenarios.map((s) => (
                  <th key={s.nombre} className="px-6 py-4 font-semibold">
                    {s.nombre}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {[
                { label: "CAPEX (USD)", format: (v: number) => formatCurrency(v, 0), key: "capex" as const },
                { label: "Ahorro OPEX año 1 (USD/año)", format: (v: number) => formatCurrency(v, 0), key: "ahorroAnio1" as const },
                { label: "VPN (USD)", format: (v: number) => formatCurrency(v, 0), key: "vpn" as const },
                { label: "TIR (%/año)", format: (v: number) => formatPercent(v, 1), key: "tir" as const },
                { label: "Payback descontado (años)", format: (v: number) => formatNumber(v, 1), key: "payback" as const },
              ].map((row, idx) => (
                <tr key={row.key} className={idx % 2 === 0 ? "bg-card" : "bg-background/50"}>
                  <td className="px-6 py-4 font-medium text-text">{row.label}</td>
                  {scenarios.map((s) => (
                    <td key={s.nombre} className="px-6 py-4 text-text">
                      {row.format(s[row.key])}
                    </td>
                  ))}
                </tr>
              ))}
              <tr className="bg-background/50">
                <td className="px-6 py-4 font-medium text-text">Decisión</td>
                {scenarios.map((s) => {
                  const cfg = decisionConfig[s.decision] || decisionConfig["Aceptar"];
                  const Icon = cfg.icon;
                  return (
                    <td key={s.nombre} className="px-6 py-4">
                      <span className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold", cfg.bg, cfg.color)}>
                        <Icon className="h-3.5 w-3.5" />
                        {s.decision}
                      </span>
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      </motion.div>
    </section>
  );
}
