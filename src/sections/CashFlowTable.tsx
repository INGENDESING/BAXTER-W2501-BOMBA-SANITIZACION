import { motion } from "framer-motion";
import { useProjectStore } from "../store/useProjectStore";
import { formatCurrency, cn } from "../lib/utils";

export default function CashFlowTable() {
  const { results } = useProjectStore();
  const { cashFlow } = results;

  return (
    <section id="cashflow" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-2xl font-bold text-text">Flujo de Caja Anual</h2>
        <p className="mt-1 text-sm text-text-muted">
          Proyección año a año del flujo de caja descontado (WACC {results.params.wacc * 100}%)
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
                <th className="px-4 py-3 font-semibold">Año</th>
                <th className="px-4 py-3 font-semibold text-right">CAPEX</th>
                <th className="px-4 py-3 font-semibold text-right">Ahorro OPEX</th>
                <th className="px-4 py-3 font-semibold text-right">Valor Residual</th>
                <th className="px-4 py-3 font-semibold text-right">Flujo Caja</th>
                <th className="px-4 py-3 font-semibold text-right">FC Descontado</th>
                <th className="px-4 py-3 font-semibold text-right">FC Acumulado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {cashFlow.years.map((y, idx) => (
                <tr
                  key={y.year}
                  className={
                    idx % 2 === 0
                      ? "bg-card"
                      : "bg-background/50"
                  }
                >
                  <td className="px-4 py-3 font-medium text-text">{y.year}</td>
                  <td className="px-4 py-3 text-right text-text">{formatCurrency(y.capex, 0)}</td>
                  <td className="px-4 py-3 text-right text-text">{formatCurrency(y.ahorroOpex, 0)}</td>
                  <td className="px-4 py-3 text-right text-text">{formatCurrency(y.valorResidual, 0)}</td>
                  <td className={cn("px-4 py-3 text-right font-medium", y.flujoCaja >= 0 ? "text-success" : "text-danger")}>
                    {formatCurrency(y.flujoCaja, 0)}
                  </td>
                  <td className="px-4 py-3 text-right text-text">{formatCurrency(y.flujoDescontado, 0)}</td>
                  <td className={cn("px-4 py-3 text-right font-semibold", y.flujoAcumulado >= 0 ? "text-success" : "text-danger")}>
                    {formatCurrency(y.flujoAcumulado, 0)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </section>
  );
}

