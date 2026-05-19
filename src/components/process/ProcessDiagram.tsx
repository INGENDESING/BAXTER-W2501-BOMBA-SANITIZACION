import { useThermoStore } from "../../store/useThermoStore";
import { useState } from "react";
import type { Stream } from "../../../shared/thermo/types";

function formatStreamLabel(s: Stream) {
  return `${s.name} · ${s.T_C.toFixed(1)} °C · ${s.volFlow.toFixed(2)} m³/h`;
}

/** Texto SVG con halo de stroke para legibilidad sin fondo rectangular */
function SvgText({
  x,
  y,
  children,
  fill = "#E6EDF3",
  fontSize = 12,
  fontWeight = 600,
  textAnchor = "middle",
  opacity = 1,
}: {
  x: number;
  y: number;
  children: React.ReactNode;
  fill?: string;
  fontSize?: number;
  fontWeight?: number | string;
  textAnchor?: string;
  opacity?: number;
}) {
  return (
    <text
      x={x}
      y={y}
      textAnchor={textAnchor as any}
      style={{ fill, opacity }}
      fontSize={fontSize}
      fontWeight={fontWeight}
      dominantBaseline="middle"
      stroke="#0D1117"
      strokeWidth={fontSize * 0.35}
      paintOrder="stroke"
    >
      {children}
    </text>
  );
}

