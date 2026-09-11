const fs = require('node:fs');
const yaml = require('js-yaml');
const { isDeepStrictEqual } = require('node:util');
const { UPSTREAM, key, git, readUpstream, enrichConferences, translateFilters, validateData } = require('./upstream-data.cjs');
const { monitorSources } = require('./source-monitor.cjs');
const load = file => yaml.load(fs.readFileSync(file, 'utf8'));
const writeYAML = (file, value) => fs.writeFileSync(file, yaml.dump(value, { lineWidth: 140, noRefs: true }));
const formatKST = value => new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Seoul', dateStyle: 'short', timeStyle: 'medium' }).format(new Date(value)) + ' KST';

async function main() {
  const now = new Date().toISOString();
  const current = load('_data/conferences.yml');
  const ai = load('_data/ai_conferences.yml');
  const filters = load('_data/filters.yml');
  const configText = fs.readFileSync('_config.yml', 'utf8');
  const config = yaml.load(configText);
  const previous = fs.existsSync('_data/updates.yml') ? load('_data/updates.yml') : {};
  const baselines = fs.existsSync('sources/cfp-baselines.json') ? JSON.parse(fs.readFileSync('sources/cfp-baselines.json', 'utf8')) : {};
  let merged = current;
  let upstream;
  try {
    git(['fetch', '--no-tags', '--depth=1', UPSTREAM, 'master']);
    const revision = git(['rev-parse', 'FETCH_HEAD']);
    const data = readUpstream(revision);
    const candidate = enrichConferences(data.conferences, current);
    const nextFilters = translateFilters(data.filters, filters);
    validateData([...candidate, ...ai], nextFilters);
    // Large removals indicate a schema/source problem and need review before publishing.
    if (candidate.length < current.length * 0.8) throw new Error('학회 수가 20% 넘게 감소하여 자동 반영을 보류했습니다.');
    const old = new Map(current.map(conf => [key(conf), conf]));
    const changed = candidate.filter(conf => !isDeepStrictEqual(old.get(key(conf)), conf)).length;
    const changedRevision = revision !== config.upstream_revision;
    if (changedRevision) {
      writeYAML('_data/conferences.yml', candidate);
      writeYAML('_data/filters.yml', nextFilters);
      const updated = git(['show', '-s', '--format=%cI', revision]).slice(0, 10);
      fs.writeFileSync('_config.yml', configText
        .replace(/^upstream_revision:.*$/m, `upstream_revision: "${revision}"`)
        .replace(/^upstream_updated:.*$/m, `upstream_updated: "${updated}"`));
    }
    merged = candidate;
    upstream = { status: changedRevision ? 'updated' : 'unchanged', revision, last_success: now, changed_entries: changed };
  } catch (error) {
    upstream = { status: 'error', revision: config.upstream_revision, error: String(error.message).slice(0, 240),
      ...(previous.upstream?.last_success ? { last_success: previous.upstream.last_success } : {}) };
  }
  const official = [...current, ...merged, ...ai].filter(conf => conf.cfp || conf.official_page).map(conf => ({
    name: `${conf.name} ${conf.year}`, url: conf.cfp || conf.official_page, kind: conf.cfp ? 'cfp' : 'announcement'
  }));
  const sources = [...new Map([...official, ...require('./official-homepages.json')].map(source => [source.url, source])).values()];
  const monitored = await monitorSources(sources, baselines, previous.sources || [], now);
  const report = {
    checked_at: now,
    checked_at_kst: formatKST(now),
    upstream,
    changed_count: monitored.reports.filter(source => source.status === 'changed' || source.changed_since).length,
    error_count: monitored.reports.filter(source => source.status === 'error').length + (upstream.status === 'error' ? 1 : 0),
    sources: monitored.reports.map(source => ({ ...source, ...(source.last_success ? { last_success_kst: formatKST(source.last_success) } : {}) }))
  };
  fs.mkdirSync('sources', { recursive: true });
  fs.writeFileSync('sources/cfp-baselines.json', JSON.stringify(monitored.baselines, null, 2) + '\n');
  writeYAML('_data/updates.yml', report);
  const summary = `## 학회 데이터 자동 점검\n\n점검: ${report.checked_at_kst}\n\n- 원본 동기화: ${upstream.status}\n- 공식 페이지 변경 검토 대기: ${report.changed_count}개\n- 접속 또는 검증 실패: ${report.error_count}개\n\nAI 마감일의 의미 검증일은 자동으로 갱신하지 않습니다. 변경 내용 검토 후 날짜를 수정하세요.\n\n` + monitored.reports.map(source => `- ${source.name}: **${source.status}** ([공식 출처](${source.url}))`).join('\n') + '\n';
  if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, summary);
  if (report.error_count) console.log(`::warning::${report.error_count}개 출처의 점검에 실패했습니다. 마지막 검증 데이터를 유지합니다.`);
  if (report.changed_count) console.log(`::warning::${report.changed_count}개 공식 페이지가 변경되어 내용 검토가 필요합니다.`);
  console.log(JSON.stringify({ upstream: upstream.status, sources: sources.length, changed: report.changed_count, errors: report.error_count }));
}
main().catch(error => { console.error(error); process.exitCode = 1; });
