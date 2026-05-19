import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useProjectStore } from "../../store/useProjectStore";
import { useChartColors } from "../../hooks/useChartColors";
import { formatCurrency } from "../../lib/utils";

export default function CashFlowChart() {
  const { results } = useProjectStore();
  const colors = useChartColors();

  const data = results.cashFlow.years.map((y) => ({
    year: y.year,
    Pesimista: y.year === 0 ? -results.scenarios[0].capex : results.scenarios[0].ahorroAnio1 * Math.pow(1.03, y.year - 1),
    Base: y.flujoCaja,
    Optimista: y.year === 0 ? -results.scenarios[2].capex : results.scenarios[2].ahorroAnio1 * Math.pow(1.07, y.year - 1),
  }));

  let acPes = 0, acBase = 0, acOpt = 0;
  const accData = data.map((d) => {
    acPes += d.Pesimista / Math.pow(1.10, d.year || 1);
    acBase += d.Base / Math.pow(1 + results.params.wacc, d.year || 1);
    acOpt += d.Optimista / Math.pow(1.06, d.year || 1);
    if (d.year === 0) {
      acPes = d.Pesimista;
      acBase = d.Base;
      acOpt = d.Optimista;
    }
    return { ...d, acPes, acBase, acOpt };
  });

  return (
    <div className="h-[320px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={accData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
          <XAxis dataKey="year" tick={{ fontSize: 12, fill: colors.text }} />
          <YAxis tick={{ fontSize: 12, fill: colors.text }} tickFormatter={(v) => formatCurrency(v, 0)} />
          <Tooltip
            formatter={(value: any) => formatCurrency(Number(value), 0)}
            contentStyle={{ borderRadius: 8, border: `1px solid ${colors.tooltipBorder}`, backgroundColor: colors.tooltipBg, color: colors.text }}
          />
          <Legend wrapperStyle={{ fontSize: 12, color: colors.text }} />
          <Line type="monotone" dataKey="acPes" name="Pesimista" stroke="#EF4444" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
          <Line type="monotone" dataKey="acBase" name="Base" stroke={colors.text === "#CBD5E1" ? "#60A5FA" : "#0F2C59"} strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
          <Line type="monotone" dataKey="acOpt" name="Optimista" stroke="#22C55E" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
