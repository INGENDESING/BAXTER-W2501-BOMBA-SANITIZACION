// ───────────────────────────────────────────────────────────────
// Benchmark del motor termodinámico — Auditoría 2025BC
// Ejecutar: npx tsx scripts/validateThermo.ts
// ───────────────────────────────────────────────────────────────

import { calcularBalance, DEFAULT_THERMO_PARAMS } from "../shared/thermo/balanceEngine";

const result = calcularBalance(DEFAULT_THERMO_PARAMS);

const tests: { name: string; actual: number; expected: number; tolerancePct: number }[] = [
  { name: "Q_cond", actual: result.Q_cond_kw, expected: 490.0, tolerancePct: 0.1 },
  { name: "Q_evap", actual: result.Q_evap_kw, expected: 490.0 - 490.0 / 3.0, tolerancePct: 0.1 },
  { name: "W_comp", actual: result.W_comp_kw, expected: 490.0 / 3.0, tolerancePct: 0.1 },
  { name: "COP_calc", actual: result.COP_calc, expected: 3.0, tolerancePct: 0.05 },
  { name: "volFlow_WFI", actual: result.volFlow_sanitizacion_m3h, expected: 28.7, tolerancePct: 1.0 },
  { name: "volFlow_piscina", actual: result.volFlow_piscina_m3h, expected: 20.2, tolerancePct: 1.0 },
];

let passed = 0;
let failed = 0;

console.log("╔══════════════════════════════════════════════════════════════╗");
console.log("║   Benchmark Motor Termodinámico 2025BC                       ║");
console.log("╚══════════════════════════════════════════════════════════════╝\n");

for (const t of tests) {
  const diffPct = Math.abs((t.actual - t.expected) / t.expected) * 100;
  const ok = diffPct <= t.tolerancePct;
  const icon = ok ? "✓" : "✗";
  const color = ok ? "\x1b[32m" : "\x1b[31m";
  const reset = "\x1b[0m";
  console.log(
    `${color}${icon}${reset} ${t.name.padEnd(16)} actual=${t.actual.toFixed(4).padStart(10)}  expected=${t.expected.toFixed(4).padStart(10)}  diff=${diffPct.toFixed(4).padStart(8)} %  (tol=${t.tolerancePct} %)`
  );
  if (ok) passed++; else failed++;
}

// Verificación de cierre energético global (Primera Ley)
const globalClosure = result.globalEnergyClosurePct;
const closureOk = globalClosure < 0.1;
console.log(
  `${closureOk ? "\x1b[32m✓\x1b[0m" : "\x1b[31m✗\x1b[0m"} globalEnergyClosurePct=${globalClosure.toFixed(6).padStart(12)} %  (tol=0.1 %)`
);
if (closureOk) passed++; else failed++;

// Verificación de cierre energético interno (caudales)
const internalClosure = result.energyClosurePct;
const internalOk = internalClosure < 0.1;
console.log(
  `${internalOk ? "\x1b[32m✓\x1b[0m" : "\x1b[31m✗\x1b[0m"} energyClosurePct     =${internalClosure.toFixed(6).padStart(12)} %  (tol=0.1 %)`
);
if (internalOk) passed++; else failed++;

// Warnings del motor
if (result.warnings.length > 0) {
  console.log("\n⚠ Warnings del motor:");
  result.warnings.forEach((w) => console.log(`   - ${w}`));
}

console.log(`\n${"─".repeat(64)}`);
console.log(`Resultado: ${passed} pasaron, ${failed} fallaron`);
process.exit(failed > 0 ? 1 : 0);
