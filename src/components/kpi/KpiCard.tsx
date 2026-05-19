import { motion } from "framer-motion";
import { type LucideIcon } from "lucide-react";
import { cn } from "../../lib/utils";
import { useCountUp } from "../../hooks/useCountUp";

interface KpiCardProps {
  label: string;
  value: string;
  rawValue?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  sub?: string;
  variant?: "default" | "success" | "warning" | "caution" | "danger" | "capex";
  icon?: LucideIcon;
  index?: number;
}

const variantColors = {
  default: {
    border: "border-l-[#79C0FF]",
    iconBg: "bg-[#79C0FF]/10 text-[#79C0FF]",
    glow: "hover:shadow-[0_0_20px_rgba(121,192,255,0.08)]",
  },
  success: {
    border: "border-l-[#3FB950]",
    iconBg: "bg-[#3FB950]/10 text-[#3FB950]",
    glow: "hover:shadow-[0_0_20px_rgba(63,185,80,0.08)]",
  },
  warning: {
    border: "border-l-[#F0883E]",
    iconBg: "bg-[#F0883E]/10 text-[#F0883E]",
    glow: "hover:shadow-[0_0_20px_rgba(240,136,62,0.08)]",
  },
  caution: {
    border: "border-l-[#D29922]",
    iconBg: "bg-[#D29922]/10 text-[#D29922]",
    glow: "hover:shadow-[0_0_20px_rgba(210,153,34,0.08)]",
  },
  danger: {
    border: "border-l-[#F85149]",
    iconBg: "bg-[#F85149]/10 text-[#F85149]",
    glow: "hover:shadow-[0_0_20px_rgba(248,81,73,0.08)]",
  },
  capex: {
    border: "border-l-[#8957E5]",
    iconBg: "bg-[#8957E5]/10 text-[#8957E5]",
    glow: "hover:shadow-[0_0_20px_rgba(137,87,229,0.08)]",
  },
};

export default function KpiCard({
  label,
  value,
  rawValue,
  decimals = 0,
  prefix = "",
  suffix = "",
  sub,
  variant = "default",
  icon: Icon,
  index = 0,
}: KpiCardProps) {
  const animated = rawValue !== undefined ? useCountUp(rawValue, 800, decimals) : value;
  const display = rawValue !== undefined ? `${prefix}${animated}${suffix}` : value;
  const colors = variantColors[variant];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      className={cn(
        "relative overflow-hidden rounded-xl border border-[rgba(48,54,61,0.5)] border-l-[3px] bg-[#161B22]/80 p-5 backdrop-blur-md transition-all hover:-translate-y-1 hover:border-[rgba(48,54,61,0.8]",
        colors.border,
        colors.glow
      )}
    >
      {/* Subtle gradient overlay */}
      <div className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-br from-white/[0.02] to-transparent" />

      <div className="relative flex items-start justify-between">
        <div className="space-y-1.5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#8B949E]">
            {label}
          </p>
          <p className="text-2xl font-bold tracking-tight text-[#E6EDF3] sm:text-3xl tabular-nums">
            {display}
          </p>
          {sub && (
            <p className="text-xs text-[#6E7681]">{sub}</p>
          )}
        </div>
        {Icon && (
          <div className={cn("rounded-lg p-2 ring-1 ring-inset ring-white/5", colors.iconBg)}>
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
    </motion.div>
  );
}
