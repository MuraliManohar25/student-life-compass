import React, { useState } from "react";
import { MONTHLY_GROWTH_DATA } from "../../data/intelligenceData";

// Monthly Growth Section: Interactive smooth line chart showing natural monthly score improvement.
export const MonthlyImprovementCard: React.FC = () => {
  const [activePoint, setActivePoint] = useState<number | null>(3); // Default August 2026 selected

  const svgWidth = 600;
  const svgHeight = 220;
  const paddingX = 50;
  const paddingY = 40;
  const chartWidth = svgWidth - paddingX * 2;
  const chartHeight = svgHeight - paddingY * 2;

  const minScore = 70;
  const maxScore = 90;

  // Compute (x, y) coordinates for each point
  const points = MONTHLY_GROWTH_DATA.map((item, index) => {
    const x = paddingX + (index / (MONTHLY_GROWTH_DATA.length - 1)) * chartWidth;
    const y = svgHeight - paddingY - ((item.score - minScore) / (maxScore - minScore)) * chartHeight;
    return { x, y, ...item };
  });

  // Generate smooth cubic bezier curve SVG path
  const createSmoothPath = (pts: { x: number; y: number }[]) => {
    if (pts.length < 2) return "";
    let d = `M ${pts[0].x},${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i === 0 ? i : i - 1];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[i + 2 < pts.length ? i + 2 : i + 1];

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      d += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
    }
    return d;
  };

  const linePath = createSmoothPath(points);
  const areaPath = `${linePath} L ${points[points.length - 1].x},${svgHeight - paddingY} L ${points[0].x},${svgHeight - paddingY} Z`;

  return (
    <div className="glass-card p-6 md:p-8 rounded-3xl border border-white/10 space-y-6 bg-gradient-to-br from-[#1a1a2e]/70 via-[#16162a]/60 to-[#0f0f1b]/80 backdrop-blur-xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-white/10 pb-4">
        <div>
          <h2 className="font-headline font-bold text-xl text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-emerald-400">show_chart</span>
            <span>Monthly Growth Trajectory</span>
          </h2>
          <p className="text-xs text-[#c7c4d8] mt-0.5">
            Real monthly score progression displaying gradual improvement leading to October 2026 projection
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold text-xs">
            +12 Points (May – Oct)
          </span>
        </div>
      </div>

      {/* SVG Smooth Line Chart */}
      <div className="relative w-full overflow-hidden">
        <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto overflow-visible">
          <defs>
            <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#4f46e5" />
              <stop offset="50%" stopColor="#818cf8" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
            <linearGradient id="areaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[75, 80, 85].map((scoreVal) => {
            const gridY = svgHeight - paddingY - ((scoreVal - minScore) / (maxScore - minScore)) * chartHeight;
            return (
              <g key={scoreVal}>
                <line
                  x1={paddingX}
                  y1={gridY}
                  x2={svgWidth - paddingX}
                  y2={gridY}
                  stroke="rgba(255, 255, 255, 0.08)"
                  strokeDasharray="4 4"
                />
                <text
                  x={paddingX - 12}
                  y={gridY + 4}
                  fill="#c7c4d8"
                  fontSize="10"
                  textAnchor="end"
                  className="font-mono font-semibold"
                >
                  {scoreVal}
                </text>
              </g>
            );
          })}

          {/* Shaded Area Under Line */}
          <path d={areaPath} fill="url(#areaGrad)" />

          {/* Smooth Line */}
          <path
            d={linePath}
            fill="none"
            stroke="url(#lineGrad)"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data Points */}
          {points.map((pt, idx) => {
            const isSelected = activePoint === idx;
            return (
              <g key={pt.month} className="cursor-pointer group" onClick={() => setActivePoint(idx)}>
                {/* Glow ring on hover/selected */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isSelected ? 12 : 7}
                  fill={isSelected ? "rgba(16, 185, 129, 0.25)" : "transparent"}
                  className="transition-all duration-300"
                />
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isSelected ? 6 : 4}
                  fill={isSelected ? "#10b981" : "#818cf8"}
                  stroke="#131314"
                  strokeWidth="2"
                  className="transition-all duration-300"
                />

                {/* Score label on hover/active */}
                <g className={`transition-opacity duration-300 ${isSelected ? "opacity-100" : "opacity-75 group-hover:opacity-100"}`}>
                  <rect
                    x={pt.x - 20}
                    y={pt.y - 30}
                    width="40"
                    height="20"
                    rx="6"
                    fill="#1e1e2d"
                    stroke="rgba(255, 255, 255, 0.2)"
                  />
                  <text
                    x={pt.x}
                    y={pt.y - 16}
                    fill="#ffffff"
                    fontSize="10"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    {pt.score}
                  </text>
                </g>

                {/* Month X-Axis Label */}
                <text
                  x={pt.x}
                  y={svgHeight - 12}
                  fill={isSelected ? "#ffffff" : "#c7c4d8"}
                  fontSize="11"
                  fontWeight={isSelected ? "bold" : "normal"}
                  textAnchor="middle"
                >
                  {pt.month}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Selected Month Detail Banner */}
      {activePoint !== null && (
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[#c3c0ff]">insights</span>
            <div>
              <p className="text-xs font-bold text-white">
                {MONTHLY_GROWTH_DATA[activePoint].month} Performance
              </p>
              <p className="text-[11px] text-[#c7c4d8]">
                Recorded monthly overall performance score
              </p>
            </div>
          </div>
          <span className="text-xl font-headline font-black text-emerald-400">
            {MONTHLY_GROWTH_DATA[activePoint].score} / 100
          </span>
        </div>
      )}
    </div>
  );
};
