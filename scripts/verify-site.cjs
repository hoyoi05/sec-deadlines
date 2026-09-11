const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const yaml = require('js-yaml');
const root = process.argv[2] || '_site';
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const attribution = fs.readFileSync(path.join(root, 'attribution.html'), 'utf8');
const conferences = ['conferences', 'ai_conferences'].flatMap(name => yaml.load(fs.readFileSync(`_data/${name}.yml`, 'utf8')));
const filterCount = Object.values(yaml.load(fs.readFileSync('_data/filters.yml', 'utf8'))).flat().length;
const count = conferences.reduce((total, conference) => total + conference.deadline.length, 0);
assert.equal((html.match(/class="conf"/g) || []).length, count);
assert.equal((html.match(/class="filter-checkbox"/g) || []).length, filterCount);
assert.ok(html.includes('id="AI-checkbox"'));
assert.ok(html.includes('공식 CFP'));
assert.ok(html.includes('학회 확정(Commitment)'));
assert.ok(html.includes('초록 등록 필수'));
const articles = [...html.matchAll(/<article\b[\s\S]*?<\/article>/g)].map(match => match[0]);
for (const conf of conferences.filter(conf => conf.cfp)) {
  assert.equal(articles.filter(article => article.includes(`href="${conf.cfp}"`)).length, conf.deadline.length, `${conf.name} needs a direct CFP source on every deadline`);
}
const sais = articles.find(article => article.includes('id="sais2027-0"'));
assert.ok(sais.includes('공식 발표 날짜: 2027-02-04'));
assert.ok(sais.includes('data-deadline-status="date_only"'));
assert.ok(!sais.includes('원본 마감일: 2027-02-04 23:59'), 'Unverified times must not be presented as official');
assert.ok(html.includes('<html lang="ko">'));
assert.ok(html.includes('대한민국 표준시'));
assert.ok(html.includes('원본 소스'));
assert.ok(attribution.includes('별도 LICENSE 파일이 없습니다'));
assert.ok(!html.includes('{%') && !html.includes('{{'));
assert.ok(!html.includes('google-analytics') && !html.includes('platform.twitter.com'));
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
assert.equal(new Set(ids).size, ids.length, 'Every rendered DOM ID must be unique');
for (const doc of [html, attribution]) {
  for (const [, url] of doc.matchAll(/(?:src|href)="(\/sec-deadlines\/[^"#?]*)"/g)) {
    const relative = url.slice('/sec-deadlines/'.length) || 'index.html';
    assert.ok(fs.existsSync(path.join(root, decodeURIComponent(relative))), `Missing asset: ${url}`);
  }
}
console.log(`Verified ${count} deadline cards, ${filterCount} filters, official CFP sources, Korean markup, attribution and local assets.`);
