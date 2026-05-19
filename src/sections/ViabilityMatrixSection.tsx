import { motion } from "framer-motion";
import ViabilityMatrix from "../components/charts/ViabilityMatrix";

export default function ViabilityMatrixSection() {
  return (
    <section id="viabilidad" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-2xl font-bold text-text">Matriz de Viabilidad</h2>
        <p className="mt-1 text-sm text-text-muted">
          VPN proyectado según combinaciones de CAPEX y Ahorro OPEX
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mt-8 rounded-xl border border-border bg-card p-6 shadow-sm"
      >
        <ViabilityMatrix />
      </motion.div>
    </section>
  );
}
