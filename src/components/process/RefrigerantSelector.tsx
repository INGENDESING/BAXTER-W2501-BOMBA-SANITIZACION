import { useThermoStore } from "../../store/useThermoStore";
import { REFRIGERANTS } from "../../../shared/thermo/refrigerants";

export default function RefrigerantSelector() {
  const { refrigerant, setRefrigerant } = useThermoStore();
  const selected = REFRIGERANTS.find((r) => r.name === refrigerant);

  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-[#8B949E]">
          Refrigerante
        </label>
        <select
          value={refrigerant}
          onChange={(e) => setRefrigerant(e.target.value)}
          className="mt-2 w-full rounded-lg border border-[rgba(48,54,61,0.6)] bg-[#0D1117] px-3 py-2.5 text-sm text-[#E6EDF3] focus:border-[#79C0FF] focus:outline-none focus:ring-1 focus:ring-[#79C0FF]"
        >
          {REFRIGERANTS.map((r) => (
            <option key={r.name} value={r.name}>
              {r.name}
            </option>
          ))}
        </select>
      </div>

      {selected && (
        <div className="rounded-lg border border-[rgba(48,54,61,0.5)] bg-[#161B22]/60 p-4">
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-[#79C0FF]/10 px-2.5 py-1 text-xs font-medium text-[#79C0FF] ring-1 ring-[#79C0FF]/20">
              GWP {selected.GWP}
            </span>
            <span className="rounded-full bg-[#3FB950]/10 px-2.5 py-1 text-xs font-medium text-[#3FB950] ring-1 ring-[#3FB950]/20">
              ASHRAE {selected.ashraeClass}
            </span>
            <span className="rounded-full bg-[#F0883E]/10 px-2.5 py-1 text-xs font-medium text-[#F0883E] ring-1 ring-[#F0883E]/20">
              COP {selected.copRange}
            </span>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-[#8B949E]">{selected.notes}</p>
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
            <div className="text-[#8B949E]">T<sub>crít</sub></div>
            <div className="text-right text-[#E6EDF3]">{selected.T_crit_C} °C</div>
            <div className="text-[#8B949E]">P<sub>crít</sub></div>
            <div className="text-right text-[#E6EDF3]">{selected.P_crit_bar} bar</div>
          </div>
        </div>
      )}
    </div>
  );
}
