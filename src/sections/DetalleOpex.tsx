import { useState } from "react";
import { motion } from "framer-motion";
import { useProjectStore } from "../store/useProjectStore";
import { formatCurrency, formatPercent } from "../lib/utils";
import { Pencil } from "lucide-react";

export default function DetalleOpex() {
  const { params, results, updateOpexFactor } = useProjectStore();
  const { opex } = results;
  const [flashIndex, setFlashIndex] = useState<number | null>(null);

  const handleChange = (
    index: number,
    field: "gas" | "bc",
    value: number
  ) => {
    updateOpexFactor(index, field, value);
    setFlashIndex(index);
    setTimeout(() => setFlashIndex(null), 300);
  };

  const energiaItem = opex.items.find((i) => i.concepto === "Costo energía");
  const emisionesItem = opex.items.find((i) => i.concepto === "Emisiones CO₂");

  return (
    <section id="opex" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-text">Desglose OPEX Detallado</h2>
          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary dark:bg-primary-light/20 dark:text-primary-light">
            <Pencil className="h-3 w-3" />
            Editable
          </span>
        </div>
        <p className="mt-1 text-sm text-text-muted">
          Comparación anual de costos operativos: Sistema de Vapor vs Bomba de Calor. Edita las filas con campos numéricos.
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
                <th className="px-6 py-4 font-semibold">Concepto</th>
                <th className="px-6 py-4 font-semibold">Caldera Gas (USD/año)</th>
                <th className="px-6 py-4 font-semibold">Bomba Calor (USD/año)</th>
                <th className="px-6 py-4 font-semibold">Ahorro (USD/año)</th>
                <th className="px-6 py-4 font-semibold">Reducción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {/* Fila calculada: Costo energía */}
              {energiaItem && (
                <tr className="bg-background/50">
                  <td className="px-6 py-3.5 font-medium text-text">{energiaItem.concepto}</td>
                  <td className="px-6 py-3.5 text-text">{formatCurrency(energiaItem.gas, 0)}</td>
                  <td className="px-6 py-3.5 text-text">{formatCurrency(energiaItem.bc, 0)}</td>
                  <td className="px-6 py-3.5 font-semibold text-success">{formatCurrency(energiaItem.ahorro, 0)}</td>
                  <td className="px-6 py-3.5 text-text">{formatPercent(energiaItem.gas > 0 ? energiaItem.ahorro / energiaItem.gas : 0, 1)}</td>
                </tr>
              )}

              {/* Filas editables: factores base */}
              {params.opexFactors.map((factor, idx) => {
                // Usar results.opex.items (ya escalados por calculator.ts) para evitar
                // doble aplicación del ratio. Los inputs editan el factor base.
                const enriched = results.opex.items[idx];
                const gas = enriched.gas;
                const ahorro = enriched.ahorro;
                const reduccion = gas > 0 ? ahorro / gas : 0;
                const isFlashing = flashIndex === idx;
                return (
                  <tr
                    key={factor.concepto}
                    className={idx % 2 === 0 ? "bg-card" : "bg-background/50"}
                  >
                    <td className="px-6 py-3.5 font-medium text-text">{factor.concepto}</td>
                    <td
                      className={`px-6 py-2 transition-colors duration-300 ${isFlashing ? "bg-primary/10" : ""}`}
                    >
                      <input
                        type="number"
                        min={0}
                        step={100}
                        value={factor.gas}
                        onChange={(e) =>
                          handleChange(idx, "gas", parseFloat(e.target.value) || 0)
                        }
                        className="w-28 rounded-md border border-border bg-card px-2 py-1 text-right text-sm text-text focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:w-32"
                      />
                    </td>
                    <td
                      className={`px-6 py-2 transition-colors duration-300 ${isFlashing ? "bg-primary/10" : ""}`}
                    >
                      <input
                        type="number"
                        min={0}
                        step={100}
                        value={factor.bc}
                        onChange={(e) =>
                          handleChange(idx, "bc", parseFloat(e.target.value) || 0)
                        }
                        className="w-28 rounded-md border border-border bg-card px-2 py-1 text-right text-sm text-text focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:w-32"
                      />
                    </td>
                    <td className="px-6 py-3.5 font-semibold text-success">
                      {formatCurrency(ahorro, 0)}
                    </td>
                    <td className="px-6 py-3.5 text-text">
                      {formatPercent(reduccion, 1)}
                    </td>
                  </tr>
                );
              })}

              {/* Fila calculada: Emisiones CO₂ */}
              {emisionesItem && (
                <tr className="bg-background/50">
                  <td className="px-6 py-3.5 font-medium text-text">{emisionesItem.concepto}</td>
                  <td className="px-6 py-3.5 text-text">{formatCurrency(emisionesItem.gas, 0)}</td>
                  <td className="px-6 py-3.5 text-text">{formatCurrency(emisionesItem.bc, 0)}</td>
                  <td className="px-6 py-3.5 font-semibold text-success">{formatCurrency(emisionesItem.ahorro, 0)}</td>
                  <td className="px-6 py-3.5 text-text">{formatPercent(emisionesItem.gas > 0 ? emisionesItem.ahorro / emisionesItem.gas : 0, 1)}</td>
                </tr>
              )}

              <tr className="bg-primary/5 font-bold">
                <td className="px-6 py-4 text-text">TOTAL</td>
                <td className="px-6 py-4 text-text">{formatCurrency(opex.totalGas, 0)}</td>
                <td className="px-6 py-4 text-text">{formatCurrency(opex.totalBC, 0)}</td>
                <td className="px-6 py-4 text-success">{formatCurrency(opex.totalAhorro, 0)}</td>
                <td className="px-6 py-4 text-text">{formatPercent(opex.totalGas > 0 ? opex.totalAhorro / opex.totalGas : 0, 1)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </motion.div>
    </section>
  );
}
