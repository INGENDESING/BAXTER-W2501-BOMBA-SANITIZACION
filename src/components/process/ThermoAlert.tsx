import { AlertTriangle, CheckCircle, Info, XCircle } from "lucide-react";
import { useThermoStore } from "../../store/useThermoStore";

export default function ThermoAlert() {
  const { refrigerantValidation } = useThermoStore();
  const { viable, warnings } = refrigerantValidation;

  if (warnings.length === 0) {
    return (
      <div className="flex items-start gap-3 rounded-lg border border-[#3FB950]/30 bg-[#3FB950]/10 p-4">
        <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-[#3FB950]" />
        <div>
          <p className="text-sm font-semibold text-[#3FB950]">Condiciones térmicas válidas</p>
          <p className="text-xs text-[#8B949E]">El refrigerante seleccionado opera dentro de rangos seguros para las temperaturas actuales.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {!viable && (
        <div className="flex items-start gap-3 rounded-lg border border-[#F85149]/30 bg-[#F85149]/10 p-4">
          <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-[#F85149]" />
          <div>
            <p className="text-sm font-semibold text-[#F85149]">Configuración no viable</p>
            <p className="text-xs text-[#8B949E]">El refrigerante seleccionado no puede operar en las condiciones actuales. Revise las advertencias.</p>
          </div>
        </div>
      )}
      {warnings.map((w, i) => (
        <div
          key={i}
          className={`flex items-start gap-3 rounded-lg border p-4 ${
            !viable
              ? "border-[#F85149]/20 bg-[#F85149]/[0.05]"
              : w.includes("75 %")
              ? "border-[#F0883E]/30 bg-[#F0883E]/10"
              : "border-[#79C0FF]/20 bg-[#79C0FF]/[0.05]"
          }`}
        >
          {w.includes("75 %") ? (
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-[#F0883E]" />
          ) : (
            <Info className="mt-0.5 h-5 w-5 shrink-0 text-[#79C0FF]" />
          )}
          <p className="text-sm text-[#E6EDF3]">{w}</p>
        </div>
      ))}
    </div>
  );
}
