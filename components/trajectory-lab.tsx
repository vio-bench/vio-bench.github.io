"use client";
import { useState } from "react";
import { Download, RotateCcw } from "lucide-react";
import { simulate, trajectoryCSV } from "@/lib/trajectory";
import { TrajectoryPlot } from "./trajectory-plot";
export function TrajectoryLab() {
  const [offset, setOffset] = useState(0.12);
  const [bias, setBias] = useState(0.006);
  const [coverage, setCoverage] = useState(100);
  const result = simulate({ offset, bias, coverage });
  function download() {
    const blob = new Blob([trajectoryCSV(result)], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `vioverse-synthetic-offset-${offset}-bias-${bias}-coverage-${coverage}.csv`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return (
    <div className="lab-grid">
      <aside className="controls">
        <h2>Change the conditions</h2>
        <p className="small">
          Each control changes the orange path. Start with one at a time.
        </p>
        <label className="slider-field">
          <span>
            Time offset <output>{offset.toFixed(2)} s</output>
          </span>
          <input
            type="range"
            min="-.5"
            max=".5"
            step=".01"
            value={offset}
            onChange={(e) => setOffset(+e.target.value)}
          />
          <small>Sample the reference at t + offset.</small>
        </label>
        <label className="slider-field">
          <span>
            Acceleration bias <output>{bias.toFixed(3)} m/s²</output>
          </span>
          <input
            type="range"
            min="0"
            max=".02"
            step=".001"
            value={bias}
            onChange={(e) => setBias(+e.target.value)}
          />
          <small>A constant bias along the world x-axis.</small>
        </label>
        <label className="slider-field">
          <span>
            Output duration <output>{coverage}%</output>
          </span>
          <input
            type="range"
            min="25"
            max="100"
            step="5"
            value={coverage}
            onChange={(e) => setCoverage(+e.target.value)}
          />
          <small>End the estimate before the 30 s reference ends.</small>
        </label>
        <button
          className="button secondary"
          onClick={() => {
            setOffset(0);
            setBias(0);
            setCoverage(100);
          }}
        >
          <RotateCcw size={15} /> Reset to ideal
        </button>
      </aside>
      <section className="lab-display">
        <h2>A top-down view of motion</h2>
        <p className="small">
          Synthetic trajectories · 30 seconds · 8 samples per second
        </p>
        <TrajectoryPlot reference={result.ref} estimate={result.estimate} />
        <div className="metric-grid" aria-live="polite" aria-atomic="true">
          <div className="metric">
            <span>Position RMSE · no alignment</span>
            <strong>
              {result.rmse.toFixed(3)} <small>m</small>
            </strong>
          </div>
          <div className="metric">
            <span>Time-span coverage</span>
            <strong>
              {result.coverage.toFixed(0)}
              <small>%</small>
            </strong>
          </div>
          <div className="metric">
            <span>Matched samples</span>
            <strong>
              {result.matchedSamples}
              <small> / 241</small>
            </strong>
          </div>
        </div>
        <p className="note-line">
          RMSE uses only the available estimate, from 0 to{" "}
          {result.end.toFixed(1)} s. Missing output is excluded, never assigned
          zero error.
        </p>
        <button className="button secondary" onClick={download}>
          <Download size={15} /> Download this experiment
        </button>
      </section>
    </div>
  );
}
