const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { execFileSync } = require('node:child_process');
const vm = require('node:vm');
const yaml = require('js-yaml');
const moment = require('moment-timezone');
const core = require('../static/js/deadlines-core.js');
const filters = yaml.load(fs.readFileSync('_data/filters.yml', 'utf8'));
const conferences = yaml.load(fs.readFileSync('_data/conferences.yml', 'utf8'));
const { upstream_revision: upstreamRevision } = yaml.load(fs.readFileSync('_config.yml', 'utf8'));
const definitions = Object.fromEntries(core.groups.map((group, i) => [group, filters[`filter${i + 1}`].map(item => ({ ...item, label: item.name_ko }))]));

test('AoE rolls over to the following day in Korea and preserves source moment', () => {
  const deadline = core.parseDeadline('2026-09-25 23:59', 2026);
  assert.equal(core.formatKST(deadline), '2026년 09월 26일 20:59:59 KST');
  assert.equal(deadline.tz(), 'Etc/GMT+12');
  assert.equal(deadline.toISOString(), '2026-09-26T11:59:59.000Z');
});
test('source zones, DST and upstream midnight adjustment are preserved', () => {
  assert.equal(core.formatKST(core.parseDeadline('2026-12-07 12:00', 2026, 'UTC')), '2026년 12월 07일 20:59:59 KST');
  assert.equal(core.formatKST(core.parseDeadline('2026-06-01 23:59', 2026, 'America/New_York')), '2026년 06월 02일 12:59:59 KST');
  assert.equal(core.formatKST(core.parseDeadline('2026-01-01 23:59', 2026, 'America/New_York')), '2026년 01월 02일 13:59:59 KST');
  assert.equal(core.formatKST(core.parseDeadline('2027-01-01 00:00', 2027, 'Asia/Seoul')), '2026년 12월 31일 23:59:59 KST');
});
test('template years, TBA, invalid dates and unknown zones', () => {
  assert.equal(core.parseDeadline('%Y-11-30 23:59', 2027).year(), 2026);
  assert.equal(core.parseDeadline('%y-01-28 23:59', 2027).year(), 2027);
  assert.equal(core.parseDeadline('TBA', 2027), null);
  assert.equal(core.parseDeadline('2026-02-31 23:59', 2026), null);
  assert.equal(core.parseDeadline('2026-02-10 23:59', 2026, 'invalid/zone'), null);
});
test('filter semantics are OR inside groups and AND between groups', () => {
  assert.equal(core.matchesFilters(['SEC', 'CONF', 'TOP4'], { domain: ['SEC', 'CRYPTO'], type: ['CONF'], rank: ['TOP4'] }), true);
  assert.equal(core.matchesFilters(['SEC', 'CONF'], { domain: ['SEC', 'CRYPTO'], type: ['SHOP'] }), false);
  assert.equal(core.matchesFilters(['CRYPTO', 'JRN'], { domain: ['SEC', 'CRYPTO'], type: ['JRN'] }), true);
  assert.equal(core.matchesFilters([], { domain: [], type: [], rank: [] }), true);
});
test('original, Korean and tag-based filter URLs restore only valid group members', () => {
  assert.deepEqual(core.readSelection('?domain=Security,Privacy&type=Conferences&rank=Security%20Top-4', definitions), { domain: ['SEC', 'PRIV'], type: ['CONF'], rank: ['TOP4'] });
  assert.deepEqual(core.readSelection('?domain=보안&type=워크숍&rank=CORE-A', definitions), { domain: ['SEC'], type: ['SHOP'], rank: ['CORE-A'] });
  assert.deepEqual(core.readSelection('?type=Security&rank=bogus', definitions), { domain: [], type: [], rank: [] });
  assert.deepEqual(core.readSelection('?domain=&type=&rank=', definitions), { domain: [], type: [], rank: [] });
  assert.equal(core.readSelection('?unrelated=1', definitions), null);
});
test('countdown boundary, ordering and unknown deadlines', () => {
  const now = Date.parse('2026-09-11T00:00:00Z');
  const soon = moment(now + 1000), later = moment(now + 2000), old = moment(now - 2000), recent = moment(now - 1000);
  assert.equal(core.countdown(soon, now), '0일 00시간 00분 01초 남음');
  assert.equal(core.countdown(soon, now + 1001), '마감됨');
  assert.equal(core.countdown(null, now), '추후 공지');
  assert.deepEqual([old, null, later, recent, soon].sort((a, b) => core.compareDeadlines(a, b, now)), [soon, later, recent, old, null]);
});
test('complete upstream data remains unchanged and every known deadline is valid', () => {
  const upstream = execFileSync('git', ['show', `${upstreamRevision}:_data/conferences.yml`], { encoding: 'utf8' });
  assert.deepEqual(conferences, yaml.load(upstream));
  const upstreamFilters = yaml.load(execFileSync('git', ['show', `${upstreamRevision}:_data/filters.yml`], { encoding: 'utf8' }));
  for (const key of Object.keys(upstreamFilters)) {
    assert.deepEqual(filters[key].map(({ name, tag }) => ({ name, tag })), upstreamFilters[key]);
    assert.ok(filters[key].every(item => item.name_ko));
  }
  for (const conference of conferences) {
    for (const raw of conference.deadline) {
      if (/^(TBA|TBD)$/.test(raw)) continue;
      assert.ok(core.parseDeadline(raw, conference.year, conference.timezone), `${conference.name} ${raw} must parse`);
    }
  }
});
test('vendored browser runtime yields the same KST date', () => {
  const context = vm.createContext({});
  for (const file of ['static/vendor/moment.min.js', 'static/vendor/moment-timezone-with-data.min.js', 'static/js/deadlines-core.js']) {
    vm.runInContext(fs.readFileSync(file, 'utf8'), context);
  }
  assert.equal(context.Deadlines.formatKST(context.Deadlines.parseDeadline('2026-09-25 23:59', 2026)), '2026년 09월 26일 20:59:59 KST');
});
test('KST output is independent of viewer timezone', () => {
  const expression = "const c=require('./static/js/deadlines-core.js');process.stdout.write(c.formatKST(c.parseDeadline('2026-09-25 23:59',2026)))";
  for (const zone of ['UTC', 'America/Los_Angeles', 'Europe/Paris', 'Asia/Seoul']) {
    assert.equal(execFileSync(process.execPath, ['-e', expression], { encoding: 'utf8', env: { ...process.env, TZ: zone } }), '2026년 09월 26일 20:59:59 KST');
  }
});
test('event dates and submission notes translate without converting local event dates', () => {
  assert.equal(core.localizeDate('June 30 - July 3'), '6월 30일 – 7월 3일');
  assert.equal(core.localizeDate('May 17-20'), '5월 17일–20일');
  assert.equal(core.localizeDate('June 2026'), '6월 2026');
  assert.equal(core.localizeDate('TBA'), '추후 공지');
  assert.equal(core.localizeComment('Co-located with ACSAC 2026'), 'ACSAC 2026와 함께 개최합니다.');
});
