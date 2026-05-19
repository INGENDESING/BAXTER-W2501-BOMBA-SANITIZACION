import { useThermoStore } from "../../store/useThermoStore";

function fmt(v: number, d: number = 1) {
  return Number.isFinite(v) ? v.toFixed(d) : "—";
}

export default function BalanceTable() {
  const { result, params } = useThermoStore();

  const s1 = result.streams[0]; // C1: WFI Tanque 7 → Gas Cooler (75°C)
  const s2 = result.streams[1]; // C2: Gas Cooler → Distribución sanitización (90°C)
  const s_p1 = result.streams[2]; // P1: Piscina → Evaporador (28.9°C)
  const s_p2 = result.streams[3]; // P2: Evaporador → Salida fría (15°C)

  return (
    <div className="space-y-6">
      <h3 className="text-sm font-bold uppercase tracking-wider text-[#8B949E]">
        Balance de Materia y Energía · Circuitos Abiertos
      </h3>

      {/* ── Tabla de corrientes ── */}
      <div className="overflow-x-auto rounded-lg border border-[rgba(48,54,61,0.6)]">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr className="border-b border-[rgba(48,54,61,0.6)] bg-[#161B22]">
              <th className="px-3 py-2.5 text-left font-semibold text-[#8B949E]">Propiedad</th>
              <th className="px-3 py-2.5 text-center font-semibold text-[#8B949E]">
                <div>
                  <span className="text-[#F85149]">C1</span>
                  <div className="mt-0.5 text-[10px] font-normal text-[#8B949E]">Tanque 7 → Gas Cooler</div>
                </div>
              </th>
              <th className="px-3 py-2.5 text-center font-semibold text-[#8B949E]">
                <div>
                  <span className="text-[#F85149]">C2</span>
                  <div className="mt-0.5 text-[10px] font-normal text-[#8B949E]">Gas Cooler → Distribución</div>
                </div>
              </th>
              <th className="px-3 py-2.5 text-center font-semibold text-[#8B949E]">
                <div>
                  <span className="text-[#79C0FF]">P1</span>
                  <div className="mt-0.5 text-[10px] font-normal text-[#8B949E]">Piscina → Evaporador</div>
                </div>
              </th>
              <th className="px-3 py-2.5 text-center font-semibold text-[#8B949E]">
                <div>
                  <span className="text-[#79C0FF]">P2</span>
                  <div className="mt-0.5 text-[10px] font-normal text-[#8B949E]">Evaporador → Salida fría</div>
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[rgba(48,54,61,0.4)]">
            <tr>
              <td className="px-3 py-2 text-[#8B949E]">Temperatura</td>
              <td className="px-3 py-2 text-center text-[#E6EDF3]">{fmt(s1.T_C, 1)} °C</td>
              <td className="px-3 py-2 text-center text-[#E6EDF3]">{fmt(s2.T_C, 1)} °C</td>
              <td className="px-3 py-2 text-center text-[#E6EDF3]">{fmt(s_p1.T_C, 1)} °C</td>
              <td className="px-3 py-2 text-center text-[#E6EDF3]">{fmt(s_p2.T_C, 1)} °C</td>
            </tr>
            <tr className="bg-[#0D1117]/40">
              <td className="px-3 py-2 text-[#8B949E]">Presión absoluta</td>
              <td className="px-3 py-2 text-center text-[#E6EDF3]">{fmt(s1.props.P_bar, 3)} bar(a)</td>
              <td className="px-3 py-2 text-center text-[#E6EDF3]">{fmt(s2.props.P_bar, 3)} bar(a)</td>
              <td className="px-3 py-2 text-center text-[#E6EDF3]">{fmt(s_p1.props.P_bar, 3)} bar(a)</td>
              <td className="px-3 py-2 text-center text-[#E6EDF3]">{fmt(s_p2.props.P_bar, 3)} bar(a)</td>
            </tr>
            <tr>
              <td className="px-3 py-2 text-[#8B949E]">Flujo volumétrico</td>
              <td className="px-3 py-2 text-center text-[#E6EDF3]">{fmt(s1.volFlow, 2)} m³/h</td>
              <td className="px-3 py-2 text-center text-[#E6EDF3]">{fmt(s2.volFlow, 2)} m³/h</td>
              <td className="px-3 py-2 text-center text-[#E6EDF3]">{fmt(s_p1.volFlow, 2)} m³/h</td>
              <td className="px-3 py-2 text-center text-[#E6EDF3]">{fmt(s_p2.volFlow, 2)} m³/h</td>
            </tr>
            <tr className="bg-[#0D1117]/40">
              <td className="px-3 py-2 text-[#8B949E]">Flujo másico</td>
              <td className="px-3 py-2 text-center text-[#E6EDF3]">{fmt(s1.massFlow, 0)} kg/h</td>
              <td className="px-3 py-2 text-center text-[#E6EDF3]">{fmt(s2.massFlow, 0)} kg/h</td>
              <td className="px-3 py-2 text-center text-[#E6EDF3]">{fmt(s_p1.massFlow, 0)} kg/h</td>
              <td className="px-3 py-2 text-center text-[#E6EDF3]">{fmt(s_p2.massFlow, 0)} kg/h</td>
            </tr>
            <tr>
              <td className="px-3 py-2 text-[#8B949E]">Densidad (ρ)</td>
              <td className="px-3 py-2 text-center text-[#E6EDF3]">{fmt(s1.props.rho, 1)} kg/m³</td>
              <td className="px-3 py-2 text-center text-[#E6EDF3]">{fmt(s2.props.rho, 1)} kg/m³</td>
              <td className="px-3 py-2 text-center text-[#E6EDF3]">{fmt(s_p1.props.rho, 1)} kg/m³</td>
              <td className="px-3 py-2 text-center text-[#E6EDF3]">{fmt(s_p2.props.rho, 1)} kg/m³</td>
            </tr>
            <tr className="bg-[#0D1117]/40">
              <td className="px-3 py-2 text-[#8B949E]">Entalpía (h)</td>
              <td className="px-3 py-2 text-center text-[#E6EDF3]">{fmt(s1.props.h, 1)} kJ/kg</td>
              <td className="px-3 py-2 text-center text-[#E6EDF3]">{fmt(s2.props.h, 1)} kJ/kg</td>
              <td className="px-3 py-2 text-center text-[#E6EDF3]">{fmt(s_p1.props.h, 1)} kJ/kg</td>
              <td className="px-3 py-2 text-center text-[#E6EDF3]">{fmt(s_p2.props.h, 1)} kJ/kg</td>
            </tr>
            <tr>
              <td className="px-3 py-2 text-[#8B949E]">
                <span className="text-[#3FB950]">c<sub>p</sub></span>
              </td>
              <td className="px-3 py-2 text-center text-[#E6EDF3]">{fmt(s1.props.cp, 3)} kJ/kg·°C</td>
              <td className="px-3 py-2 text-center text-[#E6EDF3]">{fmt(s2.props.cp, 3)} kJ/kg·°C</td>
              <td className="px-3 py-2 text-center text-[#E6EDF3]">{fmt(s_p1.props.cp, 3)} kJ/kg·°C</td>
              <td className="px-3 py-2 text-center text-[#E6EDF3]">{fmt(s_p2.props.cp, 3)} kJ/kg·°C</td>
            </tr>
            <tr className="bg-[#0D1117]/40">
              <td className="px-3 py-2 text-[#8B949E]">Viscosidad (μ)</td>
              <td className="px-3 py-2 text-center text-[#E6EDF3]">{fmt(s1.props.mu_cP, 2)} cP</td>
              <td className="px-3 py-2 text-center text-[#E6EDF3]">{fmt(s2.props.mu_cP, 2)} cP</td>
              <td className="px-3 py-2 text-center text-[#E6EDF3]">{fmt(s_p1.props.mu_cP, 2)} cP</td>
              <td className="px-3 py-2 text-center text-[#E6EDF3]">{fmt(s_p2.props.mu_cP, 2)} cP</td>
            </tr>
            <tr>
              <td className="px-3 py-2 text-[#8B949E]">Conductividad (k)</td>
              <td className="px-3 py-2 text-center text-[#E6EDF3]">{fmt(s1.props.k, 3)} W/m·K</td>
              <td className="px-3 py-2 text-center text-[#E6EDF3]">{fmt(s2.props.k, 3)} W/m·K</td>
              <td className="px-3 py-2 text-center text-[#E6EDF3]">{fmt(s_p1.props.k, 3)} W/m·K</td>
              <td className="px-3 py-2 text-center text-[#E6EDF3]">{fmt(s_p2.props.k, 3)} W/m·K</td>
            </tr>
            <tr className="bg-[#0D1117]/40">
              <td className="px-3 py-2 text-[#8B949E]">Calor sensible (q)</td>
              <td className="px-3 py-2 text-center text-[#E6EDF3]">{fmt(s1.heatFlow, 2)} kW</td>
              <td className="px-3 py-2 text-center text-[#E6EDF3]">{fmt(s2.heatFlow, 2)} kW</td>
              <td className="px-3 py-2 text-center text-[#E6EDF3]">{fmt(s_p1.heatFlow, 2)} kW</td>
              <td className="px-3 py-2 text-center text-[#E6EDF3]">{fmt(s_p2.heatFlow, 2)} kW</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ── Balance de energía ── */}
      <div className="rounded-lg border border-[rgba(48,54,61,0.6)] bg-[#161B22]/60 p-4">
        <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#8B949E]">
          Balance Energía
        </h4>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex justify-between rounded-md bg-[#0D1117]/60 px-3 py-2">
            <span className="text-[#8B949E]">Q<sub>cond</sub> (Gas Cooler)</span>
            <span className="font-semibold text-[#F85149]">{fmt(result.Q_cond_kw, 1)} kW</span>
          </div>
          <div className="flex justify-between rounded-md bg-[#0D1117]/60 px-3 py-2">
            <span className="text-[#8B949E]">W<sub>comp</sub></span>
            <span className="font-semibold text-[#F0883E]">{fmt(result.W_comp_kw, 1)} kW</span>
          </div>
          <div className="flex justify-between rounded-md bg-[#0D1117]/60 px-3 py-2">
            <span className="text-[#8B949E]">Q<sub>evap</sub></span>
            <span className="font-semibold text-[#A371F7]">{fmt(result.Q_evap_kw, 1)} kW</span>
          </div>
          <div className="flex justify-between rounded-md bg-[#0D1117]/60 px-3 py-2">
            <span className="text-[#8B949E]">COP<sub>operativo</sub></span>
            <span className="font-semibold text-[#79C0FF]">{fmt(result.COP_calc, 3)}</span>
          </div>
        </div>
        {params.incluirPerdidas && (
          <div className="mt-3 flex justify-between rounded-md bg-[#0D1117]/60 px-3 py-2 text-sm">
            <span className="text-[#8B949E]">Q<sub>disp</sub> (con pérdidas)</span>
            <span className="font-semibold text-[#F85149]">{fmt(result.Q_disp_kw!, 1)} kW</span>
          </div>
        )}
        <div className="mt-3 text-xs text-[#8B949E]">
          Q<sub>cond</sub> = Q<sub>evap</sub> + W<sub>comp</sub> &nbsp;|&nbsp;
          Cerradura: <span className="font-semibold text-[#3FB950]">{fmt(result.energyClosurePct, 4)} %</span>
        </div>
      </div>

      {/* ── Leyendas ── */}
      <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-[#8B949E]">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 rounded-full bg-[#F85149]" /> Caliente (WFI sanitización)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 rounded-full bg-[#79C0FF]" /> Frío (piscina)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 rounded-full bg-[#F0883E]" /> Ciclo CO₂ interno
        </span>
      </div>
    </div>
  );
}
