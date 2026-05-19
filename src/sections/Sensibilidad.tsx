import { motion } from "framer-motion";
import { useProjectStore } from "../store/useProjectStore";
import { formatCurrency, cn } from "../lib/utils";

export default function Sensibilidad() {
  const { results } = useProjectStore();
  const { sensibilidad } = results;

  return (
    <section id="sensibilidad" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-2xl font-bold text-text">Análisis de Sensibilidad</h2>
        <p className="mt-1 text-sm text-text-muted">
          Impacto de ±25% en las variables clave sobre el VPN base de {formatCurrency(sensibilidad.baseVPN, 0)}
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
                <th className="px-6 py-4 font-semibold">Variable</th>
                <th className="px-6 py-4 font-semibold">Nivel</th>
                <th className="px-6 py-4 font-semibold">VPN (USD)</th>
                <th className="px-6 py-4 font-semibold">ΔVPN vs Base</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {sensibilidad.cases.map((c, idx) => (
                <tr key={idx} className={idx % 2 === 0 ? "bg-card" : "bg-background/50"}>
                  <td className="px-6 py-4 font-medium text-text">{c.variable}</td>
                  <td className="px-6 py-4 text-text">{c.nivel}</td>
                  <td className="px-6 py-4 text-text">{formatCurrency(c.vpn, 0)}</td>
                  <td className={cn("px-6 py-4 font-medium", c.vpn - sensibilidad.baseVPN >= 0 ? "text-success" : "text-danger")}>
                    {formatCurrency(c.vpn - sensibilidad.baseVPN, 0)}
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

