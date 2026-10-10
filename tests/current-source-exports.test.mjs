import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = name => JSON.parse(readFileSync(new URL(`../public/data/${name}`, import.meta.url), 'utf8'));
const archive = read('current-source-tables.json');
const current = read('current-results.json');
const resources = read('current-efficiency.json');
const metadata = JSON.parse(readFileSync(new URL('../scripts/data/resource-metadata.json', import.meta.url), 'utf8'));
const privateContext = /\/Users\/|\/home\/|https?:\/\/|[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}|(?:api[_-]?key|access[_-]?token)\s*[:=]/;
const identity = r => [r.platform, r.dataset, r.sequence, r.system, r.mode, r.inputVariant].join('|');

test('retained trajectory tables preserve every selected row, sequence and Average cell', () => {
  assert.equal(archive.source.revision, current.release.sourceRevision);
  assert.equal(archive.tables.length, 94);
  assert.equal(new Set(archive.tables.map(t => t.id)).size, 94);
  assert.equal(archive.tables.reduce((n, t) => n + t.rows.length, 0), 1395);
  assert.equal(archive.tables.reduce((n, t) => n + t.columns.length * t.rows.length, 0), 7740);
  const expected = { euroc: 6, 'uzh-fpv': 20, aqualoc: 8, lamaria: 25, grandtour: 35 };
  for (const [id, count] of Object.entries(expected)) assert.equal(archive.tables.filter(t => t.datasetId === id).length, count);
  for (const table of archive.tables) {
    assert.equal(table.columns.at(-1), 'Average');
    assert.equal(new Set(table.columns).size, table.columns.length);
    assert.equal(new Set(table.rows.map(r => r.method)).size, table.rows.length);
    for (const row of table.rows) assert.equal(row.cells.length, table.columns.length);
  }
});

test('all reported RPE distances stay separate and replaced table families are absent', () => {
  for (const [length, count] of [[10, 21], [20, 20], [50, 16], [100, 16]]) {
    const tables = archive.tables.filter(t => t.metricFamily === 'RPE' && t.rpeLengthM === length);
    assert.equal(tables.length, count);
    assert.ok(tables.every(t => t.metric === `RPE (epa-drift valid), ${length} m`));
  }
  const sr = archive.tables.filter(t => t.metricFamily === 'SR');
  assert.equal(sr.length, 0);
  assert.equal(archive.tables.filter(t => t.protocol === 'epa-all').length, 0);
  assert.ok(archive.tables.every(t => t.sourceStatus === 'reported-source'));
  assert.equal(archive.tables.filter(t => t.metric === 'ATE (epa-drift valid)').length, 21);
});

test('approved normalized ATE/RPE sequence values match full raw source cells', () => {
  const cells = new Map();
  for (const table of archive.tables) for (const row of table.rows) table.columns.forEach((sequence, i) => {
    cells.set([table.datasetId, table.group, table.metric, row.method, sequence].join('|'), row.cells[i]);
  });
  for (const row of current.accuracy.sequences) {
    const key = [row.datasetId, row.group, 'ATE (epa-drift valid)', row.configurationId, row.sequence].join('|');
    if (row.missingStatus === 'absent_row') assert.equal(cells.has(key), false);
    else assert.equal(cells.get(key), row.raw);
  }
  for (const row of current.rpe10.sequences) {
    const key = [row.datasetId, row.group, 'RPE (epa-drift valid), 10 m', row.configurationId, row.sequence].join('|');
    assert.equal(cells.get(key), row.raw);
  }
});

test('current resource tables preserve every reviewed identity and timing definition', () => {
  assert.equal(resources.release.sourceRevision, '29a1fa93804899fac8bf17799b5bd101ae02d9a4');
  assert.notEqual(resources.release.sourceRevision, current.release.sourceRevision);
  assert.equal(resources.rows.length, 166);
  assert.deepEqual(resources.rows.map(identity).sort(), metadata.identities.map(identity).sort());
  assert.equal(new Set(resources.rows.map(r => r.sourceRecordId)).size, 166);
  assert.ok(resources.rows.every(r => r.sourceSelectedRuns === 5 && !r.selectedRunException));
  assert.deepEqual(resources.summary.platformCounts, { Desktop: 65, 'Jetson Orin': 59, 'Jetson Nano': 42 });
  const svo = resources.rows.filter(r => r.system === 'SVO Pro');
  assert.equal(svo.length, 20);
  for (const row of svo) {
    assert.equal(row.timingDefinition, 'frontend_plus_backend');
    assert.ok(Math.abs(row.nativeTotalMs - row.extendedMetrics.nativeTrackingMeanMs - row.extendedMetrics.nativeEstimationMeanMs) < 1e-10);
    assert.equal(row.extendedMetrics.nativeTotalMeanWithinRunPopulationSdMs, null);
    assert.equal(row.extendedMetricStatus.nativeTotalMeanWithinRunPopulationSdMs, 'source_dash');
  }
  assert.equal(resources.rows.filter(r => r.timingDefinition === 'reported_native_total').length, 146);
  const sample = resources.rows.find(r => r.system === 'SVO Pro' && r.platform === 'Jetson Nano' && r.mode === 'stereo' && r.dataset === 'GrandTour');
  assert.equal(sample.nativeTotalMs, 338.36);
  assert.equal(sample.reportedCpuPercent, 172.61);
  assert.equal(sample.sourceValues.reportedProcessMemoryMiB.valueText, '365.0');
  const aqualoc = resources.rows.find(r => r.system === 'SVO Pro' && r.platform === 'Jetson Nano' && r.dataset === 'AQUALOC');
  assert.equal(aqualoc.nativeTotalMs, 256.16);
  assert.equal(aqualoc.reportedCpuPercent, 115.8);
  assert.equal(aqualoc.reportedProcessMemoryMiB, 319.2);
});

test('all profiling statistics retain source precision and distinct missing states', () => {
  const counts = { reported: 0, source_dash: 0, column_absent: 0 };
  for (const row of resources.rows) {
    assert.equal(row.sourceRevision, resources.release.sourceRevision);
    assert.match(row.sourceEvidence.rowSha256, /^[a-f0-9]{64}$/);
    for (const field of Object.keys(resources.metricDefinitions)) {
      const primary = Object.hasOwn(row.metricStatus, field);
      const value = primary ? row[field] : row.extendedMetrics[field];
      const status = primary ? row.metricStatus[field] : row.extendedMetricStatus[field];
      const source = row.sourceValues[field];
      counts[status]++;
      if (status === 'reported') {
        assert.equal(value, Number(source.valueText));
        assert.equal(source.sourceStatus, 'reported');
      } else {
        assert.equal(value, null);
        assert.equal(source.valueText, '');
      }
      if (status === 'column_absent') {
        assert.notEqual(row.platform, 'Desktop');
        assert.ok(field.includes('Gpu'));
        assert.equal(source.sourceStatus, 'column_absent');
      }
      if (status === 'source_dash') assert.equal(source.sourceStatus, 'unavailable');
    }
  }
  assert.deepEqual(counts, { reported: 2331, source_dash: 578, column_absent: 909 });
});

test('public exports and neutral metadata contain no private context or prior measurements', () => {
  assert.doesNotMatch(JSON.stringify(archive), privateContext);
  assert.doesNotMatch(JSON.stringify(resources), privateContext);
  assert.doesNotMatch(JSON.stringify(metadata), privateContext);
  const keys = ['dataset', 'inputId', 'inputVariant', 'mode', 'platform', 'sequence', 'system', 'systemId'];
  for (const row of metadata.identities) assert.deepEqual(Object.keys(row).sort(), keys);
});
