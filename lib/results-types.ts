export type AccuracyMetric = "position" | "orientation";
export type CameraMode = "mono" | "stereo";
export interface AccuracyDataset {
  id: string;
  name: string;
  label: string;
  N_report: number;
  sequenceIds: string[];
}
export interface AccuracyConfiguration {
  id: string;
  system: string;
  label: string;
  mode: string;
  displayMode: CameraMode;
  modeLabel: string;
  modeReviewRequired: boolean;
  inputVariant: string;
  platform: string;
  displayOrder: number;
}
export interface AccuracySequence {
  id: string;
  datasetId: string;
  label: string;
  group: string;
}
export interface AccuracyValue {
  value: number | null;
  unit: string;
  state: string;
  included: boolean;
  rawValue: string;
}
export interface AccuracyRecord {
  id: string;
  configurationId: string;
  datasetId: string;
  sequenceId: string;
  present: boolean;
  position: AccuracyValue;
  orientation: AccuracyValue;
  starCount: number;
  failureAnnotation: string;
  sourceArtifactId?: string;
  sourceRecordId?: string;
}
export interface AccuracyCell {
  configurationId: string;
  datasetId: string;
  metric: AccuracyMetric;
  value: number | null;
  unit: string;
  n: number;
  N_report: number;
  missingStatus: string;
  contributorSequenceIds: string[];
  recordIds: string[];
  displayValue: string;
  errorText: string;
  countText: string;
}
export interface AccuracyData {
  source: { revision: string; [key: string]: unknown };
  datasets: AccuracyDataset[];
  configurations: AccuracyConfiguration[];
  sequences: AccuracySequence[];
  records: AccuracyRecord[];
  cells: AccuracyCell[];
  caveats: unknown[];
}
export type EfficiencyMetric =
  | "nativeTotalMs"
  | "reportedCpuPercent"
  | "reportedProcessMemoryMiB";
export interface EfficiencyRow {
  sourceRecordId: string;
  inputId: string;
  system: string;
  systemId: string;
  mode: CameraMode;
  platform: string;
  dataset: string;
  sequence: string;
  inputVariant: string;
  sourceSelectedRuns: number;
  selectedRunException: boolean;
  nativeTotalMs: number | null;
  reportedCpuPercent: number | null;
  reportedProcessMemoryMiB: number | null;
  metricStatus: Record<string, string>;
  extendedMetrics?: Record<string, number | null>;
}
export interface EfficiencyData {
  inputs: {
    id: string;
    dataset: string;
    sequence: string;
    inputVariant: string;
    sourceRows: number;
  }[];
  metricDefinitions: Record<
    string,
    { label?: string; unit: string; statistic: string; scope: string }
  >;
  release: { sourceRevision: string; status: string; [key: string]: unknown };
  rows: EfficiencyRow[];
  [key: string]: unknown;
}
export interface SourceTable {
  id: string;
  datasetId: string;
  group: string;
  metric: string;
  columns: string[];
  rows: { method: string; cells: string[] }[];
}
export interface SourceTablesData {
  source: { revision: string; checkedAt: string; status: string };
  datasets: { id: string; name: string }[];
  tables: SourceTable[];
  notes: string[];
}
