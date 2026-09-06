"use client";
import { useEffect, useRef, useState } from "react";
import type { Point } from "@/lib/trajectory";
export function TrajectoryPlot({
  reference,
  estimate,
}: {
  reference: Point[];
  estimate: Point[];
}) {
  const el = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(480);
  useEffect(() => {
    if (!el.current) return;
    const obs = new ResizeObserver(([e]) =>
      setWidth(Math.max(240, e.contentRect.width)),
    );
    obs.observe(el.current);
    return () => obs.disconnect();
  }, []);
  const height = 280,
    pad = 40;
  const all = [...reference, ...estimate];
  const xmin = Math.min(...all.map((p) => p.x)) - 1,
    xmax = Math.max(...all.map((p) => p.x)) + 1,
    ymin = Math.min(...all.map((p) => p.y)) - 1,
    ymax = Math.max(...all.map((p) => p.y)) + 1;
  const scale = Math.min(
    (width - 2 * pad) / (xmax - xmin),
    (height - 2 * pad) / (ymax - ymin),
  );
  const x = (v: number) => width / 2 + (v - (xmin + xmax) / 2) * scale;
  const y = (v: number) => height / 2 - (v - (ymin + ymax) / 2) * scale;
  const points = (ps: Point[]) =>
    ps.map((p) => `${x(p.x)},${y(p.y)}`).join(" ");
  return (
    <div ref={el} className="trajectory">
      <svg
        width="100%"
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label="Top-down synthetic trajectory. Blue is reference motion; orange is the perturbed estimate. Both axes use meters and the same scale."
      >
        {[0, 0.25, 0.5, 0.75, 1].map((f) => (
          <g key={f}>
            <line
              x1={pad}
              x2={width - pad}
              y1={pad + (height - pad * 2) * f}
              y2={pad + (height - pad * 2) * f}
              stroke="#dfe5ee"
              strokeDasharray="3 5"
            />
            <text
              x={pad - 8}
              y={pad + (height - pad * 2) * f + 4}
              textAnchor="end"
              fill="#6a778b"
              fontSize="11"
            >
              {(
                (ymin + ymax) / 2 +
                (height / 2 - pad - (height - pad * 2) * f) / scale
              ).toFixed(0)}
            </text>
            <text
              x={pad + (width - pad * 2) * f}
              y={height - pad + 17}
              textAnchor="middle"
              fill="#6a778b"
              fontSize="11"
            >
              {(
                (xmin + xmax) / 2 +
                (pad + (width - pad * 2) * f - width / 2) / scale
              ).toFixed(0)}
            </text>
          </g>
        ))}
        <line
          x1={pad}
          x2={width - pad}
          y1={height - pad}
          y2={height - pad}
          stroke="#bcc6d6"
        />
        <line x1={pad} x2={pad} y1={pad} y2={height - pad} stroke="#bcc6d6" />
        <text
          x={width / 2}
          y={height - 9}
          textAnchor="middle"
          fill="#5e6b80"
          fontSize="12"
        >
          x (m) · equal axis scale
        </text>
        <text x="14" y="26" fill="#5e6b80" fontSize="12">
          y (m)
        </text>
        <polyline
          points={points(reference)}
          fill="none"
          stroke="#2559e9"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <polyline
          points={points(estimate)}
          fill="none"
          stroke="#d66a25"
          strokeWidth="2.5"
          strokeDasharray="6 4"
          strokeLinecap="round"
        />
        <circle
          cx={x(reference[0].x)}
          cy={y(reference[0].y)}
          r="4"
          fill="#18213a"
        />
        <text
          x={x(reference[0].x) + 9}
          y={y(reference[0].y) + 17}
          fill="#37455b"
          fontSize="12"
        >
          start
        </text>
      </svg>
      <div className="plot-legend">
        <span>
          <i className="dot blue" />
          Reference
        </span>
        <span>
          <i className="dot orange" />
          Perturbed estimate
        </span>
      </div>
    </div>
  );
}
