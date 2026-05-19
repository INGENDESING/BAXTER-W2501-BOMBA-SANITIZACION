import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useProjectStore } from "../../store/useProjectStore";
import { useChartColors } from "../../hooks/useChartColors";
import { formatCurrency } from "../../lib/utils";

const COLORS = ["#0F2C59", "#3B6CB4", "#5B9BD5", "#22C55E", "#F97316", "#EF4444"];
const DARK_COLORS = ["#60A5FA", "#3B82F6", "#2563EB", "#34D399", "#FB923C", "#F87171"];

export default function CapexChart() {
  const { results } = useProjectStore();
  const { text } = useChartColors();
  const isDark = text === "#CBD5E1";
  const palette = isDark ? DARK_COLORS : COLORS;

  const cats = ["Equipos principales", "Instrumentación y control", "Sistemas auxiliares", "Ingeniería", "Instalación", "Puesta en marcha"];
  const data = cats.map((cat) => ({
    name: cat,
    value: results.capex.items.filter((i) => i.categoria === cat).reduce((s, i) => s + i.cantidad * i.costoUnitario, 0),
  }));

  return (
    <div className="h-[260px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value" strokeWidth={0}>
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={palette[index % palette.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value: any) => formatCurrency(Number(value), 0)} contentStyle={{ borderRadius: 8, border: `1px solid ${isDark ? "#1F2937" : "#E2E8F0"}`, backgroundColor: isDark ? "#111827" : "#FFFFFF", color: isDark ? "#CBD5E1" : "#1E293B" }} />
          <Legend wrapperStyle={{ fontSize: 11, color: text }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
