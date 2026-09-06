"use client";
import { useState } from "react";
import snapshot from "@/public/data/runtime.json";
export function RuntimeExplorer() {
  const [platform, setPlatform] = useState("Desktop");
  const [sort, setSort] = useState("native");
  const records = snapshot.records
    .filter((r) => r.platform === platform)
    .sort((a, b) =>
      sort === "name"
        ? a.system.localeCompare(b.system)
        : a.nativeTotalMs - b.nativeTotalMs,
    );
  const max = Math.max(...records.map((r) => r.nativeTotalMs));
  return (
    <>
      <div className="filters">
        <label className="field">
          Platform
          <select
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
          >
            {Object.keys(snapshot.scope.platformCounts).map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
        </label>
        <label className="field">
          Order by
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="native">Native time · ascending</option>
            <option value="name">System name · A–Z</option>
          </select>
        </label>
        <span className="filter-count" role="status">
          {records.length} reported records · mono · R_02_easy
        </span>
      </div>
      <div className="table-scroll">
        <table>
          <caption className="sr-only">
            {platform}: implementation-reported native runtime and resource use
            for LaMAria R_02_easy monocular input
          </caption>
          <thead>
            <tr>
              <th scope="col">SYSTEM</th>
              <th scope="col">MEAN NATIVE TOTAL TIME (ms) ↓</th>
              <th scope="col">REPORTED CPU (%)</th>
              <th scope="col">PROCESS MEMORY (MiB)</th>
              <th scope="col">RECORD CONTEXT</th>
            </tr>
          </thead>
          <tbody>
            {records.map((r) => (
              <tr key={r.id}>
                <td>
                  <strong>{r.system}</strong>
                </td>
                <td className="runtime-cell">
                  <span
                    aria-hidden="true"
                    className="runtime-bar"
                    style={{ width: (160 * r.nativeTotalMs) / max }}
                  />
                  <strong>{r.nativeTotalLabel}</strong>
                </td>
                <td>{r.reportedCpuPercent.toFixed(2)}</td>
                <td>{r.reportedProcessMemoryMiB.toFixed(1)}</td>
                <td>
                  <details className="record-detail">
                    <summary>Inspect record</summary>
                    <p>
                      {r.sourceTable}. {r.selectedSourceRowRuns} selected source
                      runs; contributing count for each metric is unreported.
                      Snapshot: {r.sourceRef}. Individual run artifacts are not
                      included.
                    </p>
                  </details>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="note-line" style={{ marginTop: 15 }}>
        Bars rescale within the selected platform. Native instrumentation
        differs between systems; lower values do not establish better accuracy
        or overall performance.
      </p>
      <details className="exercise" style={{ marginTop: 20 }}>
        <summary>Missing entries on {platform}</summary>
        <p className="small">{snapshot.missingPolicy}</p>
        <ul>
          {snapshot.missingRecords
            .filter((r) => r.platform === platform)
            .map((r) => (
              <li key={r.system} className="small">
                {r.system}: {r.meaning}
              </li>
            ))}
        </ul>
      </details>
    </>
  );
}
