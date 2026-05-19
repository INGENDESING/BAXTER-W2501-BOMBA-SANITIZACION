import { motion } from "framer-motion";
import ProcessDiagram from "../components/process/ProcessDiagram";
import BalanceTable from "../components/process/BalanceTable";
import ThermoParamControls from "../components/process/ThermoParamControls";

export default function ProcessBalance() {
  return (
    <section id="balance-me" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-2xl font-bold text-[#E6EDF3]">Balance de Materia y Energía</h2>
        <p className="mt-1 text-sm text-[#8B949E]">
          Diagrama de bloques del proceso y tabla de balance interactiva. Modifique los parámetros en el panel lateral para recalcular en tiempo real.
        </p>
      </motion.div>

      {/* Diagrama de proceso */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mt-8 rounded-xl border border-[rgba(48,54,61,0.5)] bg-[#161B22]/40 p-5 backdrop-blur-md"
      >
        <ProcessDiagram />
      </motion.div>

      {/* Controles + Tabla */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="rounded-xl border border-[rgba(48,54,61,0.5)] bg-[#161B22]/40 p-5 backdrop-blur-md lg:col-span-1"
        >
          <ThermoParamControls />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="rounded-xl border border-[rgba(48,54,61,0.5)] bg-[#161B22]/40 p-5 backdrop-blur-md lg:col-span-2"
        >
          <h3 className="mb-4 text-sm font-semibold text-[#E6EDF3]">Tabla de Balance</h3>
          <BalanceTable />
        </motion.div>
      </div>
    </section>
  );
}
