import { useState } from "react";
import { Settings, Menu, X, FileDown, FileSpreadsheet, HelpCircle, Server } from "lucide-react";
import InputsPanel from "../../sections/InputsPanel";
import ThemeToggle from "../ui/ThemeToggle";
import HelpModal from "../ui/HelpModal";

export default function Header() {
  const [panelOpen, setPanelOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-[rgba(48,54,61,0.6)] glass-strong">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#79C0FF]/10 text-[#79C0FF] font-bold text-sm ring-1 ring-[#79C0FF]/20">
              E3
            </div>
            <div className="hidden sm:block">
              <h1 className="text-sm font-semibold text-[#E6EDF3] leading-tight">
                2025BC — Estudio Técnico-Económico
              </h1>
              <p className="text-xs text-[#8B949E]">Bomba de Calor CO₂ Sanitización · 2025BC-DT005 R1</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-[#3FB950]/10 px-2.5 py-1 text-xs font-medium text-[#3FB950] ring-1 ring-[#3FB950]/20">
              <Server className="h-3 w-3" />
              API activa
            </div>
            <button
              onClick={() => setHelpOpen(true)}
              className="hidden sm:inline-flex items-center justify-center rounded-lg border border-[rgba(48,54,61,0.6)] p-2 text-[#8B949E] transition-colors hover:bg-[#161B22] hover:text-[#E6EDF3]"
              title="Metodología y supuestos"
            >
              <HelpCircle className="h-4 w-4" />
            </button>
            <ThemeToggle />
            <a
              href="/2025BC-MC001-REV6.xlsx"
              download
              className="hidden sm:inline-flex items-center gap-1.5 rounded-lg bg-[#3FB950]/10 px-3 py-2 text-xs font-bold text-[#3FB950] ring-1 ring-[#3FB950]/30 shadow-sm transition-all hover:bg-[#3FB950]/20 hover:shadow-[0_0_16px_rgba(63,185,80,0.15)] active:scale-95"
            >
              <FileSpreadsheet className="h-3.5 w-3.5" />
              Caso base
            </a>
            <a
              href="/2025BC-DT005-R1.pdf"
              download
              className="hidden sm:inline-flex items-center gap-1.5 rounded-lg bg-[#F85149]/10 px-3 py-2 text-xs font-bold text-[#F85149] ring-1 ring-[#F85149]/30 shadow-sm transition-all hover:bg-[#F85149]/20 hover:shadow-[0_0_16px_rgba(248,81,73,0.15)] active:scale-95"
            >
              <FileDown className="h-3.5 w-3.5" />
              Informe base
            </a>
            <a
              href="#balance-me"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-lg bg-[#79C0FF]/10 px-3 py-2 text-xs font-bold text-[#79C0FF] ring-1 ring-[#79C0FF]/30 shadow-sm transition-all hover:bg-[#79C0FF]/20 hover:shadow-[0_0_16px_rgba(121,192,255,0.15)] active:scale-95"
            >
              Balance M&E
            </a>
            <button
              onClick={() => setPanelOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-[#79C0FF]/10 px-4 py-2 text-sm font-medium text-[#79C0FF] ring-1 ring-[#79C0FF]/30 shadow-sm transition-all hover:bg-[#79C0FF]/20 hover:shadow-[0_0_16px_rgba(121,192,255,0.15)] active:scale-95"
            >
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Editar Parámetros</span>
            </button>
            <button
              onClick={() => setPanelOpen(!panelOpen)}
              className="inline-flex items-center justify-center rounded-lg border border-[rgba(48,54,61,0.6)] p-2 text-[#8B949E] transition-colors hover:bg-[#161B22] hover:text-[#E6EDF3] sm:hidden"
            >
              {panelOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      <InputsPanel open={panelOpen} onClose={() => setPanelOpen(false)} />
      <HelpModal open={helpOpen} onClose={() => setHelpOpen(false)} />
    </>
  );
}
