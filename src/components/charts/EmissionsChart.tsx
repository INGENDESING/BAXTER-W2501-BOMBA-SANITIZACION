import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useProjectStore } from "../../store/useProjectStore";
import { useChartColors } from "../../hooks/useChartColors";
import { formatNumber } from "../../lib/utils";

export default function EmissionsChart() {
  const { results } = useProjectStore();
  const colors = useChartColors();

  const data = [
    { name: "Emisiones CO₂ (t/año)", Gas: results.emisiones.co2Gas, BC: results.emisiones.co2BC },
  ];

  return (
    <div className="h-[220px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
          <XAxis dataKey="name" tick={{ fontSize: 12, fill: colors.text }} />
          <YAxis tick={{ fontSize: 12, fill: colors.text }} tickFormatter={(v) => formatNumber(v, 0)} />
          <Tooltip formatter={(value: any) => formatNumber(Number(value), 1)} contentStyle={{ borderRadius: 8, border: `1px solid ${colors.tooltipBorder}`, backgroundColor: colors.tooltipBg, color: colors.text }} />
          <Legend wrapperStyle={{ fontSize: 12, color: colors.text }} />
          <Bar dataKey="Gas" name="Caldera gas" fill="#EF4444" radius={[6, 6, 0, 0]} />
          <Bar dataKey="BC" name="Bomba de calor" fill="#22C55E" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
