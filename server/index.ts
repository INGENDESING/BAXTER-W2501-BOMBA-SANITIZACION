import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import {
  calcularTodo,
  calcularEscenarios,
  calcularSensibilidad,
} from "./engine/calculator";
import type { ProjectParams } from "./engine/types";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || "development";

// ── Middleware ──
app.use(cors());
app.use(express.json({ limit: "2mb" }));

// ── API Routes ──

// Health check (Render lo usa)
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", env: NODE_ENV, timestamp: new Date().toISOString() });
});

// Recalcular modelo completo server-side
app.post("/api/calculate", (req, res) => {
  try {
    const params = req.body as ProjectParams;
    if (!params || typeof params.cargaKW !== "number") {
      res.status(400).json({ error: "ProjectParams inválido" });
      return;
    }
    const results = calcularTodo(params);
    res.json(results);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: msg });
  }
});

// Escenarios pre-calculados
app.post("/api/scenarios", (req, res) => {
  try {
    const params = req.body as ProjectParams;
    const scenarios = calcularEscenarios(params);
    res.json(scenarios);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: msg });
  }
});

// Sensibilidad
app.post("/api/sensitivity", (req, res) => {
  try {
    const params = req.body as ProjectParams;
    const sensitivity = calcularSensibilidad(params);
    res.json(sensitivity);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: msg });
  }
});

// Export Excel (server-side generation placeholder)
app.post("/api/export/excel", async (req, res) => {
  try {
    const { params } = req.body as { params: ProjectParams };
    if (!params) {
      res.status(400).json({ error: "params requerido" });
      return;
    }
    const results = calcularTodo(params);
    // Devolvemos JSON con results por ahora; la generación binaria de Excel
    // se implementará con exceljs en T4/T5 si es necesario.
    res.json({
      message: "Excel generation endpoint — binary export pending implementation",
      results,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: msg });
  }
});

// Export PDF placeholder
app.post("/api/export/pdf", async (_req, res) => {
  res.json({
    message: "PDF generation stays client-side (html2canvas + jsPDF). Server endpoint reserved.",
  });
});

// ── Serve React build (production only) ──
if (NODE_ENV === "production") {
  const distPath = path.resolve(__dirname, "../dist");
  app.use(express.static(distPath));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`🚀 2025BC server running on port ${PORT} [${NODE_ENV}]`);
});
