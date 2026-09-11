const crypto = require('node:crypto');

// Compare readable page content, ignoring common navigation and executable assets.
// This detects document changes; it deliberately does not interpret them as new deadlines.
function normalizeHTML(html) {
  const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i);
  return (main ? main[1] : html)
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<(script|style|nav|header|footer|svg|head)\b[^>]*>[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&#(x[0-9a-f]+|\d+);/gi, (_, code) => {
      const point = code[0].toLowerCase() === 'x' ? parseInt(code.slice(1), 16) : Number(code);
      return point > 0 && point <= 0x10ffff ? String.fromCodePoint(point) : ' ';
    })
    .replace(/&(nbsp|amp|quot|apos|lt|gt);/gi, (_, name) => ({ nbsp: ' ', amp: '&', quot: '"', apos: "'", lt: '<', gt: '>' })[name.toLowerCase()])
    .normalize('NFKC').replace(/\s+/g, ' ').trim();
}

function fingerprint(html) {
  if (/<title[^>]*>\s*(?:just a moment|access denied|attention required)/i.test(html)) throw new Error('접근 확인 화면이 반환되었습니다.');
  const text = normalizeHTML(html);
  if (text.length < 150) throw new Error('본문이 너무 짧아 정상 CFP 응답인지 확인할 수 없습니다.');
  return crypto.createHash('sha256').update(text).digest('hex');
}

function assessSource(source, html, baseline, previous, now) {
  const hash = fingerprint(html);
  const changed = Boolean(baseline && baseline.hash !== hash);
  return {
    baseline: baseline || { hash, recorded_at: now },
    report: {
      ...source,
      status: !baseline ? 'baseline' : changed ? 'changed' : 'unchanged',
      last_success: now,
      content_hash: hash,
      ...(changed ? { changed_since: previous?.changed_since || now } : {})
    }
  };
}

async function fetchPage(url, fetcher = fetch) {
  const parsed = new URL(url);
  if (parsed.protocol !== 'https:') throw new Error('공식 HTTPS URL만 점검합니다.');
  const response = await fetcher(url, {
    signal: AbortSignal.timeout(20000),
    headers: { 'User-Agent': 'sec-deadlines-ko-source-monitor/1.0 (+https://github.com/hoyoi05/sec-deadlines)', Accept: 'text/html' }
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  if (!response.headers.get('content-type')?.includes('text/html')) throw new Error('HTML 페이지가 아닙니다.');
  if (Number(response.headers.get('content-length')) > 2_000_000) throw new Error('페이지 크기 제한 초과');
  // Bound streaming responses as well as Content-Length responses.
  const reader = response.body.getReader();
  const chunks = [];
  let size = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 2_000_000) throw new Error('페이지 크기 제한 초과');
      chunks.push(Buffer.from(value));
    }
  } finally { await reader.cancel().catch(() => {}); }
  return Buffer.concat(chunks).toString('utf8');
}

async function monitorSources(sources, baselines, previous, now, fetcher = fetchPage) {
  const updatedBaselines = { ...baselines };
  const reports = new Array(sources.length);
  let cursor = 0;
  async function worker() {
    while (cursor < sources.length) {
      const index = cursor++;
      const source = sources[index];
      const old = previous.find(item => item.url === source.url);
      try {
        const result = assessSource(source, await fetcher(source.url), baselines[source.url], old, now);
        updatedBaselines[source.url] = result.baseline;
        reports[index] = result.report;
      } catch (error) {
        reports[index] = { ...source, status: 'error', error: String(error.message).slice(0, 180),
          ...(old?.last_success ? { last_success: old.last_success } : {}),
          ...(old?.changed_since ? { changed_since: old.changed_since } : {}) };
      }
    }
  }
  await Promise.all([worker(), worker(), worker()]);
  return { baselines: updatedBaselines, reports };
}

module.exports = { normalizeHTML, fingerprint, assessSource, fetchPage, monitorSources };
