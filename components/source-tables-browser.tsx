"use client";
import { useSearchParams } from "next/navigation";
import currentSource from "@/public/data/current-source-tables.json";
import type { SourceTablesData } from "@/lib/results-types";
import { updateQuery } from "./results-shared";

const data = currentSource as SourceTablesData;
const defaultFilters = {
  dataset: "all",
  metric: "all",
  group: "all",
  query: "",
  sequence: "",
};
type Filters = typeof defaultFilters;

function displaySourceValue(value: string) {
  return value.replace(/\$/g, "")
    .replace(/\\text\{([^{}]*)\}/g, "$1")
    .replace(/\{\\scriptsize\s+([^{}]*)\}/g, "$1")
    .replace(/\^\{(\*+)\}/g, "$1")
    .trim();
}

function normalizeFilters(filters: Filters): Filters {
  const dataset = data.datasets.some((d) => d.id === filters.dataset)
    ? filters.dataset
    : "all";
  const available = data.tables.filter(
    (table) => dataset === "all" || table.datasetId === dataset,
  );
  return {
    ...filters,
    dataset,
    metric: available.some((table) => table.metric === filters.metric)
      ? filters.metric
      : "all",
    group: available.some((table) => table.group === filters.group)
      ? filters.group
      : "all",
  };
}

export function SourceTablesBrowser() {
  const searchParams = useSearchParams();
  const filters = normalizeFilters({
    dataset: searchParams.get("dataset") ?? "all",
    metric: searchParams.get("metric") ?? "all",
    group: searchParams.get("group") ?? "all",
    query: searchParams.get("query") ?? "",
    sequence: searchParams.get("sequence") ?? "",
  });
  const { dataset, metric, group, query, sequence } = filters;
  const available = data.tables.filter(
    (table) => dataset === "all" || table.datasetId === dataset,
  );
  const metrics = Array.from(new Set(available.map((table) => table.metric)));
  const groups = Array.from(new Set(available.map((table) => table.group)));

  function change(changes: Partial<Filters>) {
    const next = { ...filters, ...changes };
    if (changes.dataset !== undefined && changes.group === undefined)
      next.group = "all";
    updateQuery(normalizeFilters(next));
  }

  function resetFilters() {
    updateQuery(defaultFilters);
  }

  const methodQuery = query.trim().toLowerCase();
  const sequenceQuery = sequence.trim().toLowerCase();
  const tables = available
    .filter(
      (table) =>
        (metric === "all" || table.metric === metric) &&
        (group === "all" || table.group === group) &&
        (!sequenceQuery ||
          table.columns.some(
            (column) =>
              column !== "Average" &&
              column.toLowerCase().includes(sequenceQuery),
          )),
    )
    .map((table) => {
      const columnIndices = table.columns.flatMap((column, index) =>
        !sequenceQuery ||
        column === "Average" ||
        column.toLowerCase().includes(sequenceQuery)
          ? [index]
          : [],
      );
      return {
        ...table,
        columns: columnIndices.map((index) => table.columns[index]),
        rows: table.rows
          .filter((row) => row.method.toLowerCase().includes(methodQuery))
          .map((row) => ({
            method: row.method,
            cells: columnIndices.map((index) => row.cells[index]),
          })),
      };
    })
    .filter((table) => table.rows.length > 0);
  const matchingRows = tables.reduce((sum, table) => sum + table.rows.length, 0);
  const focused = dataset !== "all";
  return (
    <>
      <div className="filters results-filters">
        <label className="field">
          Dataset
          <select
            value={dataset}
            onChange={(e) => change({ dataset: e.target.value })}
          >
            <option value="all">All datasets</option>
            {data.datasets.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </label>
        <label className="field sequence-field">
          Metric
          <select
            value={metric}
            onChange={(e) => change({ metric: e.target.value })}
          >
            <option value="all">All metrics</option>
            {metrics.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          Group
          <select
            value={group}
            onChange={(e) => change({ group: e.target.value })}
          >
            <option value="all">All groups</option>
            {groups.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          System
          <input
            type="search"
            placeholder="Find a system…"
            value={query}
            onChange={(e) => change({ query: e.target.value })}
          />
        </label>
        <label className="field">
          Sequence
          <input
            type="search"
            placeholder="Find a sequence…"
            value={sequence}
            onChange={(e) => change({ sequence: e.target.value })}
            aria-describedby="source-average-note"
          />
        </label>
      </div>
      <div className="source-table-tools">
        <p className="small" role="status" aria-live="polite">
          {tables.length} table{tables.length === 1 ? "" : "s"} · {matchingRows} row{matchingRows === 1 ? "" : "s"}
        </p>
        <button className="button secondary" onClick={resetFilters}>
          Reset
        </button>
      </div>
      <details className="result-reading-note">
        <summary>Notes</summary>
        <p>Values are rotation (degrees) / translation (meters). RPE is not divided by segment length.</p>
        <p id="source-average-note">Average is the reported group mean and does not change when sequence columns are filtered.</p>
        <p><a href="/results/#calculation">Metric definitions and aggregation →</a></p>
        <ul>
          {data.notes.map((note) => <li key={note}>{note}</li>)}
        </ul>
      </details>
      {tables.map((table) => (
        <details
          className="source-table-section"
          key={`${table.id}:${focused}`}
          open={focused}
        >
          <summary className="source-table-summary">
            <strong>
              {data.datasets.find((d) => d.id === table.datasetId)?.name} ·{" "}
              {table.group}
            </strong>{" — "}{table.metric}
          </summary>
          <div className="table-scroll">
            <table className="source-table">
              <caption className="sr-only">
                {data.datasets.find((d) => d.id === table.datasetId)?.name},{" "}
                {table.group}, {table.metric};
                original source order. Average is not
                recomputed by the website.
              </caption>
              <thead>
                <tr>
                  <th scope="col">System</th>
                  {table.columns.map((column) => (
                    <th key={column} scope="col">
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {table.rows.map((row, rowIndex) => (
                  <tr key={`${row.method}:${rowIndex}`}>
                    <th scope="row">{row.method}</th>
                    {row.cells.map((value, index) => (
                      <td key={index} title={value}>{displaySourceValue(value)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      ))}
      {!tables.length && (
        <div className="empty">
          <h2>No matching source rows.</h2>
          <p>Try another dataset, metric, group, method, or sequence column.</p>
          <button
            className="button secondary"
            onClick={resetFilters}
          >
            Show all trajectory tables
          </button>
        </div>
      )}
    </>
  );
}
