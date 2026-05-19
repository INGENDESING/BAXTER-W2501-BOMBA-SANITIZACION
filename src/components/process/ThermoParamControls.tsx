import { useThermoStore } from "../../store/useThermoStore";
import RefrigerantSelector from "./RefrigerantSelector";
import ThermoAlert from "./ThermoAlert";
import { RotateCcw, ArrowRightLeft, Snowflake, DollarSign } from "lucide-react";

function Slider({
  label,
  value,
  min,
  max,
  step,
  suffix,
  onChange,
  hint,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  suffix: string;
  onChange: (v: number) => void;
  hint?: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-[#E6EDF3]">{label}</label>
        <span className="rounded-md bg-[#79C0FF]/10 px-2 py-0.5 text-xs font-semibold text-[#79C0FF]">
          {value.toFixed(step < 0.1 ? 2 : 1)}{suffix}
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
          className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-[rgba(48,54,61,0.6)] accent-[#79C0FF]"
        />
        <input
          type="number"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          className="w-24 rounded-md border border-[rgba(48,54,61,0.6)] bg-[#0D1117] px-2 py-1 text-right text-sm text-[#E6EDF3] focus:border-[#79C0FF] focus:outline-none focus:ring-1 focus:ring-[#79C0FF]"
        />
      </div>
      {hint && <p className="text-xs text-[#8B949E]">{hint}</p>}
    </div>
  );
}

export default function ThermoParamControls() {
  const {
    params,
    result,
    refrigerantValidation,
    setDeltaTCaliente,
    setTempSalidaPiscina,
    setCOP,
    togglePerdidas,
    setPerdidas,
    resetParams,
    syncToEconomic,
  } = useThermoStore();

  const deltaT_caliente = params.T_c2 - params.T_c1;

  // Formato moneda
  const fmtUSD = (v: number) =>
    v >= 1_000_000
      ? `$${(v / 1_000_000).toFixed(2)} M`
      : v >= 1_000
      ? `$${(v / 1_000).toFixed(1)} k`
      : `$${v.toFixed(0)}`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold uppercase tracking-wider text-[#8B949E]">
          Parámetros del Proceso
        </h3>
        <button
          onClick={resetParams}
          className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-[#8B949E] transition-colors hover:bg-[#161B22] hover:text-[#E6EDF3]"
          title="Restaurar valores por defecto"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset
        </button>
      </div>

      <RefrigerantSelector />

      <div className="space-y-5">
        {/* ΔT lado caliente */}
        <Slider
          label="ΔT lado caliente (C2 − C1)"
          value={deltaT_caliente}
          min={10}
          max={40}
          step={0.1}
          suffix=" K"
          onChange={setDeltaTCaliente}
          hint={`T entrada = ${params.T_c1} °C → T salida = ${params.T_c2.toFixed(1)} °C · Caudal = ${result.volFlow_sanitizacion_m3h.toFixed(2)} m³/h`}
        />

        {/* Temperatura salida piscina */}
        <Slider
          label="T salida agua piscina (evaporador)"
          value={params.T_piscina_out}
          min={10}
          max={25}
          step={0.1}
          suffix=" °C"
          onChange={setTempSalidaPiscina}
          hint={`T entrada = ${params.T_piscina_in} °C → T salida = ${params.T_piscina_out.toFixed(1)} °C · Caudal = ${result.volFlow_piscina_m3h.toFixed(2)} m³/h · Q_evap = ${result.Q_evap_kw.toFixed(1)} kW`}
        />

        {/* COP */}
        <Slider
          label="COP operativo"
          value={params.copOperativo}
          min={2.0}
          max={5.0}
          step={0.05}
          suffix=""
          onChange={setCOP}
          hint={`COP Carnot (referencia) = ${refrigerantValidation.copCarnot.toFixed(2)}`}
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-[#E6EDF3]">Incluir pérdidas térmicas del tanque</label>
          <button
            onClick={togglePerdidas}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              params.incluirPerdidas ? "bg-[#79C0FF]" : "bg-[rgba(48,54,61,0.6)]"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                params.incluirPerdidas ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
        {params.incluirPerdidas && (
          <Slider
            label="Pérdidas térmicas"
            value={params.Q_perdidas_kw}
            min={0}
            max={15}
            step={0.1}
            suffix=" kW"
            onChange={setPerdidas}
          />
        )}
      </div>

      <ThermoAlert />

      {/* ── KPIs Térmicos ── */}
      <div className="rounded-lg border border-[rgba(48,54,61,0.5)] bg-[#161B22]/60 p-4">
        <p className="text-xs font-semibold text-[#E6EDF3]">KPIs Térmicos</p>
        <div className="mt-3 grid grid-cols-2 gap-y-2 text-xs">
          <span className="text-[#8B949E]">Capacidad equipo (Data Sheet)</span>
          <span className="text-right text-[#E6EDF3]">490 kW</span>
          <span className="text-[#8B949E]">Q<sub>cond</sub> (calc.)</span>
          <span className="text-right text-[#3FB950]">{result.Q_cond_kw.toFixed(2)} kW</span>
          <span className="text-[#8B949E]">Q<sub>evap</sub></span>
          <span className="text-right text-[#A371F7]">{result.Q_evap_kw.toFixed(2)} kW</span>
          <span className="text-[#8B949E]">W<sub>comp</sub></span>
          <span className="text-right text-[#F0883E]">{result.W_comp_kw.toFixed(2)} kW</span>
          <span className="text-[#8B949E]">COP<sub>calc</sub></span>
          <span className="text-right text-[#79C0FF]">{result.COP_calc.toFixed(3)}</span>
          {params.incluirPerdidas && (
            <>
              <span className="text-[#8B949E]">Q<sub>disp</sub></span>
              <span className="text-right text-[#E6EDF3]">{result.Q_disp_kw.toFixed(2)} kW</span>
            </>
          )}
        </div>
      </div>

      {/* ── Métricas de Refrigeración ── */}
      <div className="rounded-lg border border-[#A371F7]/30 bg-[#A371F7]/5 p-4">
        <div className="flex items-center gap-2">
          <Snowflake className="h-4 w-4 text-[#A371F7]" />
          <p className="text-xs font-semibold text-[#E6EDF3]">Métricas de Refrigeración</p>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-y-2 text-xs">
          <span className="text-[#8B949E]">Q<sub>evap</sub></span>
          <span className="text-right text-[#A371F7]">{result.Q_evap_kw.toFixed(1)} kW</span>
          <span className="text-[#8B949E]">Capacidad frío</span>
          <span className="text-right text-[#A371F7]">{result.TR_evap.toFixed(1)} TR</span>
          <span className="text-[#8B949E]">Eficiencia</span>
          <span className="text-right text-[#79C0FF]">{result.kw_per_TR.toFixed(2)} kW/TR</span>
          <span className="col-span-2 mt-1 border-t border-[rgba(48,54,61,0.3)] pt-2 text-[10px] text-[#8B949E]">
            Ref: chiller estándar COP<sub>R</sub>=3,5 → {(3.51685 / 3.5).toFixed(2)} kW/TR
          </span>
        </div>
      </div>

      {/* ── Comparativa de Costos ── */}
      <div className="rounded-lg border border-[#F0883E]/30 bg-[#F0883E]/5 p-4">
        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-[#F0883E]" />
          <p className="text-xs font-semibold text-[#E6EDF3]">Comparativa Costo Anual (Lado Frío)</p>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-y-2 text-xs">
          <span className="text-[#8B949E]">Costo BC</span>
          <span className="text-right text-[#E6EDF3]">{fmtUSD(result.costo_bc_refrig_usd_año)}/año</span>
          <span className="text-[#8B949E]">Costo chiller eq.</span>
          <span className="text-right text-[#8B949E]">{fmtUSD(result.costo_chiller_equiv_usd_año)}/año</span>
          <span className="text-[#8B949E]">Diferencia</span>
          <span className={`text-right font-semibold ${result.ahorro_vs_chiller_usd_año >= 0 ? "text-[#3FB950]" : "text-[#F85149]"}`}>
            {result.ahorro_vs_chiller_usd_año >= 0 ? "−" : "+"}
            {fmtUSD(Math.abs(result.ahorro_vs_chiller_usd_año))}/año
          </span>
        </div>
        <p className="mt-2 text-[10px] text-[#8B949E]">
          Comparación a 4.000 h/año @ 0,113 USD/kWh. La BC consume más electricidad por TR
          que un chiller dedicado, pero su valor está en el calor útil recuperado (COP total).
        </p>
      </div>

      <button
        onClick={() => {
          const synced = syncToEconomic();
          if (synced) {
            // eslint-disable-next-line no-console
            console.log("Sincronizado con estudio económico:", synced);
          }
        }}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#3FB950]/30 bg-[#3FB950]/10 py-2.5 text-xs font-semibold text-[#3FB950] transition-all hover:bg-[#3FB950]/20"
      >
        <ArrowRightLeft className="h-3.5 w-3.5" />
        Sincronizar con estudio económico
      </button>
    </div>
  );
}
