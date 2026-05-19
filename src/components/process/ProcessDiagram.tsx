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
}: {
  x: number;
  y: number;
  children: React.ReactNode;
  fill?: string;
  fontSize?: number;
  fontWeight?: number | string;
  textAnchor?: string;
}) {
  return (
    <text
      x={x}
      y={y}
      textAnchor={textAnchor as any}
      style={{ fill }}
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
  const W = 960;
  const H = 640;

  // Bloques principales
  const tank7  = { x: 30,  y: 80,  w: 165, h: 120 }; // Tanque 7 (izquierda)
  const bc     = { x: 310, y: 50,  w: 340, h: 200 }; // Bomba de Calor CO₂ (centro)
  const distrib = { x: 765, y: 80,  w: 165, h: 120 }; // Red Distribución WFI 90°C (derecha)
  const retorno = { x: 310, y: 430, w: 340, h: 110 }; // Loop Retorno WFI (abajo centro)

  // Puntos de anclaje (lado caliente — agua WFI supply)
  const tank7Out  = { x: tank7.x + tank7.w,   y: tank7.y + 50 };
  const bcHotIn   = { x: bc.x,                y: bc.y + 60 };
  const bcHotOut  = { x: bc.x + bc.w,         y: bc.y + 60 };
  const distribIn = { x: distrib.x,           y: distrib.y + 50 };

  // Puntos de anclaje (lado frío — agua WFI retorno)
  const tank7BotIn  = { x: tank7.x + tank7.w,  y: tank7.y + 90 };
  const bcColdOut   = { x: bc.x,               y: bc.y + bc.h - 60 };
  const bcColdIn    = { x: bc.x + bc.w,        y: bc.y + bc.h - 60 };
  const retornoOut  = { x: retorno.x + retorno.w, y: retorno.y + 50 };
  const distribBot  = { x: distrib.x + distrib.w * 0.5, y: distrib.y + distrib.h };

  return (
    <div className="relative w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full min-w-[760px]"
        onMouseMove={handleMouseMove}
      >
        <defs>
          <linearGradient id="bcGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#3FB950" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#A371F7" stopOpacity="0.06" />
          </linearGradient>
          <linearGradient id="co2Grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#F0883E" stopOpacity="0.20" />
            <stop offset="100%" stopColor="#A371F7" stopOpacity="0.10" />
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
            @keyframes flowDash { to { stroke-dashoffset: -24; } }
            .flow-anim-red  { stroke-dasharray: 8 4; animation: flowDash 0.7s linear infinite; }
            .flow-anim-blue { stroke-dasharray: 8 4; animation: flowDash 0.9s linear infinite; }
            @keyframes co2Cycle { to { stroke-dashoffset: -20; } }
            .co2-anim { stroke-dasharray: 6 3; animation: co2Cycle 0.5s linear infinite; }
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
          opacity={hovered === "C1" ? 1 : 0.8}
          onMouseEnter={(e) => handleMouseEnter(e, formatStreamLabel(s1))}
          onMouseLeave={handleMouseLeave}
          className={`cursor-pointer transition-opacity ${hovered === "C1" ? "" : "flow-anim-red"}`}
        />
        <SvgText x={(tank7Out.x + bcHotIn.x) / 2} y={tank7Out.y - 22} fill="#F85149">
          C1 · {s1.T_C.toFixed(0)} °C
        </SvgText>
        <SvgText x={(tank7Out.x + bcHotIn.x) / 2} y={tank7Out.y + 18} fill="#8B949E" fontWeight={400} fontSize={11}>
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
          opacity={hovered === "C2" ? 1 : 0.8}
          onMouseEnter={(e) => handleMouseEnter(e, formatStreamLabel(s2))}
          onMouseLeave={handleMouseLeave}
          className={`cursor-pointer transition-opacity ${hovered === "C2" ? "" : "flow-anim-red"}`}
        />
        <SvgText x={(bcHotOut.x + distribIn.x) / 2} y={bcHotOut.y - 22} fill="#F85149">
          C2 · {s2.T_C.toFixed(0)} °C
        </SvgText>
        <SvgText x={(bcHotOut.x + distribIn.x) / 2} y={bcHotOut.y + 18} fill="#8B949E" fontWeight={400} fontSize={11}>
          {s2.volFlow.toFixed(1)} m³/h · {s2.massFlow.toFixed(0)} kg/h
        </SvgText>

        {/* ═══════════════════════════════════════════════════
            CORRIENTE C3: Retorno → Evaporador (70°C)
           ═══════════════════════════════════════════════════ */}
        <path
          d={`M${retornoOut.x},${retornoOut.y} L${bcColdIn.x + 8},${bcColdIn.y}`}
          stroke="#79C0FF"
          strokeWidth="3.5"
          fill="none"
          markerEnd="url(#arrowB)"
          opacity={hovered === "C3" ? 1 : 0.8}
          onMouseEnter={(e) => handleMouseEnter(e, formatStreamLabel(s3))}
          onMouseLeave={handleMouseLeave}
          className={`cursor-pointer transition-opacity ${hovered === "C3" ? "" : "flow-anim-blue"}`}
        />
        <SvgText x={(retornoOut.x + bcColdIn.x) / 2} y={bcColdIn.y - 22} fill="#79C0FF">
          C3 · {s3.T_C.toFixed(0)} °C
        </SvgText>
        <SvgText x={(retornoOut.x + bcColdIn.x) / 2} y={bcColdIn.y + 18} fill="#8B949E" fontWeight={400} fontSize={11}>
          {s3.volFlow.toFixed(1)} m³/h · {s3.massFlow.toFixed(0)} kg/h
        </SvgText>

        {/* ═══════════════════════════════════════════════════
            CORRIENTE C4: Evaporador → Tanque 7 (60°C)
           ═══════════════════════════════════════════════════ */}
        <path
          d={`M${bcColdOut.x},${bcColdOut.y} L${tank7BotIn.x + 8},${tank7BotIn.y}`}
          stroke="#79C0FF"
          strokeWidth="3.5"
          fill="none"
          markerEnd="url(#arrowB)"
          opacity={hovered === "C4" ? 1 : 0.8}
          onMouseEnter={(e) => handleMouseEnter(e, formatStreamLabel(s4))}
          onMouseLeave={handleMouseLeave}
          className={`cursor-pointer transition-opacity ${hovered === "C4" ? "" : "flow-anim-blue"}`}
        />
        <SvgText x={(bcColdOut.x + tank7BotIn.x) / 2} y={bcColdOut.y - 22} fill="#79C0FF">
          C4 · {s4.T_C.toFixed(0)} °C
        </SvgText>
        <SvgText x={(bcColdOut.x + tank7BotIn.x) / 2} y={bcColdOut.y + 18} fill="#8B949E" fontWeight={400} fontSize={11}>
          {s4.volFlow.toFixed(1)} m³/h · {s4.massFlow.toFixed(0)} kg/h
        </SvgText>

        {/* ═══════════════════════════════════════════════════
            Línea retorno: Distribución → bloque Retorno (65-70°C)
           ═══════════════════════════════════════════════════ */}
        <path
          d={`M${distribBot.x},${distribBot.y} L${distribBot.x},${retorno.y + 50} L${retorno.x + retorno.w + 8},${retorno.y + 50}`}
          stroke="#79C0FF"
          strokeWidth="2"
          fill="none"
          markerEnd="url(#arrowB)"
          opacity={0.5}
          strokeDasharray="6 3"
        />
        <SvgText x={distribBot.x + 30} y={(distribBot.y + retorno.y + 50) / 2} fill="#8B949E" fontWeight={400} fontSize={10} textAnchor="start">
          Retorno 65-70°C
        </SvgText>

        {/* ═══════════════════════════════════════════════════
            Ciclo CO₂ (interno BC) — representación esquemática
           ═══════════════════════════════════════════════════ */}
        {/* CO₂ del evaporador al compresor (curva interior) */}
        <path
          d={`M${bc.x + 80},${bc.y + bc.h - 30}
              Q${bc.x + 170},${bc.y + bc.h + 20}
              ${bc.x + bc.w / 2},${bc.y + bc.h / 2}
              Q${bc.x + bc.w - 170},${bc.y - 20}
              ${bc.x + bc.w - 80},${bc.y + 30}`}
          stroke="#F0883E"
          strokeWidth="1.5"
          fill="none"
          opacity={0.45}
          className="co2-anim"
          markerEnd="url(#arrowCO2)"
        />
        <path
          d={`M${bc.x + bc.w - 80},${bc.y + 30}
              Q${bc.x + bc.w / 2},${bc.y + 10}
              ${bc.x + 80},${bc.y + 30}`}
          stroke="#F0883E"
          strokeWidth="1.5"
          fill="none"
          opacity={0.45}
          className="co2-anim"
        />

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
          {/* Símbolo tanque (elipse inferior) */}
          <ellipse cx={tank7.x + tank7.w / 2} cy={tank7.y + tank7.h - 18} rx={50} ry={8} fill="#79C0FF" fillOpacity="0.08" stroke="#79C0FF" strokeWidth="1" opacity="0.5" />
          <SvgText x={tank7.x + tank7.w / 2} y={tank7.y + 26} fill="#79C0FF" fontSize={13}>
            Tanque 7 (Exist.)
          </SvgText>
          <SvgText x={tank7.x + tank7.w / 2} y={tank7.y + 50} fill="#E6EDF3" fontWeight={400} fontSize={11}>
            WFI precalentada
          </SvgText>
          <SvgText x={tank7.x + tank7.w / 2} y={tank7.y + 70} fill="#E6EDF3" fontWeight={700} fontSize={14}>
            {params.T_c1.toFixed(0)} °C
          </SvgText>
          <SvgText x={tank7.x + tank7.w / 2} y={tank7.y + 92} fill="#8B949E" fontWeight={400} fontSize={10}>
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
          <rect x={bc.x} y={bc.y} width={bc.w} height={bc.h} rx="12" fill="url(#bcGrad)" stroke="#3FB950" strokeWidth="2" />
          {/* Divisor interno Gas Cooler / Evaporador */}
          <line x1={bc.x + 20} y1={bc.y + bc.h / 2} x2={bc.x + bc.w - 20} y2={bc.y + bc.h / 2}
            stroke="#3FB950" strokeWidth="0.8" strokeDasharray="4 3" opacity="0.4" />

          {/* Encabezado */}
          <SvgText x={bc.x + bc.w / 2} y={bc.y + 22} fill="#3FB950" fontSize={14}>
            Bomba de Calor CO₂ Transcrítica
          </SvgText>

          {/* Sub-bloque Gas Cooler (mitad superior) */}
          <SvgText x={bc.x + bc.w / 2} y={bc.y + 46} fill="#F85149" fontWeight={700} fontSize={11}>
            Gas Cooler SWEP B649 · 95-97 bar
          </SvgText>
          <SvgText x={bc.x + bc.w / 2} y={bc.y + 64} fill="#8B949E" fontWeight={400} fontSize={10}>
            CO₂ 115°C → 35°C  ·  H₂O 75°C → 90°C
          </SvgText>

          {/* Badges de potencia (interior) */}
          <g transform={`translate(${bc.x + bc.w / 2 - 70}, ${bc.y + bc.h / 2 - 18})`}>
            <rect x="0" y="0" width="60" height="22" rx="5" fill="#3FB950" fillOpacity="0.15" stroke="#3FB950" strokeWidth="1" />
            <SvgText x={30} y={11} fill="#3FB950" fontSize={11}>
              ▲{result.Q_cond_kw.toFixed(0)} kW
            </SvgText>
          </g>
          <g transform={`translate(${bc.x + bc.w / 2 + 10}, ${bc.y + bc.h / 2 - 18})`}>
            <rect x="0" y="0" width="60" height="22" rx="5" fill="#F0883E" fillOpacity="0.15" stroke="#F0883E" strokeWidth="1" />
            <SvgText x={30} y={11} fill="#F0883E" fontSize={11}>
              ⚡{result.W_comp_kw.toFixed(0)} kW
            </SvgText>
          </g>

          {/* Sub-bloque Evaporador (mitad inferior) */}
          <SvgText x={bc.x + bc.w / 2} y={bc.y + bc.h / 2 + 24} fill="#79C0FF" fontWeight={700} fontSize={11}>
            Evaporador SWEP B649 · 57,8 bar
          </SvgText>
          <SvgText x={bc.x + bc.w / 2} y={bc.y + bc.h / 2 + 42} fill="#8B949E" fontWeight={400} fontSize={10}>
            CO₂ evap. ≈ 22°C (bifásico) · H₂O retorno 70°C
          </SvgText>

          {/* COP */}
          <g transform={`translate(${bc.x + bc.w - 82}, ${bc.y + bc.h - 28})`}>
            <rect x="0" y="0" width="72" height="20" rx="5" fill="#A371F7" fillOpacity="0.15" stroke="#A371F7" strokeWidth="1" />
            <SvgText x={36} y={10} fill="#A371F7" fontSize={10}>
              COP {params.copOperativo}
            </SvgText>
          </g>
          <g transform={`translate(${bc.x + 10}, ${bc.y + bc.h - 28})`}>
            <rect x="0" y="0" width="86" height="20" rx="5" fill="#A371F7" fillOpacity="0.08" stroke="#A371F7" strokeWidth="0.8" />
            <SvgText x={43} y={10} fill="#8B949E" fontSize={10}>
              {refrigerant}
            </SvgText>
          </g>
        </g>

        {/* ═══════════════════════════════════════════════════
            BLOQUE: Red Distribución WFI 90°C
           ═══════════════════════════════════════════════════ */}
        <g
          onMouseEnter={(e) => handleMouseEnter(e,
            `Red Distribución WFI 90°C\nBomba P-02 (existente)\n16-28 m³/h según escenario\nSanitización: 17 sistemas críticos\nTemp. mínima USP <1231>: 85°C`
          )}
          onMouseLeave={handleMouseLeave}
          className="cursor-pointer"
        >
          <rect x={distrib.x} y={distrib.y} width={distrib.w} height={distrib.h} rx="10" fill="#161B22" stroke="#F85149" strokeWidth="1.5" />
          <SvgText x={distrib.x + distrib.w / 2} y={distrib.y + 26} fill="#F85149" fontSize={12}>
            Distribución WFI
          </SvgText>
          <SvgText x={distrib.x + distrib.w / 2} y={distrib.y + 50} fill="#E6EDF3" fontWeight={700} fontSize={15}>
            {params.T_c2.toFixed(0)} °C
          </SvgText>
          <SvgText x={distrib.x + distrib.w / 2} y={distrib.y + 72} fill="#8B949E" fontWeight={400} fontSize={10}>
            17 sistemas · 28 m³/h
          </SvgText>
          <SvgText x={distrib.x + distrib.w / 2} y={distrib.y + 92} fill="#8B949E" fontWeight={400} fontSize={10}>
            cGMP · USP ‹1231›
          </SvgText>
        </g>

        {/* ═══════════════════════════════════════════════════
            BLOQUE: Loop Retorno WFI
           ═══════════════════════════════════════════════════ */}
        <g
          onMouseEnter={(e) => handleMouseEnter(e,
            `Loop Retorno WFI\nRetorno desde sistemas de sanitización\nTemperatura retorno: 65-70°C\nFuente calor evaporador CO₂\nSalida evaporador (C4): ${s4.T_C.toFixed(0)} °C → Tanque 7`
          )}
          onMouseLeave={handleMouseLeave}
          className="cursor-pointer"
        >
          <rect x={retorno.x} y={retorno.y} width={retorno.w} height={retorno.h} rx="10" fill="#161B22" stroke="#A371F7" strokeWidth="1.5" />
          <SvgText x={retorno.x + retorno.w / 2} y={retorno.y + 26} fill="#A371F7" fontSize={13}>
            Loop Retorno WFI
          </SvgText>
          <SvgText x={retorno.x + retorno.w / 2} y={retorno.y + 50} fill="#E6EDF3" fontWeight={400} fontSize={12}>
            65-70°C → Evaporador CO₂
          </SvgText>
          <SvgText x={retorno.x + retorno.w / 2} y={retorno.y + 74} fill="#8B949E" fontWeight={400} fontSize={11}>
            Q_evap = {result.Q_evap_kw.toFixed(0)} kW · {result.TR_evap.toFixed(1)} TR
          </SvgText>
          {/* Badge Q_evap */}
          <g transform={`translate(${retorno.x + retorno.w / 2}, ${retorno.y + retorno.h - 10})`}>
            <rect x="-52" y="-10" width="104" height="20" rx="8" fill="#A371F7" fillOpacity="0.15" stroke="#A371F7" strokeWidth="1" />
            <SvgText x={0} y={0} fill="#A371F7" fontSize={10}>
              ▼{result.Q_evap_kw.toFixed(0)} kW absorbidos CO₂
            </SvgText>
          </g>
        </g>

        {/* ═══════════════════════════════════════════════════
            CAJA DE CONDICIONES DE DISEÑO (esquina superior izquierda)
           ═══════════════════════════════════════════════════ */}
        <g transform="translate(30, 250)">
          <rect x="0" y="0" width="180" height="100" rx="8"
            fill="#161B22" stroke="#8B949E" strokeWidth="0.8" opacity="0.9" />
          <SvgText x={90} y={16} fill="#8B949E" fontSize={10} fontWeight={700}>
            Condiciones de Diseño
          </SvgText>
          <SvgText x={10} y={34} fill="#8B949E" fontSize={9} fontWeight={400} textAnchor="start">
            Escenario: Simultaneidad 2
          </SvgText>
          <SvgText x={10} y={50} fill="#8B949E" fontSize={9} fontWeight={400} textAnchor="start">
            Caudal: {s1.volFlow.toFixed(1)} m³/h · ΔT: {(params.T_c2 - params.T_c1).toFixed(0)} K
          </SvgText>
          <SvgText x={10} y={66} fill="#8B949E" fontSize={9} fontWeight={400} textAnchor="start">
            Altitud: {params.altitud_msnm} msnm · P_atm: {result.P_atm_bar.toFixed(3)} bar
          </SvgText>
          <SvgText x={10} y={82} fill="#8B949E" fontSize={9} fontWeight={400} textAnchor="start">
            Energía cierre: {result.energyClosurePct.toFixed(4)} %
          </SvgText>
        </g>

        {/* ═══════════════════════════════════════════════════
            FLUJOS DE ENERGÍA badge Q_cond arriba del BC
           ═══════════════════════════════════════════════════ */}
        <g transform={`translate(${bc.x + bc.w / 2}, ${bc.y - 22})`}>
          <rect x="-65" y="-14" width="130" height="26" rx="6" fill="#3FB950" fillOpacity="0.12" stroke="#3FB950" strokeWidth="1" />
          <SvgText x={0} y={0} fill="#3FB950" fontSize={12}>
            Q_cond = {result.Q_cond_kw.toFixed(0)} kW
          </SvgText>
        </g>

        {/* Q_evap badge abajo del BC */}
        <g transform={`translate(${bc.x + bc.w / 2}, ${bc.y + bc.h + 26})`}>
          <rect x="-65" y="-14" width="130" height="26" rx="6" fill="#A371F7" fillOpacity="0.12" stroke="#A371F7" strokeWidth="1" />
          <SvgText x={0} y={0} fill="#A371F7" fontSize={12}>
            Q_evap = {result.Q_evap_kw.toFixed(0)} kW
          </SvgText>
        </g>

        {/* ═══════════════════════════════════════════════════
            LEYENDA
           ═══════════════════════════════════════════════════ */}
        <g transform="translate(30, 610)">
          <rect x="0" y="-1" width="12" height="12" rx="2" fill="#F85149" opacity="0.7" />
          <SvgText x={18} y={5} fill="#8B949E" fontWeight={400} fontSize={11} textAnchor="start">
            WFI suministro (gas cooler)
          </SvgText>
          <rect x={220} y="-1" width="12" height="12" rx="2" fill="#79C0FF" opacity="0.7" />
          <SvgText x={238} y={5} fill="#8B949E" fontWeight={400} fontSize={11} textAnchor="start">
            WFI retorno (evaporador)
          </SvgText>
          <rect x={450} y="-1" width="12" height="12" rx="2" fill="#F0883E" opacity="0.7" />
          <SvgText x={468} y={5} fill="#8B949E" fontWeight={400} fontSize={11} textAnchor="start">
            Ciclo CO₂ transcrítico
          </SvgText>
          <rect x={670} y="-1" width="12" height="12" rx="2" fill="#A371F7" opacity="0.7" />
          <SvgText x={688} y={5} fill="#8B949E" fontWeight={400} fontSize={11} textAnchor="start">
            Q_evap absorbido
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
