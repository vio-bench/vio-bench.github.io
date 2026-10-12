import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";

const load = (name) => JSON.parse(readFileSync(new URL(`../public/data/${name}.json`, import.meta.url), "utf8"));
const accuracy = load("current-paper-accuracy");
const resources = load("current-paper-resources");
const alignment = load("current-paper-alignment");
const current = load("current-results");
const sourceTables = load("current-source-tables");
const fullResources = load("current-efficiency");
const paperRevision = "8d6fa5bff03ef903c97cbbf6976cf9c1d9dfb96c";
const trajectoryRevision = "d11e47385afcf3745d17912654d3a22b4b8bb2ca";
const resourceRevision = "29a1fa93804899fac8bf17799b5bd101ae02d9a4";
const key = (row, fields) => fields.map((field) => row[field]).join("|");
const near = (actual, expected, tolerance = 1e-10) => assert.ok(Math.abs(actual - expected) <= tolerance * Math.max(1, Math.abs(expected)), `${actual} != ${expected}`);
const configurations = new Map(current.configurations.map((row) => [row.id, row]));
const means = new Map([...current.accuracy.aggregates, ...current.rpe10.aggregates].map((row) => [key(row, ["configurationId", "datasetId", "metric"]), row]));
const srMeans = new Map(current.coverage.aggregates.map((row) => [key(row, ["configurationId", "datasetId"]), row]));
const resourceRecords = new Map(fullResources.rows.map((row) => [row.sourceRecordId, row]));
const tableCells = new Map(sourceTables.tables.flatMap((table) => table.rows.flatMap((row) => row.cells.map((raw, index) => [
  [table.datasetId, table.group, table.metricFamily, table.rpeLengthM ?? "", row.method, table.columns[index]].join("|"), raw,
]))));
const rawPair = (raw) => {
  const clean = raw.replace(/\^\{\*+\}/g, "");
  const pair = clean.match(/([-+]?\d+(?:\.\d+)?)\s*\/\s*([-+]?\d+(?:\.\d+)?)/);
  return pair ? [Number(pair[1]), Number(pair[2])] : null;
};
const cell = (system, metric) => resources.tableII.rows.find((row) => row.system === system).cells[metric];

