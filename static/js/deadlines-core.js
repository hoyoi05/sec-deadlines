/* Korean presentation of sec-deadlines. Upstream data and filter semantics:
 * https://github.com/sec-deadlines/sec-deadlines.github.io
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('moment-timezone'));
  else root.Deadlines = factory(root.moment);
})(typeof globalThis !== 'undefined' ? globalThis : this, function (moment) {
  'use strict';
  const KST = 'Asia/Seoul';
  const groups = ['domain', 'type', 'rank'];

  function parseDeadline(raw, year, zone = 'Etc/GMT+12') {
    if (!raw || /^(TBA|TBD)$/i.test(raw.trim())) return null;
    if (!moment.tz.zone(zone)) return null;
    const expanded = raw.replace(/%y/g, year).replace(/%Y/g, Number(year) - 1);
    const parts = expanded.match(/^(\d{4})-(\d{1,2})-(\d{1,2})\s+(\d{1,2}):(\d{2})$/);
    if (!parts) return null;
    const normalized = `${parts[1]}-${parts[2].padStart(2, '0')}-${parts[3].padStart(2, '0')} ${parts[4].padStart(2, '0')}:${parts[5]}`;
    const date = moment.tz(normalized, 'YYYY-MM-DD HH:mm', true, zone);
    if (!date.isValid()) return null;
    // Preserve upstream's end-of-minute and midnight interpretation.
    if (date.minutes() === 0) date.subtract(1, 'second');
    if (date.minutes() === 59) date.seconds(59);
    return date;
  }

  function formatKST(date) {
    return date ? date.clone().tz(KST).format('YYYY년 MM월 DD일 HH:mm:ss [KST]') : '추후 공지';
  }

  function countdown(date, now = Date.now()) {
    if (!date) return '추후 공지';
    const remaining = date.valueOf() - now;
    if (remaining < 0) return '마감됨';
    const seconds = Math.ceil(remaining / 1000);
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor(seconds % 86400 / 3600);
    const minutes = Math.floor(seconds % 3600 / 60);
    return `${days}일 ${String(hours).padStart(2, '0')}시간 ${String(minutes).padStart(2, '0')}분 ${String(seconds % 60).padStart(2, '0')}초 남음`;
  }

  function matchesFilters(tags, selected) {
    // OR inside each upstream group, AND across the three groups.
    return groups.every(group => !selected[group]?.length || selected[group].some(tag => tags.includes(tag)));
  }

  function compareDeadlines(a, b, now = Date.now()) {
    if (!a) return b ? 1 : 0;
    if (!b) return -1;
    const aPast = a.valueOf() < now;
    const bPast = b.valueOf() < now;
    if (aPast !== bPast) return aPast ? 1 : -1;
    return aPast ? b.valueOf() - a.valueOf() : a.valueOf() - b.valueOf();
  }

  function readSelection(search, definitions) {
    const params = new URLSearchParams(search);
    if (!groups.some(group => params.has(group))) return null;
    return Object.fromEntries(groups.map(group => {
      const names = (params.get(group) || '').split(',');
      const selected = definitions[group].filter(item => names.some(name => [item.name, item.label, item.tag].includes(name)));
      return [group, selected.map(item => item.tag)];
    }));
  }

  function localizeDate(text) {
    const months = { january: 1, jan: 1, february: 2, feb: 2, march: 3, mar: 3, april: 4, apr: 4, may: 5, june: 6, jun: 6, july: 7, jul: 7, august: 8, aug: 8, september: 9, sep: 9, sept: 9, october: 10, oct: 10, november: 11, nov: 11, december: 12, dec: 12 };
    return text.replace(/\b(TBA|TBD)\b/g, '추후 공지')
      .replace(/\b(\d+)(st|nd|rd|th)\b/g, '$1')
      .replace(/\b(January|Jan|February|Feb|March|Mar|April|Apr|May|June|Jun|July|Jul|August|Aug|September|Sept|Sep|October|Oct|November|Nov|December|Dec)\b\.?/gi, month => `${months[month.toLowerCase().replace('.', '')]}월`)
      .replace(/(\d+월)\s*(\d{1,2})(?!\d)(?:\s*[-–]\s*(\d{1,2})(?![\d월]))?/g, (_, month, first, last) => `${month} ${Number(first)}일${last ? `–${Number(last)}일` : ''}`)
      .replace(/\s+-\s+/g, ' – ');
  }

  function localizeComment(text) {
    const exact = {
      'Abstract registration required (1 week before deadline AoE).': '초록 사전 등록 필수: AoE 기준 제출 마감 1주 전.',
      'Rolling deadline every quarter': '분기마다 정기적으로 제출을 받습니다.',
      'Abstract and title registration required by September 18, 2026 (AoE).': '초록 및 제목 사전 등록 필수: 2026년 9월 18일(AoE 기준).',
      'Mandatory abstract submission deadline January 8, 2027 (AoE).': '초록 제출 필수: 2027년 1월 8일(AoE 기준).',
      'Paper registration due May 5th AoE': '논문 사전 등록 마감: 5월 5일(AoE 기준).',
      'Extended submission deadline May 16th 23:59 AoE': '연장된 제출 마감: 5월 16일 23:59(AoE 기준).',
      'Abstract registration required (May 20 AoE).': '초록 사전 등록 필수: 5월 20일(AoE 기준).',
      'Initial submission with abstract required Oct 31st.': '초록을 포함한 최초 제출 필수: 10월 31일.',
      'Abstract submission. Once accepted, full papers due July 30.': '초록 제출 후 채택되면 7월 30일까지 전체 논문을 제출해야 합니다.',
      'Co-located with USENIX Security; up-and-coming track deadline is Mar 3 (cycle-2)': 'USENIX Security와 함께 개최. Up-and-coming 트랙 2차 마감: 3월 3일.',
      'Co-located with CIFRIS. Paper registration due Jul 25 AoE': 'CIFRIS와 함께 개최. 논문 사전 등록 마감: 7월 25일(AoE 기준).'
    };
    const source = text.trim();
    if (exact[source]) return exact[source];
    const shared = source.match(/^(?:Co-?located with|Collocated with|In conjunction with)\s+(.+?)\.?$/i);
    if (shared) return `${shared[1]}와 함께 개최합니다.`;
    return localizeDate(source);
  }

  return { KST, groups, parseDeadline, formatKST, countdown, matchesFilters, compareDeadlines, readSelection, localizeDate, localizeComment };
});
