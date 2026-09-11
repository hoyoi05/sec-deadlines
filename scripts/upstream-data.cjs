const { execFileSync } = require('node:child_process');
const yaml = require('js-yaml');
const core = require('../static/js/deadlines-core.js');
const UPSTREAM = 'https://github.com/sec-deadlines/sec-deadlines.github.io.git';
const AI_NAMES = ['SAIS', 'SaTML', 'TRUST-AI', 'AIHWS', 'AIoTS', 'SiMLA', 'AISec', 'ARTMAN', 'LAST-X', 'SECAI', 'FL', 'WAITI', 'AI-SS', 'SAFE-EDGE', 'QCLLM', 'AI&CCPS', 'AgentCy', 'SAFE-ML', 'AICyDef', 'AIDC'];
const FORENSICS_NAMES = ['DFC Europe', 'DFRWS EU', 'DFRWS USA', 'DFRWS APAC', 'DFC USA', 'DFC APAC', 'IFIP WG 11.9', 'ICDF2C', 'DFDS', 'ISDFS', 'IMF', 'WSDF', 'WIFS'];
const LOCAL_FIELDS = ['cfp', 'checked_on', 'registration_deadline', 'registration_label', 'official_page', 'deadline_status', 'announced_deadline', 'source_note'];
const key = conf => `${conf.name} ${conf.year}`;
function git(args) { return execFileSync('git', args, { encoding: 'utf8', timeout: 120000, maxBuffer: 10_000_000 }).trim(); }
function ensureRevision(revision) {
  if (!/^[a-f0-9]{40}$/.test(revision)) throw new Error('Invalid upstream revision');
  try { git(['cat-file', '-e', `${revision}^{commit}`]); }
  catch (_) { git(['fetch', '--no-tags', '--depth=1', UPSTREAM, revision]); }
}
function readUpstream(revision) {
  return {
    conferences: yaml.load(git(['show', `${revision}:_data/conferences.yml`])),
    filters: yaml.load(git(['show', `${revision}:_data/filters.yml`]))
  };
}
function enrichConferences(upstream, current) {
  const previous = new Map(current.map(conf => [key(conf), conf]));
  return upstream.map(conf => {
    const old = previous.get(key(conf));
    const result = { ...conf, tags: [...conf.tags] };
    if (AI_NAMES.includes(conf.name) && !result.tags.includes('AI')) result.tags.push('AI');
    if (FORENSICS_NAMES.includes(conf.name) && !result.tags.includes('FORENSICS')) result.tags.push('FORENSICS');
    // Verification of an older cutoff must not be attached to a changed cutoff.
    if (old && JSON.stringify(old.deadline) === JSON.stringify(conf.deadline)
      && (old.timezone || 'Etc/GMT+12') === (conf.timezone || 'Etc/GMT+12')) {
      for (const field of LOCAL_FIELDS) if (Object.hasOwn(old, field)) result[field] = old[field];
    }
    return result;
  });
}
function translateFilters(upstream, current) {
  if (Object.keys(upstream).sort().join(',') !== 'filter1,filter2,filter3') throw new Error('원본 필터 그룹이 변경되어 검토가 필요합니다.');
  const translations = new Map(Object.values(current).flat().map(item => [item.tag, item.name_ko]));
  const result = Object.fromEntries(Object.entries(upstream).map(([group, items]) => [group, items.map(item => ({ ...item, name_ko: translations.get(item.tag) || item.name }))]));
  if (!result.filter1.some(item => item.tag === 'AI')) result.filter1.push({ name: 'AI', name_ko: 'AI (인공지능)', tag: 'AI' });
  if (!result.filter1.some(item => item.tag === 'FORENSICS')) result.filter1.push({ name: 'Digital Forensics', name_ko: '디지털포렌식', tag: 'FORENSICS' });
  return result;
}
function validateData(conferences, filters) {
  if (!Array.isArray(conferences) || !conferences.length) throw new Error('학회 데이터가 비어 있습니다.');
  const tags = new Set();
  for (const items of Object.values(filters)) {
    if (!Array.isArray(items) || !items.length) throw new Error('필터 정의가 비어 있습니다.');
    for (const item of items) {
      if (typeof item.name !== 'string' || !/^[A-Z][A-Z0-9-]*$/.test(item.tag) || tags.has(item.tag)) throw new Error('잘못된 태그 정의');
      tags.add(item.tag);
    }
  }
  const keys = new Set();
  for (const conf of conferences) {
    if (typeof conf.name !== 'string' || !conf.name.trim() || !Number.isInteger(conf.year) || !Array.isArray(conf.deadline) || !conf.deadline.length || !Array.isArray(conf.tags)) throw new Error('잘못된 학회 레코드');
    if (keys.has(key(conf))) throw new Error(`중복 학회: ${key(conf)}`);
    keys.add(key(conf));
    for (const field of ['link', 'dblp', 'cfp', 'official_page']) {
      if (conf[field] && !['http:', 'https:'].includes(new URL(conf[field]).protocol)) throw new Error(`허용하지 않는 링크: ${key(conf)}`);
    }
    for (const tag of conf.tags) if (!tags.has(tag)) throw new Error(`정의되지 않은 태그: ${tag}`);
    for (const deadline of [...conf.deadline, ...(conf.registration_deadline || [])]) {
      if (typeof deadline !== 'string' || (!/^(TBA|TBD)$/.test(deadline) && !core.parseDeadline(deadline, conf.year, conf.timezone))) throw new Error(`해석할 수 없는 마감일: ${key(conf)}`);
    }
    for (const field of ['registration_deadline', 'deadline_labels', 'announced_deadlines']) {
      if (conf[field] && conf[field].length !== conf.deadline.length) throw new Error(`제출 단계 배열 길이 불일치: ${key(conf)}`);
    }
    if (conf.deadline_status === 'date_only') {
      const dates = conf.announced_deadlines || [conf.announced_deadline];
      if (dates.length !== conf.deadline.length || dates.some(date => !/^\d{4}-\d{2}-\d{2}$/.test(date) || !core.parseDeadline(`${date} 23:59`, conf.year, 'Etc/UTC'))) throw new Error(`공식 발표 날짜 오류: ${key(conf)}`);
      if (!conf.cfp && !conf.official_page) throw new Error(`공식 날짜 출처 누락: ${key(conf)}`);
    }
  }
}
module.exports = { UPSTREAM, AI_NAMES, FORENSICS_NAMES, LOCAL_FIELDS, key, git, ensureRevision, readUpstream, enrichConferences, translateFilters, validateData };
