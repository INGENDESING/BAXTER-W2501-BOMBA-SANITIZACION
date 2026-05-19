import { X, RotateCcw } from "lucide-react";
import { useProjectStore } from "../store/useProjectStore";
import { cn } from "../lib/utils";

interface InputsPanelProps {
  open: boolean;
  onClose: () => void;
}

function InputSlider({
  label,
  value,
  min,
  max,
  step,
  suffix = "",
  onChange,
  format = (v) => v.toString(),
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  suffix?: string;
  onChange: (v: number) => void;
  format?: (v: number) => string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-text">{label}</label>
        <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
          {format(value)}
          {suffix}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-border accent-primary"
        />
        <input
          type="number"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          className="w-24 rounded-md border border-border bg-card px-2 py-1 text-right text-sm text-text focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>
    </div>
  );
}

export default function InputsPanel({ open, onClose }: InputsPanelProps) {
  const { params, updateParam, resetParams } = useProjectStore();

  const sliders = [
    { key: "cargaKW" as const, label: "Carga térmica (kW)", min: 300, max: 650, step: 5, suffix: " kW" },
    { key: "cop" as const, label: "COP conservador", min: 2.5, max: 5, step: 0.1, suffix: "" },
    { key: "horasAnio" as const, label: "Horas/año", min: 2000, max: 8760, step: 200, suffix: " h" },
    { key: "wacc" as const, label: "WACC", min: 0.05, max: 0.15, step: 0.005, suffix: "", format: (v: number) => `${(v * 100).toFixed(1)}%` },
    { key: "escalaOpex" as const, label: "Escalamiento anual ahorro", min: 0, max: 0.1, step: 0.005, suffix: "", format: (v: number) => `${(v * 100).toFixed(1)}%` },
    { key: "eficCaldera" as const, label: "Eficiencia caldera referencia", min: 0.6, max: 0.9, step: 0.01, suffix: "", format: (v: number) => `${(v * 100).toFixed(0)}%` },
    { key: "horizonte" as const, label: "Horizonte (años)", min: 10, max: 20, step: 1, suffix: " años" },
    { key: "contingenciaPct" as const, label: "Contingencia técnica", min: 0, max: 0.20, step: 0.005, suffix: "", format: (v: number) => `${(v * 100).toFixed(1)}%` },
    { key: "escalacionPct" as const, label: "Escalación precios", min: 0, max: 0.15, step: 0.005, suffix: "", format: (v: number) => `${(v * 100).toFixed(1)}%` },
  ];

  const numberInputs = [
    { key: "precioElec" as const, label: "Precio electricidad (USD/kWh)", step: 0.001, hint: "Tarifa industrial negociada: 0.113 USD/kWh. Referencia — el costo de energía base se toma del estudio 2025BC-DT005 R1." },
    { key: "precioGas" as const, label: "Precio gas natural (USD/kWh eq.)", step: 0.001, hint: "Referencia contractual: ~4 000 COP/m³ ≈ 0.0886 USD/kWh eq. El costo de energía base del estudio (2025BC-DT005 R1) ya incorpora el consumo real de la caldera." },
    { key: "capexMult" as const, label: "Multiplicador CAPEX", step: 0.01 },
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm transition-opacity",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={onClose}
      />
      {/* Drawer */}
      <div
        className={cn(
          "fixed right-0 top-0 z-[70] h-full w-full max-w-md transform bg-card shadow-2xl transition-transform duration-300 ease-in-out",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <h2 className="text-lg font-semibold text-text">Parámetros del Estudio</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={resetParams}
                className="rounded-md p-2 text-text-muted transition-colors hover:bg-background hover:text-text"
                title="Restaurar valores por defecto"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
              <button
                onClick={onClose}
                className="rounded-md p-2 text-text-muted transition-colors hover:bg-background hover:text-text"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-6">
            <div className="space-y-8">
              <div className="space-y-5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted">
                  Operativos y energéticos
                </h3>
                {sliders.map((s) => (
                  <InputSlider
                    key={s.key}
                    label={s.label}
                    value={params[s.key]}
                    min={s.min}
                    max={s.max}
                    step={s.step}
                    suffix={s.suffix}
                    format={s.format}
                    onChange={(v) => updateParam(s.key, v)}
                  />
                ))}
              </div>

              <div className="space-y-5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted">
                  Financieros
                </h3>
                {numberInputs.map((inp) => (
                  <div key={inp.key} className="space-y-2">
                    <label className="text-sm font-medium text-text">{inp.label}</label>
                    <input
                      type="number"
                      step={inp.step}
                      value={params[inp.key]}
                      onChange={(e) => updateParam(inp.key, parseFloat(e.target.value) || 0)}
                      className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-text focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    {"hint" in inp && inp.hint && (
                      <p className="text-xs text-text-muted leading-relaxed">{inp.hint}</p>
                    )}
                  </div>
                ))}
              </div>

              <div className="rounded-lg border border-border bg-background/50 p-4">
                <p className="text-xs text-text-muted">
                  Los valores de contingencia y escalación afectan directamente el subtotal del CAPEX. Las partidas individuales de CAPEX y OPEX se editan en las tablas detalladas.
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-border px-6 py-4">
            <button
              onClick={onClose}
              className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary-light hover:shadow-md active:scale-[0.98]"
            >
              Aplicar y cerrar
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
