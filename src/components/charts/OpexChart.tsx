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
import { formatCurrency } from "../../lib/utils";

export default function OpexChart() {
  const { results } = useProjectStore();
  const colors = useChartColors();

  const data = [
    { name: "Energía", Gas: results.opex.items[0].gas, BC: results.opex.items[0].bc },
    { name: "Mantenimiento", Gas: results.opex.items[1].gas + results.opex.items[2].gas + results.opex.items[3].gas, BC: results.opex.items[1].bc + results.opex.items[2].bc + results.opex.items[3].bc },
    { name: "Químicos/Agua", Gas: results.opex.items[4].gas + results.opex.items[5].gas, BC: results.opex.items[4].bc + results.opex.items[5].bc },
    { name: "Personal", Gas: results.opex.items[6].gas + results.opex.items[7].gas, BC: results.opex.items[6].bc + results.opex.items[7].bc },
    { name: "Admin/Seguros", Gas: results.opex.items[8].gas + results.opex.items[9].gas, BC: results.opex.items[8].bc + results.opex.items[9].bc },
    { name: "Emisiones", Gas: results.opex.items[11].gas, BC: results.opex.items[11].bc },
  ];

  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 12, fill: colors.text }} tickFormatter={(v) => formatCurrency(v, 0)} />
          <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: colors.text }} width={90} />
          <Tooltip formatter={(value: any) => formatCurrency(Number(value), 0)} contentStyle={{ borderRadius: 8, border: `1px solid ${colors.tooltipBorder}`, backgroundColor: colors.tooltipBg, color: colors.text }} />
          <Legend wrapperStyle={{ fontSize: 12, color: colors.text }} />
          <Bar dataKey="Gas" name="Sistema Vapor" fill="#EF4444" radius={[0, 4, 4, 0]} />
          <Bar dataKey="BC" name="Bomba de Calor" fill="#22C55E" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
