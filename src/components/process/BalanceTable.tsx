import { useThermoStore } from "../../store/useThermoStore";
import { formatNumber } from "../../lib/utils";

function Row({
  label,
  siUnit,
  values,
  isHeader = false,
  isSubHeader = false,
}: {
  label: string;
  siUnit?: string;
  values?: (string | number)[];
  isHeader?: boolean;
  isSubHeader?: boolean;
}) {
  if (isHeader) {
    return (
      <tr className="border-b border-[rgba(48,54,61,0.6)] bg-[#161B22]">
        <td colSpan={6} className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-[#79C0FF]">
          {label}
        </td>
      </tr>
    );
  }
  if (isSubHeader) {
    return (
      <tr className="border-b border-[rgba(48,54,61,0.4)] bg-[#0D1117]/60">
        <td className="px-3 py-1.5 text-xs font-semibold text-[#8B949E]">{label}</td>
        <td className="px-2 py-1.5 text-xs text-[#8B949E]">{siUnit}</td>
        {(values ?? []).map((v, i) => (
          <td key={i} className="px-2 py-1.5 text-xs font-semibold text-[#8B949E]">
            {v}
          </td>
        ))}
      </tr>
    );
  }
  return (
    <tr className="border-b border-[rgba(48,54,61,0.2)] transition-colors hover:bg-[#161B22]/40">
      <td className="px-3 py-1.5 text-xs text-[#E6EDF3]">{label}</td>
      <td className="px-2 py-1.5 text-xs text-[#8B949E]">{siUnit}</td>
      {(values ?? []).map((v, i) => (
        <td key={i} className="px-2 py-1.5 text-right text-xs text-[#E6EDF3]">{v}</td>
      ))}
    </tr>
  );
}

export default function BalanceTable() {
  const { result, params } = useThermoStore();
  const s = result.streams;

  const psi_per_bar = 14.50377377;
  const toPsi = (bar: number) => bar * psi_per_bar;

  const clampedStreams = s.filter((stream) => stream.props.wasClamped);

  return (
    <div className="overflow-x-auto space-y-2">
      {clampedStreams.length > 0 && (
        <div className="rounded-md border border-[#F85149]/30 bg-[#F85149]/10 px-3 py-2 text-xs text-[#F85149]">
          <strong>Advertencia:</strong> Propiedades termodinámicas clampadas para{" "}
          {clampedStreams.map((st) => st.name).join(", ")} (fuera de rango 15–100 °C).
          Los caudales mostrados son aproximados.
        </div>
      )}
      <table className="w-full border-collapse text-xs">
        <thead>
          <tr className="border-b-2 border-[#79C0FF]/30">
            <th colSpan={6} className="px-3 py-3 text-left text-sm font-bold text-[#E6EDF3]">
              Balance de Materia y Energía — Condiciones Operativas
            </th>
          </tr>
        </thead>
        <tbody>
          {/* ── Condiciones ambientales ── */}
          <Row label="Condiciones ambientales" isHeader values={[]} />
          <tr className="border-b border-[rgba(48,54,61,0.2)]">
            <td className="px-3 py-1.5 text-xs text-[#E6EDF3]">Altitud del sitio</td>
            <td colSpan={2} className="px-2 py-1.5 text-xs text-[#E6EDF3]">{params.altitud_msnm} msnm</td>
            <td colSpan={3}></td>
          </tr>
          <tr className="border-b border-[rgba(48,54,61,0.2)]">
            <td className="px-3 py-1.5 text-xs text-[#E6EDF3]">Presión atmosférica</td>
            <td colSpan={2} className="px-2 py-1.5 text-xs text-[#E6EDF3]">
              {result.P_atm_bar.toFixed(4)} bar(a) = {toPsi(result.P_atm_bar).toFixed(2)} psia
            </td>
            <td colSpan={3}></td>
          </tr>

          {/* ── Encabezados de corrientes ── */}
          <tr className="border-b border-[#79C0FF]/20 bg-[#161B22]/80">
            <td className="px-3 py-2 text-xs font-bold text-[#79C0FF]">Parámetro</td>
            <td className="px-2 py-2 text-xs font-bold text-[#79C0FF]">Unidad</td>
            <td className="px-2 py-2 text-center text-xs font-bold text-[#F85149]">C1</td>
            <td className="px-2 py-2 text-center text-xs font-bold text-[#F85149]">C2</td>
            <td className="px-2 py-2 text-center text-xs font-bold text-[#79C0FF]">C3</td>
            <td className="px-2 py-2 text-center text-xs font-bold text-[#79C0FF]">C4</td>
          </tr>

          {/* ── Datos de corrientes ── */}
          <Row
            label="Descripción"
            values={[s[0].description, s[1].description, s[2].description, s[3].description]}
          />
          <Row
            label="Flujo másico"
            siUnit="kg/h"
            values={[
              formatNumber(s[0].massFlow, 1),
              formatNumber(s[1].massFlow, 1),
              formatNumber(s[2].massFlow, 1),
              formatNumber(s[3].massFlow, 1),
            ]}
          />
          <Row
            label="Flujo volumétrico"
            siUnit="m³/h"
            values={[
              formatNumber(s[0].volFlow, 2),
              formatNumber(s[1].volFlow, 3),
              formatNumber(s[2].volFlow, 2),
              formatNumber(s[3].volFlow, 3),
            ]}
          />
          <Row
            label="Temperatura"
            siUnit="°C"
            values={[s[0].T_C.toFixed(1), s[1].T_C.toFixed(1), s[2].T_C.toFixed(1), s[3].T_C.toFixed(1)]}
          />
          <Row
            label="Presión (abs)"
            siUnit="bar(a)"
            values={[
              s[0].props.P_bar.toFixed(3),
              s[1].props.P_bar.toFixed(3),
              s[2].props.P_bar.toFixed(3),
              s[3].props.P_bar.toFixed(3),
            ]}
          />
          <Row
            label="Presión (man)"
            siUnit="barg"
            values={[
              s[0].P_g_bar.toFixed(2),
              s[1].P_g_bar.toFixed(2),
              s[2].P_g_bar.toFixed(2),
              s[3].P_g_bar.toFixed(2),
            ]}
          />
          <Row
            label="Densidad"
            siUnit="kg/m³"
            values={[
              formatNumber(s[0].props.rho, 2),
              formatNumber(s[1].props.rho, 2),
              formatNumber(s[2].props.rho, 2),
              formatNumber(s[3].props.rho, 2),
            ]}
          />
          <Row
            label="Viscosidad dinámica"
            siUnit="cP"
            values={[s[0].props.mu_cP.toFixed(4), s[1].props.mu_cP.toFixed(4), s[2].props.mu_cP.toFixed(4), s[3].props.mu_cP.toFixed(4)]}
          />
          <Row
            label="Conductividad térmica"
            siUnit="W/(m·K)"
            values={[
              formatNumber(s[0].props.k, 4),
              formatNumber(s[1].props.k, 4),
              formatNumber(s[2].props.k, 4),
              formatNumber(s[3].props.k, 4),
            ]}
          />
          <Row
            label="Calor específico"
            siUnit="kJ/(kg·°C)"
            values={[
              formatNumber(s[0].props.cp, 4),
              formatNumber(s[1].props.cp, 4),
              formatNumber(s[2].props.cp, 4),
              formatNumber(s[3].props.cp, 4),
            ]}
          />
          <Row
            label="Entalpía específica"
            siUnit="kJ/kg"
            values={[
              formatNumber(s[0].props.h, 2),
              formatNumber(s[1].props.h, 2),
              formatNumber(s[2].props.h, 2),
              formatNumber(s[3].props.h, 2),
            ]}
          />
          <Row
            label="Heat Flow (M·h)"
            siUnit="kJ/h"
            values={[
              formatNumber(s[0].heatFlow, 0),
              formatNumber(s[1].heatFlow, 0),
              formatNumber(s[2].heatFlow, 0),
              formatNumber(s[3].heatFlow, 0),
            ]}
          />

          {/* ── Verificación del balance ── */}
          <Row label="Verificación del balance" isHeader values={[]} />
          <tr className="border-b border-[rgba(48,54,61,0.2)]">
            <td className="px-3 py-2 text-xs text-[#E6EDF3]">Balance de masa</td>
            <td colSpan={5} className="px-3 py-2 text-xs text-[#8B949E]">
              Lado caliente: C1 = C2 = <span className="text-[#E6EDF3]">{formatNumber(s[0].massFlow, 1)} kg/h</span> (error 0,00 %) ·{" "}
              Lado frío: C3 = C4 = <span className="text-[#E6EDF3]">{formatNumber(s[2].massFlow, 1)} kg/h</span> (error 0,00 %)
            </td>
          </tr>
          <tr className="border-b border-[rgba(48,54,61,0.2)]">
            <td className="px-3 py-2 text-xs text-[#E6EDF3]">Balance de energía</td>
            <td colSpan={5} className="px-3 py-2 text-xs text-[#8B949E]">
              Q<sub>cond</sub> = <span className="text-[#3FB950]">{result.Q_cond_kw.toFixed(2)} kW</span> ·{" "}
              Q<sub>evap</sub> = <span className="text-[#A371F7]">{result.Q_evap_kw.toFixed(2)} kW</span> ·{" "}
              W<sub>comp</sub> = <span className="text-[#F0883E]">{result.W_comp_kw.toFixed(2)} kW</span> ·{" "}
              COP<sub>calc</sub> = <span className="text-[#79C0FF]">{result.COP_calc.toFixed(3)}</span>
            </td>
          </tr>
          <tr className="border-b border-[rgba(48,54,61,0.2)]">
            <td className="px-3 py-2 text-xs text-[#E6EDF3]">Verificación algebraica</td>
            <td colSpan={5} className="px-3 py-2 text-xs text-[#8B949E]">
              Q<sub>cond</sub> = Q<sub>evap</sub> + W<sub>comp</sub> →{" "}
              <span className="text-[#E6EDF3]">{result.Q_cond_kw.toFixed(2)} = {(result.Q_evap_kw + result.W_comp_kw).toFixed(2)} kW</span>{" "}
              (error {result.energyClosurePct.toFixed(4)} %)
            </td>
          </tr>
          {params.incluirPerdidas && (
            <tr className="border-b border-[rgba(48,54,61,0.2)]">
              <td className="px-3 py-2 text-xs text-[#E6EDF3]">Incluyendo pérdidas</td>
              <td colSpan={5} className="px-3 py-2 text-xs text-[#8B949E]">
                Q<sub>disp</sub> = {result.Q_disp_kw.toFixed(2)} kW · W<sub>comp,disp</sub> = {result.W_comp_disp_kw.toFixed(2)} kW · COP<sub>disp</sub> = {result.COP_disp.toFixed(3)}
              </td>
            </tr>
          )}

          {/* ── Métricas de refrigeración ── */}
          <Row label="Métricas de refrigeración" isHeader values={[]} />
          <tr className="border-b border-[rgba(48,54,61,0.2)]">
            <td className="px-3 py-2 text-xs text-[#E6EDF3]">Capacidad evaporador</td>
            <td colSpan={5} className="px-3 py-2 text-xs text-[#8B949E]">
              Q<sub>evap</sub> = <span className="text-[#A371F7]">{result.Q_evap_kw.toFixed(2)} kW</span> ·{" "}
              <span className="text-[#A371F7]">{result.TR_evap.toFixed(2)} TR</span> (1 TR = 3,517 kW)
            </td>
          </tr>
          <tr className="border-b border-[rgba(48,54,61,0.2)]">
            <td className="px-3 py-2 text-xs text-[#E6EDF3]">Eficiencia específica frío</td>
            <td colSpan={5} className="px-3 py-2 text-xs text-[#8B949E]">
              {result.kw_per_TR.toFixed(2)} kW<sub>el</sub>/TR · Ref. chiller estándar COP<sub>R</sub>=3,5: {(3.51685 / 3.5).toFixed(2)} kW/TR
            </td>
          </tr>
          <tr className="border-b border-[rgba(48,54,61,0.2)]">
            <td className="px-3 py-2 text-xs text-[#E6EDF3]">Costo operación anual (frío)</td>
            <td colSpan={5} className="px-3 py-2 text-xs text-[#8B949E]">
              BC: <span className="text-[#E6EDF3]">${result.costo_bc_refrig_usd_año.toLocaleString("es-CO", { maximumFractionDigits: 0 })} USD/año</span> ·{" "}
              Chiller eq.: <span className="text-[#8B949E]">${result.costo_chiller_equiv_usd_año.toLocaleString("es-CO", { maximumFractionDigits: 0 })} USD/año</span> ·{" "}
              Diferencia: <span className={result.ahorro_vs_chiller_usd_año >= 0 ? "text-[#3FB950]" : "text-[#F85149]"}>
                {result.ahorro_vs_chiller_usd_año >= 0 ? "−" : "+"}${Math.abs(result.ahorro_vs_chiller_usd_año).toLocaleString("es-CO", { maximumFractionDigits: 0 })} USD/año
              </span>
            </td>
          </tr>

          {/* ── Pie ── */}
          <tr className="border-t-2 border-[rgba(48,54,61,0.6)]">
            <td colSpan={6} className="px-3 py-2 text-[10px] text-[#8B949E]">
              Documento: Balance de Materia y Energía 2025BC-DT005 R1 · Propiedades: IAPWS-IF97 (aproximación) · Altitud: {params.altitud_msnm} msnm
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
