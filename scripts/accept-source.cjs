// Run only after checking the changed official page and updating the relevant dates.
const fs = require('node:fs');
const { fetchPage, fingerprint } = require('./source-monitor.cjs');
(async () => {
  const url = process.argv[2];
  const file = 'sources/cfp-baselines.json';
  const baselines = JSON.parse(fs.readFileSync(file, 'utf8'));
  if (!Object.hasOwn(baselines, url)) throw new Error('점검 중인 정확한 공식 URL을 지정하세요.');
  baselines[url] = { hash: fingerprint(await fetchPage(url)), recorded_at: new Date().toISOString() };
  fs.writeFileSync(file, JSON.stringify(baselines, null, 2) + '\n');
  console.log('검토한 공식 페이지를 비교 기준으로 저장했습니다. 날짜와 checked_on 수정도 함께 커밋하세요.');
})().catch(error => { console.error(error.message); process.exitCode = 1; });
