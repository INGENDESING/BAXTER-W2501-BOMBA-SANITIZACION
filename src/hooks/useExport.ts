import { useState, useCallback } from "react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import * as XLSX from "xlsx";
import { useProjectStore } from "../store/useProjectStore";

export function useExport() {
  const { results } = useProjectStore();
  const [exportingPdf, setExportingPdf] = useState(false);
  const [exportingExcel, setExportingExcel] = useState(false);

  const exportPDF = useCallback(async () => {
    const element = document.getElementById("dashboard");
    if (!element) return;
    setExportingPdf(true);
    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#F8FAFC",
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "px",
        format: [canvas.width, canvas.height],
      });
      pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
      pdf.save("2025BC_Estudio_Economico_Dashboard.pdf");
    } finally {
      setExportingPdf(false);
    }
  }, []);

  const exportExcel = useCallback(() => {
    setExportingExcel(true);
    try {
      const wb = XLSX.utils.book_new();

      // Hoja: Inputs
      const inputsData = [
        ["Variable", "Valor"],
        ["Carga térmica (kW)", results.params.cargaKW],
        ["COP", results.params.cop],
        ["Horas/año", results.params.horasAnio],
        ["Precio electricidad (USD/kWh)", results.params.precioElec],
        ["Precio gas (USD/kWh eq.)", results.params.precioGas],
        ["WACC", results.params.wacc],
        ["Escalamiento anual ahorro", results.params.escalaOpex],
        ["Horizonte (años)", results.params.horizonte],
        ["Eficiencia caldera", results.params.eficCaldera],
      ];
      const wsInputs = XLSX.utils.aoa_to_sheet(inputsData);
      XLSX.utils.book_append_sheet(wb, wsInputs, "Inputs");

      // Hoja: Indicadores
      const kpiData = [
        ["KPI", "Valor"],
        ["VPN (USD)", results.indicadores.vpn],
        ["TIR (%)", results.indicadores.tir],
        ["Payback descontado (años)", results.indicadores.payback],
        ["CAPEX Total (USD)", results.indicadores.capexTotal],
        ["Ahorro OPEX Año 1 (USD)", results.indicadores.ahorroOpexAnio1],
      ];
      const wsKpi = XLSX.utils.aoa_to_sheet(kpiData);
      XLSX.utils.book_append_sheet(wb, wsKpi, "Indicadores");

      // Hoja: CAPEX
      const capexData = [
        ["Concepto", "Cantidad", "Costo Unitario (USD)", "Categoría"],
        ...results.capex.items.map((i) => [i.concepto, i.cantidad, i.costoUnitario, i.categoria]),
        [],
        ["Subtotal", "", results.capex.subtotal],
        ["Contingencia (8%)", "", results.capex.contingencia],
        ["Escalación (6%)", "", results.capex.escalacion],
        ["TOTAL CAPEX (USD)", "", results.capex.totalConEscenario],
      ];
      const wsCapex = XLSX.utils.aoa_to_sheet(capexData);
      XLSX.utils.book_append_sheet(wb, wsCapex, "CAPEX");

      // Hoja: OPEX
      const opexData = [
        ["Concepto", "Caldera Gas (USD/año)", "Bomba Calor (USD/año)", "Ahorro (USD/año)"],
        ...results.opex.items.map((i) => [i.concepto, i.gas, i.bc, i.ahorro]),
        ["TOTAL", results.opex.totalGas, results.opex.totalBC, results.opex.totalAhorro],
      ];
      const wsOpex = XLSX.utils.aoa_to_sheet(opexData);
      XLSX.utils.book_append_sheet(wb, wsOpex, "OPEX");

      // Hoja: Escenarios
      const scenData = [
        ["Escenario", "CAPEX (USD)", "Ahorro Año 1 (USD)", "VPN (USD)", "TIR (%)", "Payback (años)"],
        ...results.scenarios.map((s) => [
          s.nombre,
          s.capex,
          s.ahorroAnio1,
          s.vpn,
          s.tir,
          s.payback,
        ]),
      ];
      const wsScen = XLSX.utils.aoa_to_sheet(scenData);
      XLSX.utils.book_append_sheet(wb, wsScen, "Escenarios");

      XLSX.writeFile(wb, "2025BC_Estudio_Economico.xlsx");
    } finally {
      setExportingExcel(false);
    }
  }, [results]);

  return { exportPDF, exportExcel, exportingPdf, exportingExcel };
}
