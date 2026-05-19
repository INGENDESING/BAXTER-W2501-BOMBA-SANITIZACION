import {
  RadarChart as ReRadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { useProjectStore } from "../../store/useProjectStore";
import { useChartColors } from "../../hooks/useChartColors";

export default function RadarChart() {
  const { results } = useProjectStore();
  const colors = useChartColors();

  const data = [
    { subject: "Eficiencia", Gas: 79, BC: 100 },
    { subject: "Costo op.", Gas: 100, BC: Math.round((results.opex.totalBC / results.opex.totalGas) * 100) },
    { subject: "Emisiones", Gas: 100, BC: Math.round((results.emisiones.co2BC / results.emisiones.co2Gas) * 100) },
    { subject: "Mantenimiento", Gas: 100, BC: Math.round(((results.opex.items[1].bc + results.opex.items[2].bc + results.opex.items[3].bc) / (results.opex.items[1].gas + results.opex.items[2].gas + results.opex.items[3].gas)) * 100) },
    { subject: "Seguridad", Gas: 65, BC: 90 },
    { subject: "ROI", Gas: 0, BC: 100 },
  ];

  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ReRadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid stroke={colors.grid} />
          <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: colors.text }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10, fill: colors.textMuted }} />
          <Radar name="Caldera gas" dataKey="Gas" stroke="#EF4444" fill="#EF4444" fillOpacity={0.15} />
          <Radar name="Bomba de calor" dataKey="BC" stroke="#22C55E" fill="#22C55E" fillOpacity={0.15} />
          <Legend wrapperStyle={{ fontSize: 12, color: colors.text }} />
          <Tooltip contentStyle={{ borderRadius: 8, border: `1px solid ${colors.tooltipBorder}`, backgroundColor: colors.tooltipBg, color: colors.text }} />
        </ReRadarChart>
      </ResponsiveContainer>
    </div>
  );
}
