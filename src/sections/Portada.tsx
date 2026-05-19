import { motion } from "framer-motion";
import { ChevronDown, Calendar, Building2, MapPin, FileBadge, Zap } from "lucide-react";

export default function Portada() {
  return (
    <section className="relative overflow-hidden">
      {/* Deep space gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0E1117] via-[#0F172A] to-[#111827]" />
      {/* Accent glow top center */}
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-[#79C0FF]/[0.04] blur-3xl" />
      {/* Grid overlay */}
      <div className="absolute inset-0 bg-grid opacity-50" />

      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center"
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#79C0FF]/20 bg-[#79C0FF]/5 px-4 py-1.5 text-sm font-medium text-[#79C0FF] backdrop-blur-sm ring-1 ring-[#79C0FF]/10">
            <FileBadge className="h-4 w-4" />
            2025BC-DT005 R1 — REV1
          </div>

          <h1 className="mx-auto max-w-4xl text-3xl font-bold tracking-tight text-[#E6EDF3] sm:text-5xl lg:text-6xl">
            Estudio Técnico-Económico
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-[#8B949E] sm:text-xl">
            Sistema de Bomba de Calor Transcrítica CO₂ para Sanitización
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {[
              { icon: Building2, text: "E3PRO Engineering Solutions" },
              { icon: MapPin, text: "Laboratorios BAXTER S.A. — Planta Cali" },
              { icon: Calendar, text: "2026-05-01" },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="flex items-center gap-2 rounded-lg border border-[rgba(48,54,61,0.5)] bg-[#161B22]/60 px-4 py-2 text-sm text-[#8B949E] backdrop-blur-sm"
              >
                <item.icon className="h-4 w-4 text-[#79C0FF]" />
                {item.text}
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-12"
          >
            <a
              href="#dashboard"
              className="inline-flex items-center gap-2 rounded-full bg-[#79C0FF]/10 px-6 py-3 text-sm font-semibold text-[#79C0FF] ring-1 ring-[#79C0FF]/30 shadow-lg transition-all hover:bg-[#79C0FF]/20 hover:shadow-[0_0_24px_rgba(121,192,255,0.15)] active:scale-95"
            >
              <Zap className="h-4 w-4" />
              Explorar Estudio
              <ChevronDown className="h-4 w-4 animate-bounce" />
            </a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
