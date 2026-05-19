import { useTheme } from "../context/ThemeContext";

export function useChartColors() {
  const { isDark } = useTheme();

  if (isDark) {
    return {
      text: "#C9D1D9",
      textMuted: "#8B949E",
      grid: "#30363D",
      tooltipBg: "#161B22",
      tooltipBorder: "rgba(48, 54, 61, 0.8)",
      // Data series — vibrant on dark
      series: ["#79C0FF", "#3FB950", "#F0883E", "#8957E5", "#F85149", "#D29922"],
      areaOpacity: 0.15,
    };
  }

  return {
    text: "#1E293B",
    textMuted: "#64748B",
    grid: "#E2E8F0",
    tooltipBg: "#FFFFFF",
    tooltipBorder: "#E2E8F0",
    series: ["#2563EB", "#16A34A", "#D97706", "#7C3AED", "#DC2626", "#CA8A04"],
    areaOpacity: 0.12,
  };
}