export default function ProcessDiagram() {
  const { result, params, refrigerant, refrigerantValidation } = useThermoStore();
  const [hovered, setHovered] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; content: string } | null>(null);

  const s1 = result.streams[0]; // C1: WFI Tanque 7 → Gas Cooler (75°C entrada)
  const s2 = result.streams[1]; // C2: Gas Cooler → Distribución (90°C)
  const s3 = result.streams[2]; // C3: Retorno → Evaporador (70°C entrada)
  const s4 = result.streams[3]; // C4: Evaporador → Tanque 7 (60°C salida)

  const handleMouseEnter = (e: React.MouseEvent, content: string) => {
    setHovered(content);
    setTooltip({ x: e.clientX, y: e.clientY - 40, content });
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (tooltip) setTooltip({ ...tooltip, x: e.clientX, y: e.clientY - 40 });
  };
  const handleMouseLeave = () => {
    setHovered(null);
    setTooltip(null);
  };

  // ── Layout SVG ──
  const W = 1000;
  const H = 520;

  // ── Bloques principales ──
  const tank7   = { x: 40,  y: 120, w: 160, h: 110 };
  const bc      = { x: 320, y: 80,  w: 320, h: 220 };
  const distrib = { x: 760, y: 120, w: 170, h: 110 };

  // ── Puntos de anclaje (WFI caliente — nivel superior) ──
  const tank7Out  = { x: tank7.x + tank7.w,   y: tank7.y + 55 };
  const bcHotIn   = { x: bc.x,                y: bc.y + 55 };
  const bcHotOut  = { x: bc.x + bc.w,         y: bc.y + 55 };
  const distribIn = { x: distrib.x,           y: distrib.y + 55 };

  // ── Puntos de anclaje (WFI frío — nivel inferior) ──
  const tank7BotIn  = { x: tank7.x + tank7.w,  y: tank7.y + tank7.h - 25 };
  const bcColdOut   = { x: bc.x,               y: bc.y + bc.h - 55 };
  const bcColdIn    = { x: bc.x + bc.w,        y: bc.y + bc.h - 55 };
  const distribBot  = { x: distrib.x + distrib.w * 0.5, y: distrib.y + distrib.h };

  return (
    <div className="relative w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full min-w-[800px]"
        onMouseMove={handleMouseMove}
      >
        <defs>
          {/* Gradiente vertical BC: verde arriba → púrpura abajo */}
          <linearGradient id="bcGradV" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3FB950" stopOpacity="0.14" />
            <stop offset="45%" stopColor="#3FB950" stopOpacity="0.06" />
            <stop offset="55%" stopColor="#A371F7" stopOpacity="0.06" />
            <stop offset="100%" stopColor="#A371F7" stopOpacity="0.14" />
          </linearGradient>

          <marker id="arrowR" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
            <path d="M0,0 L8,4 L0,8 L2,4 Z" fill="#F85149" />
          </marker>
          <marker id="arrowB" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
            <path d="M0,0 L8,4 L0,8 L2,4 Z" fill="#79C0FF" />
          </marker>
          <marker id="arrowCO2" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
            <path d="M0,0 L7,3.5 L0,7 L1.5,3.5 Z" fill="#F0883E" opacity="0.7" />
          </marker>

          <style>{`
            @keyframes flowDashRed  { to { stroke-dashoffset: -24; } }
            @keyframes flowDashBlue { to { stroke-dashoffset: -24; } }
            @keyframes co2Cycle     { to { stroke-dashoffset: -20; } }
            .flow-anim-red  { stroke-dasharray: 8 4; animation: flowDashRed  0.7s linear infinite; }
            .flow-anim-blue { stroke-dasharray: 8 4; animation: flowDashBlue 0.9s linear infinite; }
            .co2-anim       { stroke-dasharray: 6 3; animation: co2Cycle     0.5s linear infinite; }
          `}</style>
        </defs>

        {/* ═══════════════════════════════════════════════════
            CORRIENTE C1: Tanque 7 → Gas Cooler (WFI 75°C)
           ═══════════════════════════════════════════════════ */}
        <path
          d={`M${tank7Out.x},${tank7Out.y} L${bcHotIn.x - 8},${bcHotIn.y}`}
          stroke="#F85149"
          strokeWidth="3.5"
          fill="none"
          markerEnd="url(#arrowR)"
          opacity={hovered === "C1" ? 1 : 0.75}
          onMouseEnter={(e) => handleMouseEnter(e, formatStreamLabel(s1))}
          onMouseLeave={handleMouseLeave}
          className={`cursor-pointer transition-opacity ${hovered === "C1" ? "" : "flow-anim-red"}`}
        />
        <SvgText x={(tank7Out.x + bcHotIn.x) / 2} y={tank7Out.y - 18} fill="#F85149" fontSize={12}>
          C1 · {s1.T_C.toFixed(0)} °C
        </SvgText>
        <SvgText x={(tank7Out.x + bcHotIn.x) / 2} y={tank7Out.y + 16} fill="#8B949E" fontWeight={400} fontSize={10}>
          {s1.volFlow.toFixed(1)} m³/h · {s1.massFlow.toFixed(0)} kg/h
        </SvgText>

        {/* ═══════════════════════════════════════════════════
            CORRIENTE C2: Gas Cooler → Distribución (WFI 90°C)
           ═══════════════════════════════════════════════════ */}
        <path
          d={`M${bcHotOut.x},${bcHotOut.y} L${distribIn.x + 8},${distribIn.y}`}
          stroke="#F85149"
          strokeWidth="3.5"
          fill="none"
          markerEnd="url(#arrowR)"
          opacity={hovered === "C2" ? 1 : 0.75}
          onMouseEnter={(e) => handleMouseEnter(e, formatStreamLabel(s2))}
          onMouseLeave={handleMouseLeave}
          className={`cursor-pointer transition-opacity ${hovered === "C2" ? "" : "flow-anim-red"}`}
        />
        <SvgText x={(bcHotOut.x + distribIn.x) / 2} y={bcHotOut.y - 18} fill="#F85149" fontSize={12}>
          C2 · {s2.T_C.toFixed(0)} °C
        </SvgText>
        <SvgText x={(bcHotOut.x + distribIn.x) / 2} y={bcHotOut.y + 16} fill="#8B949E" fontWeight={400} fontSize={10}>
          {s2.volFlow.toFixed(1)} m³/h · {s2.massFlow.toFixed(0)} kg/h
        </SvgText>

        {/* ═══════════════════════════════════════════════════
            RETORNO: Distribución ↓ (línea vertical punteada)
           ═══════════════════════════════════════════════════ */}
        <path
          d={`M${distribBot.x},${distribBot.y} L${distribBot.x},${distribBot.y + 55}`}
          stroke="#79C0FF"
          strokeWidth="2"
          fill="none"
          opacity={0.4}
          strokeDasharray="5 3"
        />
        <SvgText x={distribBot.x + 10} y={distribBot.y + 28} fill="#8B949E" fontWeight={400} fontSize={10} textAnchor="start">
          Retorno 65–70 °C
        </SvgText>

        {/* ═══════════════════════════════════════════════════
            CORRIENTE C3: Retorno → Evaporador (70°C)
           ═══════════════════════════════════════════════════ */}
        <path
          d={`M${distribBot.x},${distribBot.y + 55} L${bcColdIn.x + 8},${bcColdIn.y}`}
          stroke="#79C0FF"
          strokeWidth="3"
          fill="none"
          markerEnd="url(#arrowB)"
          opacity={hovered === "C3" ? 1 : 0.75}
          onMouseEnter={(e) => handleMouseEnter(e, formatStreamLabel(s3))}
          onMouseLeave={handleMouseLeave}
          className={`cursor-pointer transition-opacity ${hovered === "C3" ? "" : "flow-anim-blue"}`}
        />
        <SvgText x={(distribBot.x + bcColdIn.x) / 2} y={bcColdIn.y + 18} fill="#79C0FF" fontSize={12}>
          C3 · {s3.T_C.toFixed(0)} °C
        </SvgText>
        <SvgText x={(distribBot.x + bcColdIn.x) / 2} y={bcColdIn.y - 14} fill="#8B949E" fontWeight={400} fontSize={10}>
          {s3.volFlow.toFixed(1)} m³/h · {s3.massFlow.toFixed(0)} kg/h
        </SvgText>

        {/* ═══════════════════════════════════════════════════
            CORRIENTE C4: Evaporador → Tanque 7 (60°C)
           ═══════════════════════════════════════════════════ */}
        <path
          d={`M${bcColdOut.x},${bcColdOut.y} L${tank7BotIn.x + 8},${tank7BotIn.y}`}
          stroke="#79C0FF"
          strokeWidth="3"
          fill="none"
          markerEnd="url(#arrowB)"
          opacity={hovered === "C4" ? 1 : 0.75}
          onMouseEnter={(e) => handleMouseEnter(e, formatStreamLabel(s4))}
          onMouseLeave={handleMouseLeave}
          className={`cursor-pointer transition-opacity ${hovered === "C4" ? "" : "flow-anim-blue"}`}
        />
        <SvgText x={(bcColdOut.x + tank7BotIn.x) / 2} y={bcColdOut.y + 18} fill="#79C0FF" fontSize={12}>
          C4 · {s4.T_C.toFixed(0)} °C
        </SvgText>
        <SvgText x={(bcColdOut.x + tank7BotIn.x) / 2} y={bcColdOut.y - 14} fill="#8B949E" fontWeight={400} fontSize={10}>
          {s4.volFlow.toFixed(1)} m³/h · {s4.massFlow.toFixed(0)} kg/h
        </SvgText>

        {/* ═══════════════════════════════════════════════════
            CICLO CO₂ (interno BC) — óvalo vertical
           ═══════════════════════════════════════════════════ */}
        <ellipse
          cx={bc.x + bc.w / 2}
          cy={bc.y + bc.h / 2}
          rx={70}
          ry={80}
          fill="none"
          stroke="#F0883E"
          strokeWidth="1.5"
          strokeDasharray="5 3"
          opacity={0.5}
          className="co2-anim"
        />
        {/* Flecha CO₂ sentido horario (arriba derecha) */}
        <path
          d={`M${bc.x + bc.w / 2 + 55},${bc.y + bc.h / 2 - 55}
              Q${bc.x + bc.w / 2 + 75},${bc.y + bc.h / 2}
              ${bc.x + bc.w / 2 + 55},${bc.y + bc.h / 2 + 55}`}
          fill="none"
          stroke="#F0883E"
          strokeWidth="1.5"
          opacity={0.45}
          className="co2-anim"
          markerEnd="url(#arrowCO2)"
        />
        <SvgText x={bc.x + bc.w / 2} y={bc.y + bc.h / 2} fill="#F0883E" fontSize={10} opacity={0.7}>
          CO₂
        </SvgText>
        <SvgText x={bc.x + bc.w / 2} y={bc.y + bc.h / 2 + 14} fill="#8B949E" fontSize={9} opacity={0.6}>
          R744
        </SvgText>

        {/* ═══════════════════════════════════════════════════
            BLOQUE: Tanque 7 WFI
           ═══════════════════════════════════════════════════ */}
        <g
          onMouseEnter={(e) => handleMouseEnter(e,
            `Tanque 7 — WFI precalentada\nCapacidad: 10 m³\nTemperatura: ${params.T_c1.toFixed(0)} °C\nFunción: fuente térmica BC (feed gas cooler)\nMaterial: AISI 316L, atmosférico`
          )}
          onMouseLeave={handleMouseLeave}
          className="cursor-pointer"
        >
          <rect x={tank7.x} y={tank7.y} width={tank7.w} height={tank7.h} rx="10" fill="#161B22" stroke="#79C0FF" strokeWidth="1.5" />
          <ellipse cx={tank7.x + tank7.w / 2} cy={tank7.y + tank7.h - 16} rx={48} ry={7} fill="#79C0FF" fillOpacity="0.08" stroke="#79C0FF" strokeWidth="1" opacity="0.5" />
          <SvgText x={tank7.x + tank7.w / 2} y={tank7.y + 24} fill="#79C0FF" fontSize={13}>
            Tanque 7 (Exist.)
          </SvgText>
          <SvgText x={tank7.x + tank7.w / 2} y={tank7.y + 46} fill="#E6EDF3" fontWeight={400} fontSize={11}>
            WFI precalentada
          </SvgText>
          <SvgText x={tank7.x + tank7.w / 2} y={tank7.y + 66} fill="#E6EDF3" fontWeight={700} fontSize={15}>
            {params.T_c1.toFixed(0)} °C
          </SvgText>
          <SvgText x={tank7.x + tank7.w / 2} y={tank7.y + 86} fill="#8B949E" fontWeight={400} fontSize={10}>
            10 m³ · AISI 316L
          </SvgText>
        </g>

        {/* ═══════════════════════════════════════════════════
            BLOQUE: Bomba de Calor CO₂ Transcrítica
           ═══════════════════════════════════════════════════ */}
        <g
          onMouseEnter={(e) =>
            handleMouseEnter(e,
              `Bomba de Calor CO₂ Transcrítica 2025BC\nRefrigerante: ${refrigerant}\nCOP operativo: ${params.copOperativo} · COP Carnot: ${refrigerantValidation.copCarnot.toFixed(2)}\nQ_cond: ${result.Q_cond_kw.toFixed(1)} kW · W_comp: ${result.W_comp_kw.toFixed(1)} kW\nP_evap: 57,8 bar · P_gas_cooler: 95-97 bar\nCompresor: Bitzer 6CTEU-40Y 163 kW\nIntercambiadores: SWEP B649 AISI 316L`
            )
          }
          onMouseLeave={handleMouseLeave}
          className="cursor-pointer"
        >
          {/* Fondo gradiente vertical */}
          <rect x={bc.x} y={bc.y} width={bc.w} height={bc.h} rx="12" fill="url(#bcGradV)" stroke="#3FB950" strokeWidth="1.5" />

          {/* Divisor horizontal punteado */}
          <line x1={bc.x + 16} y1={bc.y + bc.h / 2} x2={bc.x + bc.w - 16} y2={bc.y + bc.h / 2}
            stroke="#8B949E" strokeWidth="0.8" strokeDasharray="4 3" opacity="0.35" />

          {/* Título general */}
          <SvgText x={bc.x + bc.w / 2} y={bc.y + 20} fill="#3FB950" fontSize={14}>
            Bomba de Calor CO₂ Transcrítica
          </SvgText>

          {/* ── Gas Cooler (mitad superior) ── */}
          <SvgText x={bc.x + bc.w / 2} y={bc.y + 42} fill="#F85149" fontWeight={700} fontSize={11}>
            Gas Cooler SWEP B649 · 95–97 bar
          </SvgText>
          <SvgText x={bc.x + bc.w / 2} y={bc.y + 58} fill="#8B949E" fontWeight={400} fontSize={10}>
            CO₂ 115 °C → 35 °C · H₂O 75 °C → 90 °C
          </SvgText>

          {/* Badge Q_cond */}
          <g transform={`translate(${bc.x + bc.w / 2 - 60}, ${bc.y + bc.h / 2 - 22})`}>
            <rect x="0" y="0" width={result.Q_cond_kw >= 100 ? 72 : 60} height="20" rx="5" fill="#3FB950" fillOpacity="0.15" stroke="#3FB950" strokeWidth="1" />
            <SvgText x={(result.Q_cond_kw >= 100 ? 72 : 60) / 2} y={10} fill="#3FB950" fontSize={10}>
              ▲ {result.Q_cond_kw.toFixed(0)} kW
            </SvgText>
          </g>

          {/* ── Evaporador (mitad inferior) ── */}
          <SvgText x={bc.x + bc.w / 2} y={bc.y + bc.h / 2 + 22} fill="#79C0FF" fontWeight={700} fontSize={11}>
            Evaporador SWEP B649 · 57,8 bar
          </SvgText>
          <SvgText x={bc.x + bc.w / 2} y={bc.y + bc.h / 2 + 38} fill="#8B949E" fontWeight={400} fontSize={10}>
            CO₂ evap. ≈ 22 °C (bifásico) · H₂O retorno 70 °C
          </SvgText>

          {/* Badge Q_evap */}
          <g transform={`translate(${bc.x + bc.w / 2 - 60}, ${bc.y + bc.h / 2 + 48})`}>
            <rect x="0" y="0" width={result.Q_evap_kw >= 100 ? 72 : 60} height="20" rx="5" fill="#A371F7" fillOpacity="0.15" stroke="#A371F7" strokeWidth="1" />
            <SvgText x={(result.Q_evap_kw >= 100 ? 72 : 60) / 2} y={10} fill="#A371F7" fontSize={10}>
              ▼ {result.Q_evap_kw.toFixed(0)} kW
            </SvgText>
          </g>

          {/* Badge COP */}
          <g transform={`translate(${bc.x + bc.w - 78}, ${bc.y + bc.h - 26})`}>
            <rect x="0" y="0" width="70" height="18" rx="5" fill="#A371F7" fillOpacity="0.15" stroke="#A371F7" strokeWidth="1" />
            <SvgText x={35} y={9} fill="#A371F7" fontSize={10}>
              COP {params.copOperativo}
            </SvgText>
          </g>

          {/* Badge refrigerante */}
          <g transform={`translate(${bc.x + 10}, ${bc.y + bc.h - 26})`}>
            <rect x="0" y="0" width="50" height="18" rx="5" fill="#F0883E" fillOpacity="0.12" stroke="#F0883E" strokeWidth="0.8" />
            <SvgText x={25} y={9} fill="#F0883E" fontSize={10}>
              {refrigerant}
            </SvgText>
          </g>
        </g>

        {/* ═══════════════════════════════════════════════════
            BLOQUE: Red Distribución WFI 90°C
           ═══════════════════════════════════════════════════ */}
        <g
          onMouseEnter={(e) => handleMouseEnter(e,
            `Red Distribución WFI 90 °C\nBomba P-02 (existente)\n16–28 m³/h según escenario\nSanitización: 17 sistemas críticos\nTemp. mínima USP ‹1231›: 85 °C`
          )}
          onMouseLeave={handleMouseLeave}
          className="cursor-pointer"
        >
          <rect x={distrib.x} y={distrib.y} width={distrib.w} height={distrib.h} rx="10" fill="#161B22" stroke="#F85149" strokeWidth="1.5" />
          <SvgText x={distrib.x + distrib.w / 2} y={distrib.y + 24} fill="#F85149" fontSize={12}>
            Distribución WFI
          </SvgText>
          <SvgText x={distrib.x + distrib.w / 2} y={distrib.y + 48} fill="#E6EDF3" fontWeight={700} fontSize={15}>
            {params.T_c2.toFixed(0)} °C
          </SvgText>
          <SvgText x={distrib.x + distrib.w / 2} y={distrib.y + 70} fill="#8B949E" fontWeight={400} fontSize={10}>
            17 sistemas · 28 m³/h
          </SvgText>
          <SvgText x={distrib.x + distrib.w / 2} y={distrib.y + 88} fill="#8B949E" fontWeight={400} fontSize={10}>
            cGMP · USP ‹1231›
          </SvgText>
        </g>

        {/* ═══════════════════════════════════════════════════
            BADGES Q_cond / Q_evap (exteriores al bloque BC)
           ═══════════════════════════════════════════════════ */}
        <g transform={`translate(${bc.x + bc.w / 2}, ${bc.y - 24})`}>
          <rect x="-60" y="-12" width="120" height="22" rx="6" fill="#3FB950" fillOpacity="0.12" stroke="#3FB950" strokeWidth="1" />
          <SvgText x={0} y={0} fill="#3FB950" fontSize={11}>
            Q_cond = {result.Q_cond_kw.toFixed(0)} kW
          </SvgText>
        </g>
        <g transform={`translate(${bc.x + bc.w / 2}, ${bc.y + bc.h + 24})`}>
          <rect x="-60" y="-12" width="120" height="22" rx="6" fill="#A371F7" fillOpacity="0.12" stroke="#A371F7" strokeWidth="1" />
          <SvgText x={0} y={0} fill="#A371F7" fontSize={11}>
            Q_evap = {result.Q_evap_kw.toFixed(0)} kW
          </SvgText>
        </g>

        {/* ═══════════════════════════════════════════════════
            SUBTÍTULO DE CONDICIONES (debajo del diagrama, centrado)
           ═══════════════════════════════════════════════════ */}
        <g transform={`translate(${W / 2}, ${H - 28})`}>
          <SvgText x={0} y={0} fill="#8B949E" fontWeight={400} fontSize={10}>
            Escenario Simultaneidad 2 · Caudal {s1.volFlow.toFixed(1)} m³/h · ΔT {(params.T_c2 - params.T_c1).toFixed(0)} K · Altitud {params.altitud_msnm} msnm · P_atm {result.P_atm_bar.toFixed(3)} bar · Cierre energía {result.energyClosurePct.toFixed(4)} %
          </SvgText>
        </g>
      </svg>

      {/* Tooltip HTML */}
      {tooltip && (
        <div
          className="pointer-events-none fixed z-50 rounded-lg border border-[rgba(48,54,61,0.6)] bg-[#0D1117] px-3 py-2 text-xs text-[#E6EDF3] shadow-xl"
          style={{ left: tooltip.x + 12, top: tooltip.y }}
        >
          {tooltip.content.split("\n").map((line, i) => (
            <div key={i}>{line}</div>
          ))}
        </div>
      )}
    </div>
  );
}
