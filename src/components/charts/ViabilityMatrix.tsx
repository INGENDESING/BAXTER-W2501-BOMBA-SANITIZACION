import { Fragment } from "react";
import { motion } from "framer-motion";
import { useProjectStore } from "../../store/useProjectStore";
import { formatCurrency } from "../../lib/utils";

const CAPEX_MULTS = [1.10, 1.00, 0.90];
const AHORRO_MULTS = [0.75, 1.00, 1.25];
const LABELS = ["Pesimista", "Base", "Optimista"];

function getHeatColor(vpn: number, min: number, max: number): string {
  const t = max === min ? 0.5 : (vpn - min) / (max - min);
  // Interpolate from red (#EF4444) through yellow (#F59E0B) to green (#22C55E)
  if (t < 0.5) {
    const s = t * 2;
    return `rgb(${239 + s * (245 - 239)}, ${68 + s * (158 - 68)}, ${68 + s * (11 - 68)})`;
  }
  const s = (t - 0.5) * 2;
  return `rgb(${245 + s * (34 - 245)}, ${158 + s * (197 - 158)}, ${11 + s * (94 - 11)})`;
}

export default function ViabilityMatrix() {
  const { results } = useProjectStore();
  const ahorroBase = results.opex.totalAhorro;

  const matrix = CAPEX_MULTS.map((cm, i) =>
    AHORRO_MULTS.map((am, j) => {
      const anualidadFactor =
        results.params.wacc === results.params.escalaOpex
          ? results.params.horizonte / (1 + results.params.wacc)
          : (1 - Math.pow((1 + results.params.escalaOpex) / (1 + results.params.wacc), results.params.horizonte)) /
            (results.params.wacc - results.params.escalaOpex);
      const vpn = -results.capex.totalBase * cm + ahorroBase * am * anualidadFactor;
      return { vpn, cm, am, labelRow: LABELS[i], labelCol: LABELS[j] };
    })
  );

  const allVpn = matrix.flat().map((c) => c.vpn);
  const minVpn = Math.min(...allVpn);
  const maxVpn = Math.max(...allVpn);

  return (
    <div className="w-full">
      <div className="mb-4 flex items-center justify-between">
        <div className="text-xs text-text-muted">
          Fila = CAPEX · Columna = Ahorro OPEX
        </div>
        <div className="flex items-center gap-2 text-xs text-text-muted">
          <span className="inline-block h-3 w-3 rounded-sm" style={{ backgroundColor: "#EF4444" }} />
          Bajo VPN
          <span className="inline-block h-3 w-3 rounded-sm" style={{ backgroundColor: "#F59E0B" }} />
          Medio
          <span className="inline-block h-3 w-3 rounded-sm" style={{ backgroundColor: "#22C55E" }} />
          Alto VPN
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {/* Header row */}
        <div className="rounded-lg bg-background p-3 text-center text-xs font-semibold text-text-muted">
          CAPEX \ Ahorro
        </div>
        {AHORRO_MULTS.map((am, j) => (
          <div key={j} className="rounded-lg bg-background p-3 text-center text-xs font-semibold text-text">
            {LABELS[j]}
            <div className="text-[10px] text-text-muted">{am.toFixed(2)}×</div>
          </div>
        ))}

        {/* Data rows */}
        {matrix.map((row, i) => (
          <Fragment key={i}>
            <div className="rounded-lg bg-background p-3 text-center text-xs font-semibold text-text">
              {LABELS[i]}
              <div className="text-[10px] text-text-muted">{CAPEX_MULTS[i].toFixed(2)}×</div>
            </div>
            {row.map((cell, j) => (
              <motion.div
                key={`${i}-${j}`}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: (i * 3 + j) * 0.05 }}
                className="flex flex-col items-center justify-center rounded-lg p-3 text-center transition-transform hover:scale-105 cursor-default"
                style={{ backgroundColor: getHeatColor(cell.vpn, minVpn, maxVpn) }}
              >
                <span className="text-sm font-bold text-white drop-shadow-md">
                  {formatCurrency(cell.vpn, 0)}
                </span>
                <span className="mt-0.5 text-[10px] font-medium text-white/90 drop-shadow-md">
                  VPN
                </span>
              </motion.div>
            ))}
          </Fragment>
        ))}
      </div>
    </div>
  );
}
