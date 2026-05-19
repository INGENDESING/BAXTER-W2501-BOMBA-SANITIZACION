import { useState } from "react";
import { motion } from "framer-motion";
import { useProjectStore } from "../store/useProjectStore";
import { formatCurrency } from "../lib/utils";
import { Pencil } from "lucide-react";

export default function DetalleCapex() {
  const { params, results, updateCapexItem } = useProjectStore();
  const { capex } = results;
  const [flashIndex, setFlashIndex] = useState<number | null>(null);

  const categorias = Array.from(new Set(capex.items.map((i) => i.categoria)));

  const handleChange = (
    index: number,
    field: "cantidad" | "costoUnitario",
    value: number
  ) => {
    updateCapexItem(index, field, value);
    setFlashIndex(index);
    setTimeout(() => setFlashIndex(null), 300);
  };

  return (
    <section id="capex" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-text">Desglose CAPEX Detallado</h2>
          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary dark:bg-primary-light/20 dark:text-primary-light">
            <Pencil className="h-3 w-3" />
            Editable
          </span>
        </div>
        <p className="mt-1 text-sm text-text-muted">
          Partidas de capital con contingencia ({(params.contingenciaPct * 100).toFixed(1)}%) y escalación ({(params.escalacionPct * 100).toFixed(1)}%). Haz clic en Cantidad o Costo Unit. para modificar.
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
                <th className="px-6 py-4 font-semibold text-right">Cantidad</th>
                <th className="px-6 py-4 font-semibold text-right">Costo Unit. (USD)</th>
                <th className="px-6 py-4 font-semibold text-right">Costo Total (USD)</th>
                <th className="px-6 py-4 font-semibold">Categoría</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {categorias.map((cat) => (
                <>
                  <tr key={cat} className="bg-primary/5">
                    <td colSpan={5} className="px-6 py-2 text-xs font-bold uppercase tracking-wider text-primary dark:text-primary-light">
                      {cat}
                    </td>
                  </tr>
                  {capex.items
                    .filter((i) => i.categoria === cat)
                    .map((item, idx) => {
                      const globalIndex = params.capexItems.findIndex(
                        (ci) =>
                          ci.concepto === item.concepto &&
                          ci.categoria === item.categoria
                      );
                      const total = item.cantidad * item.costoUnitario;
                      const isFlashing = flashIndex === globalIndex;
                      return (
                        <tr
                          key={`${cat}-${idx}`}
                          className={
                            idx % 2 === 0
                              ? "bg-card"
                              : "bg-background/50"
                          }
                        >
                          <td className="px-6 py-3.5 text-text">{item.concepto}</td>
                          <td
                            className={`px-6 py-2 text-right transition-colors duration-300 ${isFlashing ? "bg-primary/10" : ""}`}
                          >
                            <input
                              type="number"
                              min={0}
                              step={item.cantidad > 10 ? 1 : 0.1}
                              value={item.cantidad}
                              onChange={(e) =>
                                handleChange(
                                  globalIndex,
                                  "cantidad",
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              className="w-24 rounded-md border border-border bg-card px-2 py-1 text-right text-sm text-text focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:w-28"
                            />
                          </td>
                          <td
                            className={`px-6 py-2 text-right transition-colors duration-300 ${isFlashing ? "bg-primary/10" : ""}`}
                          >
                            <input
                              type="number"
                              min={0}
                              step={1}
                              value={item.costoUnitario}
                              onChange={(e) =>
                                handleChange(
                                  globalIndex,
                                  "costoUnitario",
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              className="w-28 rounded-md border border-border bg-card px-2 py-1 text-right text-sm text-text focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:w-32"
                            />
                          </td>
                          <td className="px-6 py-3.5 text-right font-medium text-text">
                            {formatCurrency(total, 0)}
                          </td>
                          <td className="px-6 py-3.5">
                            <span className="inline-flex rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary dark:bg-primary-light/20 dark:text-primary-light">
                              {item.categoria}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                </>
              ))}
              <tr className="bg-primary/10 font-bold dark:bg-primary/20">
                <td className="px-6 py-4 text-text">Subtotal</td>
                <td colSpan={2} />
                <td className="px-6 py-4 text-right text-text">{formatCurrency(capex.subtotal, 0)}</td>
                <td />
              </tr>
              <tr className="bg-card">
                <td className="px-6 py-3.5 text-text">Contingencia técnica ({(params.contingenciaPct * 100).toFixed(1)}%)</td>
                <td colSpan={2} />
                <td className="px-6 py-3.5 text-right text-text">{formatCurrency(capex.contingencia, 0)}</td>
                <td />
              </tr>
              <tr className="bg-background/50">
                <td className="px-6 py-3.5 text-text">Escalación precios ({(params.escalacionPct * 100).toFixed(1)}%)</td>
                <td colSpan={2} />
                <td className="px-6 py-3.5 text-right text-text">{formatCurrency(capex.escalacion, 0)}</td>
                <td />
              </tr>
              <tr className="bg-primary/10 font-bold dark:bg-primary/20">
                <td className="px-6 py-4 text-text">TOTAL CAPEX (USD)</td>
                <td colSpan={2} />
                <td className="px-6 py-4 text-right text-lg text-primary dark:text-primary-light">{formatCurrency(capex.totalConEscenario, 0)}</td>
                <td />
              </tr>
            </tbody>
          </table>
        </div>
      </motion.div>
    </section>
  );
}
