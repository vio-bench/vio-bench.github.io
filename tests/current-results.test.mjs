import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const text = readFileSync(new URL('../public/data/current-results.json', import.meta.url), 'utf8');
const data = JSON.parse(text);
const key = (row, fields) => fields.map(field => row[field]).join('|');
const accuracyKey = ['configurationId', 'datasetId', 'metric'];
const srKey = ['configurationId', 'datasetId'];
const seqKey = [...srKey, 'group', 'sequence'];
const group = (rows, fields) => {
  const result = new Map();
  for (const row of rows) {
    const id = key(row, fields);
    if (!result.has(id)) result.set(id, []);
    result.get(id).push(row);
  }
  return result;
};
const near = (a, b) => assert.ok(Math.abs(a - b) < 1e-10, `${a} != ${b}`);

test('current snapshot preserves full reviewed coverage and separate provenance', () => {
  assert.equal(data.schemaVersion, 1);
  assert.equal(data.release.batch, '20260909_030015');
  assert.equal(data.configurations.length, 18);
  assert.equal(new Set(data.configurations.map(c => c.system)).size, 11);
  assert.equal(data.datasets.reduce((sum, d) => sum + d.sequenceCount, 0), 98);
  assert.equal(data.accuracy.aggregates.length, 180);
  assert.equal(data.rpe10.aggregates.length, 180);
  assert.equal(data.accuracy.sequences.length, 3528);
  assert.equal(data.rpe10.sequences.length, 2844);
  assert.equal(data.coverage.aggregates.length, 72);
  assert.equal(data.coverage.sequences.length, 1422);
  assert.equal(data.coverage.runs.length, 4266);
  assert.equal(data.sources.find(s => s.id === 'sr').revision, null);
  assert.equal(data.sources.find(s => s.id === 'ate').revision, data.release.sourceRevision);
  assert.equal(data.sources.find(s => s.id === 'rpe10').revision, data.release.sourceRevision);
  for (const source of data.sources) for (const file of source.files) assert.match(file.sha256, /^[a-f0-9]{64}$/);
});

for (const family of ['accuracy', 'rpe10']) test(`${family} summaries reconcile against exact finite sequence contributors`, () => {
  const source = data[family];
  const groups = group(source.sequences.filter(r => r.included), accuracyKey);
  const unique = new Set(source.sequences.map(row => key(row, [...accuracyKey, 'group', 'sequence'])));
  assert.equal(unique.size, source.sequences.length);
  assert.equal(source.aggregates.filter(r => r.value !== null).length, 140);
  for (const row of source.sequences) {
    assert.equal(row.included, row.value !== null);
    if (row.value !== null) assert.equal(row.value, Number(row.valueText));
    assert.equal(row.protocol, 'epa-drift valid');
    assert.equal(row.unit, row.metric === 'position_ate' || row.metric === 'translation_rpe' ? 'm' : 'deg');
    assert.ok(!row.source.file || /^source-[a-f0-9]{16}$/.test(row.source.file));
    if (family === 'rpe10') assert.equal(row.segmentLengthM, 10);
  }
  for (const row of source.aggregates) {
    const sequenceRows = groups.get(key(row, accuracyKey)) ?? [];
    if (row.n === null) {
      assert.equal(row.missingStatus, 'no_configuration_records');
      assert.equal(sequenceRows.length, 0);
    } else assert.equal(row.n, sequenceRows.length);
    const sequenceIds = sequenceRows.map(r => family === 'accuracy' ? `${r.group}/${r.sequence}` : r.sequence).sort();
    assert.deepEqual([...row.contributingSequences].sort(), sequenceIds);
    if (sequenceRows.length) {
      near(row.value, sequenceRows.reduce((sum, r) => sum + r.value, 0) / sequenceRows.length);
      assert.equal(row.value, Number(row.valueText));
    } else assert.equal(row.value, null);
  }
});

