# Contexto del proyecto: 2025BC — Calculadora Técnico-Económica

## Estado actual

- **Última tarea completada:** Auditoría termodinámica nivel maestría — Balance M&E + diagrama de proceso (2026-05-19, commit `d492578`).
- **Próxima tarea pendiente:** —
- **Fecha de última actualización:** 2026-05-19

## Bases de diseño congeladas

| Variable | Valor | Fuente |
|---|---|---|
| Q_diseño | 490 kW | DT002 R0 (Simultaneidad 2) |
| T_c1 / T_c2 | 75 °C / 90 °C | DT002 R0 (gas cooler WFI) |
| T_piscina_in / T_piscina_out | 28,9 °C / 15 °C | Clima local / parámetro ajustable |
| Caudal WFI sanitización | ~28,7 m³/h | Calculado (Q_cond = ṁ × cp × ΔT) |
| Caudal piscina | ~20,2 m³/h | Calculado (Q_evap = ṁ × cp × ΔT) |
| COP operativo | 3,0 | Neška 2002 |
| Altitud Cali | 1.018 msnm | DT002 Cuadro 1 |
| P_evap CO₂ | 57,8 bar → T_sat ≈ 22 °C | DT002 R0 §3.2 |
| P_gas_cooler | 95-97 bar | DT002 R0 |
| CAPEX total | $579.771 (subtotal $536.825 + 8 %) | MC001 REV6 / DT005 R1 Cuadro 11 |
| OPEX Gas / BC | $189.417 / $90.819 año | MC001 REV6 OPEX_DET |
| valorResidualPct | 0,00 (Excel Python DEFAULTS l.64); PDF Cuadro 13 dice 15 % — conflicto documentado | Auditoría 2026-05-19 |
| TIR Base | ≈ 19,6 % | calculator.ts (valorResidual=0,00) |
| Payback descontado | ≈ 6,9 años | calculator.ts |
| VPN Base | ≈ $552.907 | calculator.ts (valorResidual=0,00) |
| horasAnio | 4.000 h/año | DT005 R1 |
| precioElec | 0,113 USD/kWh | DT005 R1 |
| FACTOR_CO2_GAS | 2,121 kg/m³ | 0,202 kg/kWh × 10,5 kWh/m³ |
| FACTOR_CO2_ELEC | 0,164 kg/kWh | Colombia 2025 |
| FACTOR_ARBOLES | 12,5 árb/t CO₂ | 80 kg CO₂/árbol·año |

## Decisiones de diseño clave

- **Auditoría termodinámica nivel maestría completada** (2026-05-19, commit `d492578`):
  - `Q_disp_kw` corregido a `Q_cond_kw − Q_perdidas_kw` (bug crítico: antes era idéntico a `Q_cond_kw`).
  - Añadido `globalEnergyClosurePct` — cierre energético global (1.ª Ley): `|Q_cond − (Q_evap + W_comp)| / Q_cond × 100`.
  - Eliminados `W_comp_disp_kw`, `COP_disp`, `massClosurePct` (redundantes/no usados en UI).
  - `waterProps.ts` documenta desprecio de presión en líquido subenfriado (< 0,01 %). Propaga `wasClamped`.
  - `BalanceTable.tsx`: renombrada columna "Calor sensible (q)" → "Flujo de entalpía (M·h)".
  - `ProcessDiagram.tsx`: comentarios limpios, subtítulo dinámico, óvalo CO₂ reducido.
  - Benchmark `scripts/validateThermo.ts`: 8/8 pasan, cierre global = 0,000000 %.

- **Modelo termodinámico: circuitos abiertos independientes** (2026-05-19). Reemplazó el modelo anterior de loop cerrado WFI. El sistema real tiene:
  - Lado caliente: Tanque 7 (75 °C) → Gas Cooler → 90 °C → Consumo sanitización (sin retorno).
  - Lado frío: Piscina (28,9 °C) → Evaporador → 15 °C → Retorno a piscina.

- **Corrección bug validación refrigerante** (2026-05-19, commit `a94da43`):
  - `validateRefrigerant` recibía `T_piscina_out` como fuente de calor del evaporador. Fuente correcta: `T_piscina_in` (28,9 °C).
  - Mensaje de margen crítico para transcríticos corregido: margen negativo = operación supercrítica por diseño.

- **R744 validación transcrítica** (2026-05-19): `T_evap_design_C: 22` en RefrigerantData para evitar falsa alarma.

- **shared/engine vs server/engine**: Idénticos tras auditoría 2026-05-19.

- **OPEX fuente autoritativa**: Excel `2025BC-MC001 REV6.xlsx` prevalece sobre PDF.

- **VPN PDF vs calculator**: Pie de página PDF "$1.318.200" vs Cuadro 13 ≈ $557.696. El código es correcto; cifra del pie parece error editorial.

- **Despliegue**: GitHub Actions para deploy automático a GitHub Pages. `vite.config.ts`: `base: './'`.

## Archivos clave y su propósito

- `shared/thermo/balanceEngine.ts` — Motor termodinámico: balance M&E, caudales, propiedades IAPWS-IF97, cierre energético global.
- `shared/thermo/types.ts` — Interfaces Stream, ThermoParams, BalanceResult, WaterProps.
- `shared/thermo/waterProps.ts` — Propiedades del agua líquida (ρ, cp, h, μ, k).
- `shared/thermo/refrigerants.ts` — Base de datos refrigerantes + validateRefrigerant().
- `src/store/useThermoStore.ts` — Estado Zustand del módulo termodinámico.
- `src/components/process/ProcessDiagram.tsx` — PFD SVG interactivo (circuitos abiertos).
- `src/components/process/ThermoParamControls.tsx` — Sliders ΔT caliente, T salida piscina, COP.
- `src/components/process/BalanceTable.tsx` — Tabla de balance M&E (4 corrientes: C1, C2, P1, P2).
- `src/components/process/ThermoAlert.tsx` — Alertas de validación térmica.
- `scripts/validateThermo.ts` — Benchmark automatizado del motor (8 tests).
- `shared/engine/constants.ts` — CAPEX, OPEX, DEFAULT_PARAMS, factores ambientales.
- `shared/engine/calculator.ts` — Motor financiero: CAPEX, OPEX, VPN, TIR, payback, escenarios.
- `src/sections/DetalleOpex.tsx` — Tabla OPEX editable (corregido doble escalamiento).

## Preguntas abiertas / bloqueos

- [ ] Factor de carga operativo real de la bomba de calor (¿81 %? ¿100 %?). Relevante para calibrar `calcularEmisiones()`.
- [x] Directorio renombrado a `2025bc-estudio-web`.
- [x] Divergencia crítica server/shared corregida.
- [x] Doble escalamiento OPEX corregido.
- [x] Modelo termodinámico corregido a circuitos abiertos.
- [x] Bug validación refrigerante corregido.
- [x] Auditoría termodinámica nivel maestría completada (T1–T10).

## Comandos útiles

```powershell
# Iniciar dev server
cd "C:\Users\ingen\OneDrive\INGENIERIA\02. INGENIERIA DE DETALLE\BOMBA DE CALOR SANITIZACION 2025\8.0 PR- CALCULADORA TECNICO ECONOMICA\2025bc-estudio-web"
npm run dev

# TypeScript check
npx tsc --noEmit

# Build producción
npm run build

# Verificar sincronización motores económicos
diff -ru server/engine/ shared/engine/

# Benchmark termodinámico
npx tsx scripts/validateThermo.ts

# Abrir browser
Start-Process "http://localhost:5173"
```
