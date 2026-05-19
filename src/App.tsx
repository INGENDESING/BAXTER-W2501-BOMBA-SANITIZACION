import { ThemeProvider } from "./context/ThemeContext";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import Portada from "./sections/Portada";
import Dashboard from "./sections/Dashboard";
import Escenarios from "./sections/Escenarios";
import Sensibilidad from "./sections/Sensibilidad";
import ViabilityMatrixSection from "./sections/ViabilityMatrixSection";
import DetalleCapex from "./sections/DetalleCapex";
import DetalleOpex from "./sections/DetalleOpex";
import CashFlowTable from "./sections/CashFlowTable";
import ProcessBalance from "./sections/ProcessBalance";

function App() {
  return (
    <ThemeProvider>
      <div className="relative min-h-screen bg-background text-text font-sans antialiased">
        {/* Subtle grid pattern */}
        <div className="pointer-events-none fixed inset-0 bg-grid opacity-100" />
        {/* Ambient glow top-right */}
        <div className="pointer-events-none fixed -top-32 -right-32 h-96 w-96 rounded-full bg-[#79C0FF]/[0.03] blur-3xl" />
        {/* Ambient glow bottom-left */}
        <div className="pointer-events-none fixed -bottom-32 -left-32 h-96 w-96 rounded-full bg-[#3FB950]/[0.03] blur-3xl" />

        <div className="relative z-10">
          <Header />
          <main>
            <Portada />
            <Dashboard />
            <ProcessBalance />
            <Escenarios />
            <Sensibilidad />
            <ViabilityMatrixSection />
            <DetalleCapex />
            <DetalleOpex />
            <CashFlowTable />
          </main>
          <Footer />
        </div>
      </div>
    </ThemeProvider>
  );
}

export default App;
