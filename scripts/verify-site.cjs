const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const yaml = require('js-yaml');
const root = process.argv[2] || '_site';
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const attribution = fs.readFileSync(path.join(root, 'attribution.html'), 'utf8');
const conferences = yaml.load(fs.readFileSync('_data/conferences.yml', 'utf8'));
const count = conferences.reduce((total, conference) => total + conference.deadline.length, 0);
assert.equal((html.match(/class="conf"/g) || []).length, count);
assert.equal((html.match(/class="filter-checkbox"/g) || []).length, 12);
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
console.log(`Verified ${count} deadline cards, 12 filters, Korean markup, attribution and local assets.`);
