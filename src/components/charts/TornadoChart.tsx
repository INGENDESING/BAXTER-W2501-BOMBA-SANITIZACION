import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { useProjectStore } from "../../store/useProjectStore";
import { useChartColors } from "../../hooks/useChartColors";
import { formatCurrency } from "../../lib/utils";

export default function TornadoChart() {
  const { results } = useProjectStore();
  const colors = useChartColors();

  const data = results.sensibilidad.tornadoData.map((d) => ({
    name: d.variable,
    Bajo: d.low,
    Alto: d.high,
  }));

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 12, fill: colors.text }} tickFormatter={(v) => formatCurrency(v, 0)} />
          <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: colors.text }} width={80} />
          <Tooltip formatter={(value: any) => formatCurrency(Number(value), 0)} contentStyle={{ borderRadius: 8, border: `1px solid ${colors.tooltipBorder}`, backgroundColor: colors.tooltipBg, color: colors.text }} />
          <ReferenceLine x={0} stroke={colors.textMuted} strokeWidth={1} />
          <Bar dataKey="Bajo" name="Bajo (-25%)" fill="#EF4444" radius={[0, 4, 4, 0]} />
          <Bar dataKey="Alto" name="Alto (+25%)" fill="#22C55E" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
