export default function Footer() {
  return (
    <footer className="w-full border-t border-[rgba(48,54,61,0.6)] bg-[#0E1117] py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm text-[#8B949E]">
            2025BC-DT005 R1 — Estudio Técnico-Económico
          </p>
          <div className="flex items-center gap-4 text-sm text-[#8B949E]">
            <span>E3PRO Engineering Solutions</span>
            <span className="hidden sm:inline text-[#30363D]">·</span>
            <span>Laboratorios BAXTER S.A. — Planta Cali</span>
          </div>
        </div>
        <p className="mt-3 text-center text-xs text-[#6E7681] sm:text-right">
          Documento confidencial — Uso interno · Backend Node.js activo
        </p>
      </div>
    </footer>
  );
}
