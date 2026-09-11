const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { execFileSync } = require('node:child_process');
const vm = require('node:vm');
const yaml = require('js-yaml');
const moment = require('moment-timezone');
const core = require('../static/js/deadlines-core.js');
const { AI_NAMES, LOCAL_FIELDS } = require('../scripts/upstream-data.cjs');
const filters = yaml.load(fs.readFileSync('_data/filters.yml', 'utf8'));
const conferences = yaml.load(fs.readFileSync('_data/conferences.yml', 'utf8'));
const aiConferences = yaml.load(fs.readFileSync('_data/ai_conferences.yml', 'utf8'));
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
  assert.equal(core.matchesFilters(['AI', 'CONF'], { domain: ['AI'], type: ['CONF'], rank: [] }), true);
  assert.equal(core.matchesFilters(['SEC', 'AI', 'SHOP'], { domain: ['AI'], type: ['CONF'] }), false);
  assert.equal(core.matchesFilters(['AI', 'CONF'], { domain: ['SEC', 'AI'], type: ['CONF'] }), true);
  assert.equal(core.matchesFilters(['AI', 'CONF'], { domain: ['AI'], rank: ['ASTAR'] }), false);
});
test('original, Korean and tag-based filter URLs restore only valid group members', () => {
  assert.deepEqual(core.readSelection('?domain=Security,Privacy&type=Conferences&rank=Security%20Top-4', definitions), { domain: ['SEC', 'PRIV'], type: ['CONF'], rank: ['TOP4'] });
  assert.deepEqual(core.readSelection('?domain=보안&type=워크숍&rank=CORE-A', definitions), { domain: ['SEC'], type: ['SHOP'], rank: ['CORE-A'] });
  assert.deepEqual(core.readSelection('?type=Security&rank=bogus', definitions), { domain: [], type: [], rank: [] });
  assert.deepEqual(core.readSelection('?domain=&type=&rank=', definitions), { domain: [], type: [], rank: [] });
  assert.equal(core.readSelection('?unrelated=1', definitions), null);
  assert.deepEqual(core.readSelection('?domain=AI,Security&type=Conferences', definitions), { domain: ['SEC', 'AI'], type: ['CONF'], rank: [] });
  assert.deepEqual(core.readSelection('?domain=AI%20(%EC%9D%B8%EA%B3%B5%EC%A7%80%EB%8A%A5)', definitions), { domain: ['AI'], type: [], rank: [] });
});
test('countdown boundary, ordering and unknown deadlines', () => {
  const now = Date.parse('2026-09-11T00:00:00Z');
  const soon = moment(now + 1000), later = moment(now + 2000), old = moment(now - 2000), recent = moment(now - 1000);
  assert.equal(core.countdown(soon, now), '0일 00시간 00분 01초 남음');
  assert.equal(core.countdown(soon, now + 1001), '마감됨');
  assert.equal(core.countdown(null, now), '추후 공지');
  assert.deepEqual([old, null, later, recent, soon].sort((a, b) => core.compareDeadlines(a, b, now)), [soon, later, recent, old, null]);
});
test('upstream records and filter rules remain intact apart from documented AI enrichment', () => {
  const upstream = execFileSync('git', ['show', `${upstreamRevision}:_data/conferences.yml`], { encoding: 'utf8' });
  const originals = yaml.load(upstream);
  const taggedNames = originals.filter(conf => AI_NAMES.includes(conf.name) || conf.tags.includes('AI')).map(conf => conf.name).sort();
  assert.deepEqual(conferences.filter(conf => conf.tags.includes('AI')).map(conf => conf.name).sort(), taggedNames);
  assert.deepEqual(conferences.map((conf, i) => {
    const result = { ...conf, tags: originals[i].tags.includes('AI') ? conf.tags : conf.tags.filter(tag => tag !== 'AI') };
    for (const field of LOCAL_FIELDS) if (!Object.hasOwn(originals[i], field)) delete result[field];
    return result;
  }), originals);
  const upstreamFilters = yaml.load(execFileSync('git', ['show', `${upstreamRevision}:_data/filters.yml`], { encoding: 'utf8' }));
  for (const key of Object.keys(upstreamFilters)) {
    assert.deepEqual(filters[key].filter(item => item.tag !== 'AI').map(({ name, tag }) => ({ name, tag })), upstreamFilters[key].filter(item => item.tag !== 'AI'));
    assert.ok(filters[key].every(item => item.name_ko));
  }
  assert.deepEqual(filters.filter1.find(item => item.tag === 'AI'), { name: 'AI', name_ko: 'AI (인공지능)', tag: 'AI' });
  for (const conference of [...conferences, ...aiConferences]) {
    for (const raw of conference.deadline) {
      if (/^(TBA|TBD)$/.test(raw)) continue;
      assert.ok(core.parseDeadline(raw, conference.year, conference.timezone), `${conference.name} ${raw} must parse`);
    }
  }
});
test('AI additions have explicit official sources, distinct stages and aligned registration deadlines', () => {
  assert.ok(aiConferences.length > 0);
  const keys = [...conferences, ...aiConferences].map(conf => `${conf.name} ${conf.year}`);
  assert.equal(new Set(keys).size, keys.length);
  for (const conf of aiConferences) {
    assert.equal(new URL(conf.cfp).protocol, 'https:');
    assert.match(conf.checked_on, /^\d{4}-\d{2}-\d{2}$/);
    assert.ok(conf.tags.includes('AI') && conf.tags.includes('CONF'));
    assert.ok(moment.tz.zone(conf.timezone));
    assert.equal(conf.deadline_labels.length, conf.deadline.length);
    if (conf.registration_deadline) {
      assert.equal(conf.registration_deadline.length, conf.deadline.length);
      for (const [i, raw] of conf.registration_deadline.entries()) {
        assert.ok(core.parseDeadline(raw, conf.year, conf.timezone).isBefore(core.parseDeadline(conf.deadline[i], conf.year, conf.timezone)), conf.name);
      }
    }
  }
  for (const name of ['ACL', 'EMNLP']) {
    assert.deepEqual(aiConferences.find(conf => conf.name === name).deadline_labels, ['ARR 논문 제출', '학회 확정(Commitment)']);
  }
  // Fixed conversion fixtures do not pin the live dataset to a particular edition.
  assert.equal(core.formatKST(core.parseDeadline('2026-09-18 23:59', 2027, 'Etc/GMT+12')), '2026년 09월 19일 20:59:59 KST');
  assert.equal(core.formatKST(core.parseDeadline('2026-11-16 23:59', 2027, 'Etc/GMT+12')), '2026년 11월 17일 20:59:59 KST');
});
test('a date-only official announcement never receives an assumed AoE countdown', () => {
  assert.equal(core.parseDeadline('2027-02-04 23:59', 2027, undefined, 'date_only'), null);
  for (const conf of conferences.filter(conf => conf.deadline_status === 'date_only')) {
    assert.match(conf.announced_deadline, /^\d{4}-\d{2}-\d{2}$/);
    assert.equal(core.parseDeadline(conf.deadline[0], conf.year, conf.timezone, conf.deadline_status), null);
    assert.ok(conf.official_page);
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
