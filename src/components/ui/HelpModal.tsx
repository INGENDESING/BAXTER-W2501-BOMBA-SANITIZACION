import { motion, AnimatePresence } from "framer-motion";
import { X, BookOpen, Calculator, FlaskConical, TrendingUp, AlertTriangle } from "lucide-react";

interface HelpModalProps {
  open: boolean;
  onClose: () => void;
}

const sections = [
  {
    icon: BookOpen,
    title: "Alcance del Estudio",
    content:
      "Este estudio (2025BC-DT005 R1) evalúa la viabilidad técnica y económica de un sistema de bomba de calor transcrítica CO₂ de 490 kW para sanitización de Agua para Inyectables (WFI) a 90 °C en Laboratorios BAXTER S.A., Planta Cali. Reemplaza el sistema de calentamiento por caldera (gas natural) cumpliendo USP ‹1231›, ASME BPE y 21 CFR Part 11. Horizonte de análisis: 15 años.",
  },
  {
    icon: Calculator,
    title: "Metodología de Cálculo",
    content:
      "El VPN se calcula como la suma de los flujos de caja descontados a la tasa WACC. El TIR es la tasa que hace VPN = 0 (método de Newton-Raphson). El payback descontado usa interpolación lineal entre el último año negativo y el primer año positivo del flujo acumulado. El valor residual (15% del CAPEX) se incluye en el año 15 (Cuadro 13, 2025BC-DT005 R1).",
  },
  {
    icon: FlaskConical,
    title: "Supuestos Clave",
    items: [
      "Carga térmica: 490 kW (Simultaneidad 2 — TK-11A + TK-03A, 2025BC-DT002 R0)",
      "Ciclo transcrítico CO₂: P_evap = 57,8 bar · P_gas_cooler = 95-97 bar",
      "COP operativo: 3,0 (conservador, Neška 2002)",
      "WFI: 75 °C entrada → 90 °C salida (gas cooler); retorno 70 °C → 60 °C (evaporador)",
      "Horas operación: 4.000 h/año — ciclos de sanitización (2025BC-DT005 R1)",
      "Precio electricidad: 113 USD/MWh (tarifa industrial negociada BAXTER)",
      "Gas natural: 4.000 COP/m³ · PCS = 10,5 kWh/m³ (UPME 2024)",
      "Eficiencia caldera referencia: 79 %",
      "WACC: 8 % · Escalamiento ahorro: 5 % anual · Sin impuestos (supuesto conservador)",
      "Altitud Cali: 1.018 msnm (P_atm ≈ 0,884 bar)",
    ],
  },
  {
    icon: TrendingUp,
    title: "Fuentes de Datos",
    content:
      "CAPEX: 2025BC-MC001 REV6.xlsx (hoja CAPEX_DET), validado contra PDF Cuadro 11 ($536.825 subtotal, +8% = $579.771). OPEX: hoja OPEX_DET, Cuadro 12. Balance térmico: 2025BC-DT002 R0 (IAPWS-IF97). Factores ambientales: 0,202 kg CO₂/kWh gas (IPCC AR6) × 10,5 kWh/m³ = 2,121 kg/m³; electricidad Colombia 0,164 kg/kWh (promedio 2025).",
  },
  {
    icon: AlertTriangle,
    title: "Limitaciones",
    content:
      "Estudio de factibilidad (±20% en CAPEX). No incluye análisis de variabilidad de precios de energía a largo plazo, impacto de mantenimiento no programado en ciclos de sanitización GMP, ni costos de calificación de proveedores (IQ/OQ/PQ completo). Se recomienda cotización FOB de equipos transcríticos y validación IQ/OQ/PQ antes de FID.",
  },
];

export default function HelpModal({ open, onClose }: HelpModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-4 z-[90] mx-auto max-w-2xl overflow-hidden rounded-2xl border border-border bg-card shadow-2xl sm:inset-8 md:inset-16"
          >
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between border-b border-border px-6 py-4">
                <h2 className="text-lg font-semibold text-text">Metodología y Supuestos</h2>
                <button
                  onClick={onClose}
                  className="rounded-md p-2 text-text-muted transition-colors hover:bg-background hover:text-text"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-6">
                <div className="space-y-6">
                  {sections.map((sec, i) => (
                    <motion.div
                      key={sec.title}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.08 }}
                      className="rounded-xl border border-border bg-background/50 p-4"
                    >
                      <div className="mb-2 flex items-center gap-2">
                        <sec.icon className="h-5 w-5 text-primary" />
                        <h3 className="font-semibold text-text">{sec.title}</h3>
                      </div>
                      {"items" in sec && sec.items ? (
                        <ul className="list-inside list-disc space-y-1 text-sm text-text-muted">
                          {sec.items.map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm leading-relaxed text-text-muted">{sec.content}</p>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="border-t border-border px-6 py-4">
                <button
                  onClick={onClose}
                  className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary-light active:scale-[0.98]"
                >
                  Entendido
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