test("paper ledgers retain the installed snapshot, frozen sources, and separate scientific scopes", () => {
  assert.equal(accuracy.source.paperRevision, paperRevision);
  assert.equal(resources.release.paperRevision, paperRevision);
  assert.equal(alignment.paper.snapshotRevision, paperRevision);
  assert.equal(accuracy.source.trajectoryRevision, trajectoryRevision);
  assert.equal(accuracy.source.batch, "20260909_030015");
  assert.equal(accuracy.source.srAuthority, "designated-three-expected-run-export");
  assert.equal(resources.release.fullResourceRevision, resourceRevision);
  assert.equal(resources.release.benchmarkRerun, false);
  assert.equal(resources.release.plotRerender, false);
  for (const artifacts of [accuracy.source.artifacts, resources.artifacts, alignment.provenance.sourceArtifacts]) {
    assert.equal(new Set(artifacts.map((artifact) => artifact.id)).size, artifacts.length);
    for (const artifact of artifacts) assert.match(artifact.sha256, /^[a-f0-9]{64}$/);
  }
  assert.equal(accuracy.source.artifacts.find((artifact) => artifact.id === "fig1-values").sha256, "26468b2805353e7d9acc24a5d33fce1c9e00f940abf74f90eebd826b7d902338");
  assert.equal(accuracy.source.artifacts.find((artifact) => artifact.id === "sr-sequence-source").sha256, current.sources.find((item) => item.id === "sr").files.find((item) => item.name === "sr-sequence.csv").sha256);
  const fullResourceArtifact = resources.artifacts.find((artifact) => artifact.id === "resources/full-source-export.json");
  const fullResourceBytes = readFileSync(new URL("../public/data/current-efficiency.json", import.meta.url));
  assert.equal(fullResourceArtifact.sha256, createHash("sha256").update(fullResourceBytes).digest("hex"));
  for (const data of [accuracy, resources, alignment]) {
    assert.equal(data.schemaVersion, 1);
    assert.doesNotMatch(JSON.stringify(data), /\/Users\/|\/home\/|https?:\/\/|[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/);
  }
});

test("all 352 Fig.1 cells match the regular means with independent metric counts and honest absent identities", () => {
  const records = accuracy.objects.figure1.records;
  assert.equal(records.length, 352);
  assert.equal(new Set(records.map((row) => key(row, ["system", "mode", "datasetId", "metric"]))).size, 352);
  assert.equal(new Set(records.map((row) => row.system)).size, 11);
  assert.equal(records.filter((row) => row.value !== null).length, 280);
  assert.equal(records.filter((row) => row.configurationId === null).length, 64);
  assert.deepEqual(new Set(records.map((row) => row.panel)), new Set(["a", "b", "c", "d"]));
  for (const row of records) {
    assert.equal(row.protocol, "epa-drift valid");
    assert.equal(row.unit, ["position_ate", "translation_rpe"].includes(row.metric) ? "m" : "deg");
    assert.equal(row.segmentLengthM, row.metric.endsWith("rpe") ? 10 : null);
    if (row.configurationId === null) {
      assert.equal(row.value, null);
      assert.equal(row.valueText, "");
      assert.equal(row.n, null);
      assert.equal(row.sequenceCount, null);
      assert.equal(row.displayState, "no_record");
      assert.equal(row.missingStatus, "no_configuration_identity");
      continue;
    }
    const config = configurations.get(row.configurationId);
    assert.equal(config.system, row.system);
    assert.equal(config.mode, row.mode);
    const regular = means.get(key(row, ["configurationId", "datasetId", "metric"]));
    assert.ok(regular);
    for (const field of ["value", "valueText", "n", "sequenceCount", "missingStatus"]) assert.equal(row[field], regular[field]);
    assert.equal(row.noncontributingSequences, row.sequenceCount - row.n);
    if (row.value !== null) assert.equal(row.value, Number(row.valueText));
  }
  const count = (metric) => records.find((row) => row.configurationId === "rovio" && row.datasetId === "aqualoc" && row.metric === metric).n;
  assert.equal(count("position_ate"), 12);
  assert.equal(count("translation_rpe"), 10);
});

test("all 72 Fig.2 means match the sole SR source, including missing/invalid slot counts", () => {
  const records = accuracy.objects.figure2.records;
  assert.equal(records.length, 72);
  assert.equal(new Set(records.map((row) => key(row, ["configurationId", "datasetId"]))).size, 72);
  for (const row of records) {
    const regular = srMeans.get(key(row, ["configurationId", "datasetId"]));
    assert.ok(regular);
    for (const field of ["value", "valueText", "sequenceCount", "validRuns", "missingRuns", "invalidRuns"]) assert.equal(row[field], regular[field]);
    assert.equal(row.expectedRunCount, regular.expectedRuns);
    assert.equal(row.expectedRunCount, row.sequenceCount * 3);
    assert.equal(row.validRuns + row.missingRuns + row.invalidRuns, row.expectedRunCount);
    assert.equal(row.unit, "%");
    assert.equal(row.protocol, "sr-three-expected-runs");
    assert.equal(row.value, Number(row.valueText));
  }
  assert.ok(records.some((row) => row.missingRuns > 0));
  assert.ok(records.some((row) => row.invalidRuns > 0));
});

test("Fig.4 preserves all 28 plotted values, both statistical objects and complete source availability outside its selection", () => {
  const records = accuracy.objects.figure4.records;
  assert.equal(records.length, 28);
  assert.equal(new Set(records.map((row) => key(row, ["configurationId", "sequence", "metric"]))).size, 28);
  assert.deepEqual([...new Set(records.map((row) => row.sequence))], ["sequence_1_19", "sequence_1_20", "sequence_2_11", "sequence_2_12", "sequence_3_17", "sequence_3_18", "sequence_4_11"]);
  assert.deepEqual(new Set(records.map((row) => row.configurationId)), new Set(["open_vins_mono", "sqrtvins_mono"]));
  for (const row of records) {
    assert.equal(row.datasetId, "lamaria");
    assert.equal(row.group, "Additional Sequence");
    assert.equal(row.mode, "mono");
    assert.equal(row.value, Number(row.valueText));
    if (row.metric === "position_ate") {
      const raw = tableCells.get([row.datasetId, row.group, "ATE", "", row.configurationId, row.sequence].join("|"));
      assert.equal(row.raw, raw);
      assert.equal(row.value, rawPair(raw)[1]);
      assert.equal(row.excludedRunCount, raw.match(/\^\{(\*+)\}/)?.[1].length ?? 0);
      assert.equal(row.protocol, "epa-drift valid");
      assert.equal(row.unit, "m");
    } else {
      const regular = current.coverage.sequences.find((item) => item.configurationId === row.configurationId && item.datasetId === row.datasetId && item.sequence === row.sequence);
      assert.ok(regular);
      assert.equal(row.valueText, regular.valueText);
      assert.equal(regular.expectedRuns, 3);
      assert.equal(row.protocol, "sr-three-expected-runs");
      assert.equal(row.unit, "%");
    }
  }
  assert.ok(!records.some((row) => row.sequence === "sequence_4_10"));
  assert.ok(tableCells.has("lamaria|Additional Sequence|ATE||open_vins_mono|sequence_4_10"));
  assert.ok(current.coverage.sequences.some((row) => row.configurationId === "open_vins_mono" && row.datasetId === "lamaria" && row.sequence === "sequence_4_10"));
  assert.equal(records.find((row) => row.configurationId === "open_vins_mono" && row.sequence === "sequence_4_11" && row.metric === "position_ate").excludedRunCount, 2);
});

test("Tables III and IV match the exact dataset or group statistics without replacing group means by dataset means", () => {
  assert.equal(accuracy.objects.tableIII.records.length, 8);
  assert.equal(accuracy.objects.tableIV.records.length, 8);
  for (const table of [accuracy.objects.tableIII, accuracy.objects.tableIV]) for (const row of table.records) {
    const config = configurations.get(row.configurationId);
    assert.equal(row.system, config.system);
    assert.equal(row.mode, config.mode);
    assert.equal(row.protocol, "epa-drift valid");
    assert.equal(row.value, Number(row.valueText));
    assert.equal(row.n, row.sequenceCount);
    if (row.statisticalUnit === "dataset mean") {
      const regular = means.get(key(row, ["configurationId", "datasetId", "metric"]));
      assert.equal(row.valueText, regular.valueText);
      assert.equal(row.n, regular.n);
      assert.equal(row.sequenceCount, 11);
    } else {
      assert.equal(row.statisticalUnit, "reported group mean");
      const family = row.metric.endsWith("rpe") ? "RPE" : "ATE";
      const raw = tableCells.get([row.datasetId, row.group, family, row.segmentLengthM ?? "", row.configurationId, "Average"].join("|"));
      assert.ok(raw);
      if (Object.hasOwn(row, "raw")) assert.equal(row.raw, raw);
      assert.equal(row.value, rawPair(raw)[row.metric === "rotation_rpe" ? 0 : 1]);
      assert.equal(row.sequenceCount, row.group === "Medium" ? 4 : row.group === "CP" ? 3 : 5);
    }
  }
  const cp = accuracy.objects.tableIV.records.filter((row) => row.datasetId === "lamaria");
  assert.equal(cp.find((row) => row.configurationId === "kimera_vio_mono" && row.metric === "position_ate").displayValue, "13.4");
  assert.equal(cp.find((row) => row.configurationId === "vins-fusion_monoimu" && row.metric === "translation_rpe").displayValue, "0.85");
});

test("Fig.3 retains exactly 39 installed points and all 117 values, including five updated SVO inputs", () => {
  const points = resources.figure3.points;
  assert.equal(points.length, 39);
  assert.equal(points.reduce((count, point) => count + Object.keys(point.values).length, 0), 117);
  assert.equal(new Set(points.map((point) => point.pointId)).size, 39);
  assert.equal(new Set(points.map((point) => [point.systemId, point.mode, point.dataset, point.sequence, point.inputVariant, point.platform].join("|"))).size, 39);
  assert.equal(points.filter((point) => point.source.revision === "d4790e471f5526f0e6d69607fba977bbea889544").length, 34);
  assert.equal(points.filter((point) => point.source.revision === resourceRevision).length, 5);
  assert.equal(points.filter((point) => point.system === "SVO Pro").length, 5);
  assert.equal(new Set(points.map((point) => point.dataset)).size, 5);
  for (const point of points) {
    const regular = resourceRecords.get(point.fullResourceComparison.recordId);
    assert.ok(regular);
    for (const field of ["systemId", "mode", "platform", "dataset", "sequence", "inputVariant"]) assert.equal(point[field], regular[field]);
    assert.equal(point.platform, "Desktop");
    assert.equal(point.mode, "mono");
    assert.equal(point.selectedRuns, 5);
    assert.equal(point.contributingRuns, null);
    assert.equal(point.fullResourceComparison.sameRunSetVerified, false);
    for (const [metric, measurement] of Object.entries(point.values)) {
      assert.equal(measurement.value, regular[metric]);
      assert.equal(measurement.value, Number(measurement.valueText));
      assert.equal(measurement.numericAgreementWithFullResource, true);
    }
    assert.equal(point.inputVariant, point.dataset === "GrandTour" ? "standard" : "unspecified");
  }
  assert.equal(resources.fullResourceScope.sourceRows, 166);
  assert.equal(fullResources.rows.length, 166);
  assert.equal(resources.fullResourceScope.sourcePresentStatisticSlots, 2909);
  assert.equal(resources.fullResourceScope.omittedCombinations, 7);
  assert.equal(resources.fullResourceScope.omittedCombinationIdentitiesAvailable, false);
});

test("Table II distinguishes absent records, preserved archived timing and updated SVO component sums", () => {
  assert.equal(resources.tableII.rows.length, 8);
  const cells = resources.tableII.rows.flatMap((row) => Object.values(row.cells));
  assert.equal(cells.length, 48);
  assert.equal(cells.filter((measurement) => measurement.value === null).length, 4);
  for (const measurement of cells) {
    assert.equal(measurement.installedArtifactId, "paper/table-ii.tex");
    if (measurement.value === null) {
      assert.equal(measurement.status, "absent_selected_condition");
      assert.equal(measurement.valueText, null);
      assert.equal(measurement.contributingRuns, 0);
      assert.ok(["—", "--", "\\textemdash", "\\textemdash{}"].includes(measurement.displayValue));
    } else assert.equal(measurement.value, Number(measurement.valueText));
    if (measurement.provenance === "approved_archive_cell") {
      assert.equal(measurement.sourceInputVariant, "standard");
      assert.equal(measurement.sourceRevision, null);
      assert.equal(measurement.sourceRecordId, null);
      assert.equal(measurement.archiveRecordedSha256, "20e547b78fc841921e0c08491ca6e2d9dc26916aa6f1646919663c8007f4b13b");
    }
    assert.equal(measurement.fullResourceComparison?.sameRunSetVerified ?? false, false);
  }
  for (const metric of ["desktop_time_ms", "orin_time_ratio", "nano_time_ratio"]) {
    const measurement = cell("Kimera-VIO", metric);
    assert.equal(measurement.provenance, "retained_previous_report_timing");
    assert.equal(measurement.status, "previous_report_retained_pending_timing_confirmation");
    assert.equal(measurement.contributingRuns, null);
    assert.equal(measurement.ratioUsesUnroundedMeans, metric === "desktop_time_ms" ? null : false);
    assert.equal(measurement.numeratorText, null);
    assert.equal(measurement.denominatorText, null);
  }
  for (const metric of ["desktop_time_ms", "orin_time_ratio", "desktop_cpu_percent", "orin_cpu_percent"]) {
    const measurement = cell("SVO Pro", metric);
    assert.equal(measurement.provenance, "updated_installed_cell_from_current_resource_source");
    assert.equal(measurement.sourceRevision, resourceRevision);
    assert.equal(measurement.sourceInputVariant, "unspecified");
    assert.equal(measurement.selectedRuns, 5);
    assert.equal(measurement.contributingRuns, null);
    assert.ok(resourceRecords.has(measurement.sourceRecordId));
  }
  assert.equal(cell("SVO Pro", "desktop_time_ms").status, "reported_component_sum");
  const svoRatio = cell("SVO Pro", "orin_time_ratio");
  assert.equal(svoRatio.status, "reported_component_sum_ratio");
  assert.equal(svoRatio.ratioUsesUnroundedMeans, false);
  assert.equal(svoRatio.displayValue, (Number(svoRatio.numeratorText) / Number(svoRatio.denominatorText)).toFixed(2));
});

test("four paper time-ratio displays retain unrounded means rather than recomputing from two-decimal resource tables", () => {
  const examples = [
    ["√VINS", "orin_time_ratio", "2.37", "2.36"],
    ["ROVIO", "orin_time_ratio", "3.41", "3.42"],
    ["OpenVINS", "nano_time_ratio", "5.48", "5.49"],
    ["VINS-Fusion", "nano_time_ratio", "4.16", "4.15"],
  ];
  for (const [system, metric, installed, roundedReport] of examples) {
    const measurement = cell(system, metric);
    assert.equal(measurement.displayValue, installed);
    assert.equal(measurement.ratioUsesUnroundedMeans, true);
    assert.equal(measurement.ratioBasis, "approved unrounded per-run-summary means");
    near(measurement.value, Number(measurement.numeratorText) / Number(measurement.denominatorText), 1e-14);
    assert.equal(measurement.value.toFixed(2), installed);
    const comparison = measurement.fullResourceComparison;
    const numerator = resourceRecords.get(comparison.recordId);
    const denominator = resourceRecords.get(comparison.desktopRecordId);
    assert.ok(numerator && denominator);
    assert.equal((numerator.nativeTotalMs / denominator.nativeTotalMs).toFixed(2), roundedReport);
    assert.equal(comparison.ratioFromRoundedSourceMeansDisplay, roundedReport);
    assert.equal(comparison.displayMatchesRatioFromRoundedSourceMeans, false);
    assert.equal(comparison.approvedComponentsRoundToCurrentReport, true);
    assert.equal(Number(measurement.numeratorText).toFixed(2), comparison.sourceValueText);
    assert.equal(Number(measurement.denominatorText).toFixed(2), comparison.desktopSourceValueText);
  }
});

test("metric-specific contributor exceptions remain separate from selected runs and CPU counts", () => {
  assert.equal(cell("ORB-SLAM3", "orin_time_ratio").selectedRuns, 5);
  assert.equal(cell("ORB-SLAM3", "orin_time_ratio").contributingRuns, 4);
  assert.equal(cell("ORB-SLAM3", "orin_time_ratio").denominatorContributingRuns, 5);
  assert.equal(cell("ORB-SLAM3", "orin_cpu_percent").contributingRuns, 5);
  assert.equal(cell("OKVIS2-X", "nano_time_ratio").selectedRuns, 5);
  assert.equal(cell("OKVIS2-X", "nano_time_ratio").contributingRuns, 4);
  assert.equal(cell("OKVIS2-X", "nano_time_ratio").denominatorContributingRuns, 5);
  assert.equal(cell("OKVIS2-X", "nano_cpu_percent").contributingRuns, 5);
  assert.ok(resources.figure3.points.every((point) => point.contributingRuns === null && point.contributingRunStatus === "not_reported_per_metric"));
});

test("alignment examples preserve distinct all-associated scope and identical 499/440-pose reference pairs", () => {
  assert.equal(alignment.protocol.benchmarkDriftValidAggregation, false);
  assert.equal(alignment.protocol.metricsRecomputedDuringExport, false);
  assert.equal(alignment.protocol.scope, "All associated poses, without trimming.");
  assert.equal(alignment.cases.length, 2);
  assert.equal(alignment.panels.length, 4);
  assert.deepEqual(alignment.cases.map((item) => [item.configurationId, item.datasetId, item.sequence, item.mode, item.run, item.associatedPoseCount]), [
    ["dm_vio", "uzh-fpv", "indoor_forward_5", "mono", "run1", 499],
    ["vins-fusion_monoimu", "aqualoc", "archaeo_sequence_2", "mono", "run1", 440],
  ]);
  for (const item of alignment.cases) {
    assert.equal(configurations.get(item.configurationId).mode, item.mode);
    const panels = item.panels.map((id) => alignment.panels.find((panel) => panel.id === id));
    assert.equal(panels.length, 2);
    for (const panel of panels) {
      assert.equal(panel.caseId, item.id);
      assert.equal(panel.associatedPoseCount, item.associatedPoseCount);
      assert.deepEqual(Object.keys(panel.associatedSamples.arrays), ["gt_t", "gt_pos", "gt_quat", "est_pos", "est_quat"]);
      for (const array of Object.values(panel.associatedSamples.arrays)) assert.equal(array.length, item.associatedPoseCount);
      assert.equal(panel.topView.rows.length, item.associatedPoseCount);
      assert.equal(panel.positionATE.state, "reported_RMSE_all_associated_poses");
      assert.equal(panel.orientationATE.state, "reported_RMSE_all_associated_poses");
    }
    for (const field of ["gt_t", "gt_pos", "gt_quat"]) assert.deepEqual(panels[0].associatedSamples.arrays[field], panels[1].associatedSamples.arrays[field]);
  }
  assert.deepEqual(alignment.panels.map((panel) => panel.alignment), ["SE(3)-R", "SE(3)", "SE(3)-R", "Sim(3)"]);
  assert.deepEqual(alignment.panels.map((panel) => panel.scale.fitted), [false, false, false, true]);
  assert.deepEqual(alignment.panels.map((panel) => panel.scale.value), [null, null, 1, 0.0013016088998384326]);
  assert.match(alignment.protocol.comparisonLimit, /not a scale-only comparison/);
});

test("alignment reported RMSEs and XY drawing samples independently agree with the complete associated arrays", () => {
  const rms = (values) => Math.sqrt(values.reduce((sum, value) => sum + value * value, 0) / values.length);
  const norm = (vector) => Math.hypot(...vector);
  for (const panel of alignment.panels) {
    const arrays = panel.associatedSamples.arrays;
    const positionErrors = arrays.gt_pos.map((reference, index) => norm(reference.map((coordinate, axis) => coordinate - arrays.est_pos[index][axis])));
    const orientationErrors = arrays.gt_quat.map((reference, index) => {
      const estimate = arrays.est_quat[index];
      const dot = reference.reduce((sum, value, axis) => sum + value * estimate[axis], 0) / (norm(reference) * norm(estimate));
      return 2 * Math.acos(Math.min(1, Math.abs(dot))) * 180 / Math.PI;
    });
    near(rms(positionErrors), panel.positionATE.value, 1e-12);
    near(rms(orientationErrors), panel.orientationATE.value, 1e-9);
    assert.equal(panel.positionATE.value, Number(panel.positionATE.valueText));
    assert.equal(panel.orientationATE.value, Number(panel.orientationATE.valueText));
    assert.equal(panel.positionATE.unit, "m");
    assert.equal(panel.orientationATE.unit, "deg");
    assert.deepEqual(panel.topView.columns, ["timestamp_s", "gt_x_m", "gt_y_m", "estimate_x_m", "estimate_y_m"]);
    panel.topView.rows.forEach((row, index) => {
      const expected = [arrays.gt_t[index], arrays.gt_pos[index][0], arrays.gt_pos[index][1], arrays.est_pos[index][0], arrays.est_pos[index][1]];
      row.forEach((value, axis) => near(Number(value), expected[axis], 1e-11));
    });
  }
  const image = readFileSync(new URL(`../public/${alignment.figure.path}`, import.meta.url));
  assert.equal(createHash("sha256").update(image).digest("hex"), alignment.figure.sha256);
  assert.equal(alignment.provenance.sourceArtifacts.find((artifact) => artifact.id === "alignment/figure.svg").sha256, alignment.figure.sha256);
  assert.equal(alignment.provenance.sourceArtifacts.find((artifact) => artifact.id === "paper/figure-5.pdf").sha256, alignment.provenance.sourceArtifacts.find((artifact) => artifact.id === "alignment/figure.pdf").sha256);
});