test('SR retains raw measurements, effective zeros, three slots and every status', () => {
  assert.equal(data.coverage.unit, '%');
  assert.deepEqual(data.coverage.range, [0, 100]);
  const counts = { valid: 0, missing: 0, invalid: 0 };
  let below75 = 0;
  let trueZeros = 0;
  const runs = group(data.coverage.runs, seqKey);
  const uniqueRunKeys = new Set();
  for (const row of data.coverage.runs) {
    assert.ok(Object.hasOwn(counts, row.status));
    counts[row.status]++;
    assert.ok(row.value >= 0 && row.value <= 100);
    assert.equal(row.value, Number(row.effectiveValueText));
    if (row.status === 'valid') {
      assert.equal(row.rawValue, row.value);
      assert.equal(row.rawValue, Number(row.rawValueText));
      if (row.value < 75) below75++;
      if (row.value === 0) trueZeros++;
    } else assert.equal(row.value, 0);
    uniqueRunKeys.add(key(row, [...seqKey, 'run']));
  }
  assert.equal(uniqueRunKeys.size, data.coverage.runs.length);
  assert.deepEqual(counts, { valid: 4072, missing: 182, invalid: 12 });
  assert.equal(below75, 892);
  assert.equal(trueZeros, 110);
  assert.equal(runs.size, data.coverage.sequences.length);
  for (const row of data.coverage.sequences) {
    const items = runs.get(key(row, seqKey));
    assert.deepEqual(items.map(r => r.run).sort(), ['run1', 'run2', 'run3']);
    assert.equal(row.expectedRuns, 3);
    near(row.value, items.reduce((sum, r) => sum + r.value, 0) / 3);
    for (const status of ['valid', 'missing', 'invalid']) assert.equal(row[`${status}Runs`], items.filter(r => r.status === status).length);
  }
  const sequences = group(data.coverage.sequences, srKey);
  for (const row of data.coverage.aggregates) {
    const items = sequences.get(key(row, srKey));
    assert.equal(items.length, row.sequenceCount);
    assert.equal(row.expectedRuns, row.sequenceCount * 3);
    near(row.value, items.reduce((sum, r) => sum + r.value, 0) / items.length);
    for (const status of ['valid', 'missing', 'invalid']) assert.equal(row[`${status}Runs`], items.reduce((sum, r) => sum + r[`${status}Runs`], 0));
  }
});

test('unreported combinations and independent metric contributor counts are retained', () => {
  const configurations = new Map(data.configurations.map(c => [c.id, c]));
  for (const row of data.coverage.aggregates) {
    assert.ok(configurations.has(row.configurationId));
    if (['aqualoc', 'lamaria'].includes(row.datasetId)) assert.equal(configurations.get(row.configurationId).mode, 'mono');
  }
  assert.equal(data.accuracy.aggregates.filter(r => r.missingStatus === 'no_configuration_records').length, 36);
  assert.equal(data.rpe10.aggregates.filter(r => r.missingStatus === 'no_configuration_records').length, 36);
  const count = (family, metric, configurationId, datasetId) => data[family].aggregates.find(r => r.metric === metric && r.configurationId === configurationId && r.datasetId === datasetId).n;
  assert.equal(count('accuracy', 'position_ate', 'rovio', 'aqualoc'), 12);
  assert.equal(count('rpe10', 'translation_rpe', 'rovio', 'aqualoc'), 10);
  assert.equal(count('accuracy', 'position_ate', 'okvis2x_mono', 'grandtour'), 30);
  assert.equal(count('rpe10', 'translation_rpe', 'okvis2x_mono', 'grandtour'), 29);
  assert.equal(data.protocols.accuracy.eligibilityThresholdPercent, 75);
  assert.equal(data.protocols.accuracy.rpeNormalizedByDistance, false);
});

test('public package excludes private filesystem and author context', () => {
  assert.doesNotMatch(text, /\/Users\/|\/home\/|https?:\/\/|[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}|(?:api[_-]?key|access[_-]?token)\s*[:=]/);
  for (const source of data.sources) for (const file of source.files) assert.doesNotMatch(file.name, /[/\\]/);
});
