# Contexto del proyecto: 2025BC — Calculadora Técnico-Económica

## Estado actual

- **Última tarea completada:** Auditoría exhaustiva completa — todos los datos W2601 reemplazados por 2025BC en shared/engine, server/engine, shared/thermo y componentes React (HelpModal, ThermoParamControls, ViabilityMatrix, ProcessDiagram).
- **Próxima tarea pendiente:** Rediseño del SVG en `ProcessDiagram.tsx` — el layout actual produce cruces de líneas entre corrientes C1/C2 (WFI caliente) y C3/C4 (WFI retorno).
- **Fecha de última actualización:** 2026-05-19

## Bases de diseño congeladas

| Variable | Valor | Fuente |
|---|---|---|
| Q_diseño | 490 kW | DT002 R0 (Simultaneidad 2) |
| T_c1 / T_c2 | 75 °C / 90 °C | DT002 R0 (gas cooler WFI) |
| T_c3 / T_c4 | 70 °C / 60 °C | DT002 R0 (evaporador retorno) |
| Caudal ambos lados | 28 m³/h | DT002 R0 |
| COP operativo | 3,0 | Neška 2002 |
| Altitud Cali | 1.018 msnm | DT002 Cuadro 1 |
| P_evap CO₂ | 57,8 bar → T_sat ≈ 22 °C | DT002 R0 §3.2 |
| P_gas_cooler | 95-97 bar | DT002 R0 |
| CAPEX total | $579.771 (subtotal $536.825 + 8%) | MC001 REV6 / DT005 R1 Cuadro 11 |
| OPEX Gas / BC | $189.417 / $90.819 año | MC001 REV6 OPEX_DET |
| valorResidualPct | 0.00 (Excel Python DEFAULTS l.64); PDF Cuadro 13 dice 15% — conflicto documentado | Auditoría 2026-05-19 |
| TIR Base | ≈ 19,6% | calculator.ts (valorResidual=0.00) |
| Payback descontado | ≈ 6,9 años | calculator.ts |
| VPN Base | ≈ $552.907 | calculator.ts (valorResidual=0.00)
| horasAnio | 4.000 h/año | DT005 R1 |
| precioElec | 0,113 USD/kWh | DT005 R1 |
| FACTOR_CO2_GAS | 2,121 kg/m³ | 0,202 kg/kWh × 10,5 kWh/m³ |
| FACTOR_CO2_ELEC | 0,164 kg/kWh | Colombia 2025 |
| FACTOR_ARBOLES | 12,5 árb/t CO₂ | 80 kg CO₂/árbol·año |

## Decisiones de diseño clave

- **R744 validación transcrítica** (2026-05-19): Se añadió `T_evap_design_C: 22` a RefrigerantData para que la validación use la T_sat del CO₂ a 57,8 bar (22 °C) en vez de la temperatura del agua (60 °C), evitando la falsa alarma "Operación imposible".
- **shared/engine vs server/engine**: Ambos archivos son idénticos tras auditoría 2026-05-19. Divergencia crítica corregida (`calculator.ts` tenía cálculo dinámico de energía en `shared/` pero factores fijos en `server/`).
- **OPEX fuente autoritativa**: Excel `2025BC-MC001 REV6.xlsx` prevalece sobre el PDF cuando hay discrepancia (confirmado por usuario).
- **VPN PDF vs calculator**: El pie de página del PDF dice "$1.318.200" pero el Cuadro 13 da VPN acumulado año 15 ≈ $557.696. El código es correcto; la cifra del pie parece error editorial.

## Archivos clave y su propósito

- `shared/engine/constants.ts` — CAPEX, OPEX, DEFAULT_PARAMS, factores ambientales (fuente de verdad del frontend)
- `shared/thermo/balanceEngine.ts` — balance masa/energía IAPWS-IF97, DEFAULT_THERMO_PARAMS
- `shared/thermo/refrigerants.ts` — base de datos refrigerantes + validateRefrigerant()
- `src/components/process/ProcessDiagram.tsx` — ⚠️ SVG con cruces — REDISEÑAR
- `src/store/useProjectStore.ts` — estado económico Zustand, importa de shared/engine
- `src/store/useThermoStore.ts` — estado termodinámico Zustand, importa de shared/thermo

## Preguntas abiertas / bloqueos

- [ ] Rediseño SVG ProcessDiagram sin cruces (próxima tarea)
- [x] Directorio renombrado a `2025bc-estudio-web`.

## Comandos útiles

```powershell
# Iniciar dev server
cd "C:\Users\ingen\OneDrive\INGENIERIA\02. INGENIERIA DE DETALLE\BOMBA DE CALOR SANITIZACION 2025\8.0 PR- CALCULADORA TECNICO ECONOMICA\2025bc-estudio-web"
npm run dev

# TypeScript check
npx tsc --noEmit

# Abrir browser
Start-Process "http://localhost:5173"
```

## Diseño propuesto para ProcessDiagram (layout sin cruces)

```
  ┌──────────┐  C1 75°C  ┌────────────────────┐  C2 90°C  ┌──────────────┐
  │ Tanque 7 │───────────→│   GAS COOLER       │───────────→│ Distribución │
  │  75 °C   │           │   (95-97 bar)       │           │   WFI 90°C   │
  │  10 m³   │           ├────────────────────┤           │  17 sistemas  │
  │  AISI316L│←──────────│   EVAPORADOR        │←──────────│              │
  └──────────┘  C4 60°C  │   (57,8 bar CO₂)   │  C3 70°C  └──────────────┘
                         └────────────────────┘

  Flujo WFI caliente: izquierda → derecha (arriba, rojo)
  Flujo WFI retorno:  derecha → izquierda (abajo, azul)
  Ciclo CO₂ interno:  elipse naranja animada dentro del bloque BC
```

Puntos de anclaje sin cruces:
- C1: sale lado-der Tanque7 en y=yTop → entra lado-izq BC en y=yGasCooler
- C2: sale lado-der BC en y=yGasCooler → entra lado-izq Distribución en y=yTop
- C3: sale lado-der Distribución en y=yEvap → entra lado-der BC en y=yEvap (ortogonal)
- C4: sale lado-izq BC en y=yEvap → entra lado-der Tanque7 en y=yBot (horizontal)
