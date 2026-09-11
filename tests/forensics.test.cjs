const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const yaml = require('js-yaml');
const core = require('../static/js/deadlines-core.js');
const { combineCatalogue, loadCatalogue } = require('../scripts/catalogue.cjs');
const { enrichConferences, translateFilters, validateData } = require('../scripts/upstream-data.cjs');
const { fingerprint, fetchPage, assessSource } = require('../scripts/source-monitor.cjs');
const forensics = yaml.load(fs.readFileSync('_data/forensics_conferences.yml', 'utf8'));
const filters = yaml.load(fs.readFileSync('_data/filters.yml', 'utf8'));

test('official forensic corrections survive upstream refresh without overwriting the source', () => {
  const correction = forensics.find(conf => conf.name === 'IMF');
  const original = { ...correction, deadline: ['2025-04-20 23:59'], tags: ['SEC', 'CONF', 'OTHERS'] };
  delete original.cfp;
  delete original.checked_on;
  const snapshot = structuredClone(original);
  const upstream = enrichConferences([original], [original]);
  assert.deepEqual(combineCatalogue(upstream, [], [correction])[0], correction);
  assert.deepEqual(original, snapshot);
  const nextEdition = enrichConferences([{ ...original, year: 2027 }], [original]);
  assert.ok(nextEdition[0].tags.includes('FORENSICS'));
  const merged = combineCatalogue(nextEdition, [], [correction]);
  assert.equal(merged.length, 2);
  assert.equal(merged.find(conf => conf.year === 2027).cfp, undefined);
  assert.throws(() => combineCatalogue([], [], [correction, correction]), /중복/);
  assert.throws(() => combineCatalogue([original], [original], []), /중복/);
  assert.throws(() => combineCatalogue([original], [], [{ ...correction, cfp: undefined }]), /검증 정보/);
});

test('forensic CFP dates, stages and prerequisites have complete provenance', () => {
  const catalogue = loadCatalogue();
  validateData(catalogue, filters);
  for (const conf of forensics) {
    assert.equal(new URL(conf.cfp).protocol, 'https:');
    assert.match(conf.checked_on, /^\d{4}-\d{2}-\d{2}$/);
    assert.ok(conf.tags.includes('FORENSICS'));
    assert.equal(conf.deadline_labels.length, conf.deadline.length);
    assert.equal(catalogue.filter(item => item.name === conf.name && item.year === conf.year).length, 1);
    if (conf.deadline_status === 'date_only') {
      assert.equal(conf.timezone, undefined);
      for (const raw of conf.deadline) assert.equal(core.parseDeadline(raw, conf.year, conf.timezone, conf.deadline_status), null);
      const dates = conf.announced_deadlines || [conf.announced_deadline];
      assert.equal(dates.length, conf.deadline.length);
      assert.throws(() => validateData([{ ...conf, announced_deadline: '2026-02-31', announced_deadlines: undefined }], filters), /날짜 오류/);
    } else {
      assert.ok(conf.timezone, `${conf.name} needs an explicit confirmed timezone`);
      for (const [i, raw] of (conf.registration_deadline || []).entries()) {
        assert.ok(core.parseDeadline(raw, conf.year, conf.timezone).isSameOrBefore(core.parseDeadline(conf.deadline[i], conf.year, conf.timezone)));
      }
    }
  }
  assert.equal(core.formatKST(core.parseDeadline('2026-05-04 23:59', 2026, 'Etc/UTC')), '2026년 05월 05일 08:59:59 KST');
  assert.equal(core.formatKST(core.parseDeadline('2026-11-12 23:59', 2027, 'Etc/GMT+12')), '2026년 11월 13일 20:59:59 KST');
});

test('digital forensics filters persist after sync and combine with publication/rank filters', () => {
  const original = structuredClone(filters);
  original.filter1 = original.filter1.filter(item => !['AI', 'FORENSICS'].includes(item.tag));
  const updated = translateFilters(original, filters);
  assert.deepEqual(updated.filter1.find(item => item.tag === 'FORENSICS'), { name: 'Digital Forensics', name_ko: '디지털포렌식', tag: 'FORENSICS' });
  const definitions = Object.fromEntries(core.groups.map((group, i) => [group, updated[`filter${i + 1}`].map(item => ({ ...item, label: item.name_ko }))]));
  for (const name of ['Digital+Forensics', '디지털포렌식', 'FORENSICS']) {
    assert.deepEqual(core.readSelection(`?domain=${name}`, definitions), { domain: ['FORENSICS'], type: [], rank: [] });
  }
  assert.ok(core.matchesFilters(['SEC', 'FORENSICS', 'SHOP'], { domain: ['FORENSICS'], type: ['SHOP'] }));
  assert.equal(core.matchesFilters(['SEC', 'FORENSICS', 'CONF'], { domain: ['FORENSICS'], rank: ['TOP4'] }), false);
});

test('PDF CFP monitoring detects file changes and rejects an HTML error disguised as a PDF', async () => {
  const pdf = Buffer.from('%PDF-1.7\n' + 'Official CFP deadline 2026-10-10\n'.repeat(10) + '%%EOF');
  const response = await fetchPage('https://example.org/cfp.pdf', async () => new Response(pdf, { headers: { 'content-type': 'application/pdf' } }));
  assert.ok(Buffer.isBuffer(response));
  assert.equal(fingerprint(response), fingerprint(pdf));
  const source = { name: 'PDF CFP', url: 'https://example.org/cfp.pdf', kind: 'cfp' };
  const first = assessSource(source, response, undefined, undefined, '2026-09-11');
  const changed = assessSource(source, Buffer.from(pdf.toString().replaceAll('2026-10-10', '2026-10-17')), first.baseline, first.report, '2026-09-12');
  assert.equal(changed.report.status, 'changed');
  assert.equal(changed.baseline.hash, first.baseline.hash);
  assert.throws(() => fingerprint(Buffer.from('<html>Access denied</html>'.repeat(10))), /PDF/);
  await assert.rejects(fetchPage(source.url, async () => new Response('wrong type', { headers: { 'content-type': 'application/json' } })), /HTML 또는 PDF/);
});

test('production prepares the same catalogue used for preview and rendering validation', () => {
  const pages = yaml.load(fs.readFileSync('.github/workflows/pages.yml', 'utf8'));
  const steps = pages.jobs.build.steps;
  const prepare = steps.findIndex(step => step.run === 'npm run prepare:catalogue');
  const build = steps.findIndex(step => step.name === 'Build with Jekyll');
  assert.ok(prepare > 0 && prepare < build);
  assert.ok(fs.readFileSync('index.html', 'utf8').includes('site.data.catalogue'));
});
