/* Source and original filter rules: https://github.com/sec-deadlines/sec-deadlines.github.io */
(function () {
  'use strict';
  if (!window.moment || !window.Deadlines) {
    document.getElementById('load-error').hidden = false;
    return;
  }
  const core = window.Deadlines;
  const checkboxes = [...document.querySelectorAll('.filter-checkbox')];
  const definitions = Object.fromEntries(core.groups.map(group => [group, checkboxes
    .filter(input => input.dataset.group === group)
    .map(input => ({ tag: input.value, name: input.dataset.name, label: input.dataset.label }))]));
  const storageKey = 'sec-deadlines:ko:filters:' + window.location.pathname;
  const cards = [...document.querySelectorAll('.conf')].map(element => {
    const deadline = core.parseDeadline(element.dataset.deadline, element.dataset.year, element.dataset.timezone);
    const time = element.querySelector('.deadline-time');
    time.textContent = core.formatKST(deadline);
    if (deadline) time.dateTime = deadline.clone().tz(core.KST).format();
    else if (!/^(TBA|TBD)$/i.test(element.dataset.deadline)) {
      time.textContent = '마감일 확인 필요';
    }
    const eventDate = element.querySelector('.event-date');
    eventDate.textContent = core.localizeDate(eventDate.textContent);
    const comment = element.querySelector('.conf-comment');
    if (comment) {
      comment.title = '원본 안내: ' + comment.textContent;
      comment.textContent = core.localizeComment(comment.textContent);
    }
    return { element, deadline, tags: element.dataset.tags.split(/\s+/), timer: element.querySelector('.timer'), past: false };
  });

  function selectionFromDOM() {
    return Object.fromEntries(core.groups.map(group => [group, checkboxes
      .filter(input => input.checked && input.dataset.group === group).map(input => input.value)]));
  }
  function saveSelection() {
    try { localStorage.setItem(storageKey, JSON.stringify(checkboxes.filter(input => input.checked).map(input => input.value))); }
    catch (_) { /* Filtering still works with browser storage disabled. */ }
  }
  function updateURL() {
    const url = new URL(window.location.href);
    for (const group of core.groups) {
      const names = checkboxes.filter(input => input.checked && input.dataset.group === group).map(input => input.dataset.name);
      if (names.length) url.searchParams.set(group, names.join(','));
      else url.searchParams.delete(group);
    }
    window.history.replaceState(null, '', url.pathname + url.search + url.hash);
  }
  function applyFilters() {
    const selected = selectionFromDOM();
    let visible = 0;
    let upcoming = 0;
    for (const card of cards) {
      card.element.hidden = !core.matchesFilters(card.tags, selected);
      if (!card.element.hidden) {
        visible++;
        if (card.deadline && !card.past) upcoming++;
      }
    }
    document.getElementById('result-count').textContent = visible + '개 마감일 · 예정 ' + upcoming + '개';
    document.getElementById('empty-state').hidden = visible !== 0;
  }
  function reorder(now) {
    cards.sort((a, b) => core.compareDeadlines(a.deadline, b.deadline, now));
    const fragment = document.createDocumentFragment();
    for (const card of cards) fragment.append(card.element);
    document.querySelector('.conf-container').append(fragment);
  }
  function tick() {
    const now = Date.now();
    const clock = document.getElementById('korea-clock');
    clock.textContent = moment(now).tz(core.KST).format('YYYY.MM.DD HH:mm:ss');
    clock.dateTime = moment(now).tz(core.KST).format();
    let changed = false;
    for (const card of cards) {
      card.timer.textContent = core.countdown(card.deadline, now);
      const past = Boolean(card.deadline && card.deadline.valueOf() < now);
      if (past !== card.past) changed = true;
      card.past = past;
      card.element.classList.toggle('past', past);
    }
    if (changed) {
      reorder(now);
      applyFilters();
    }
  }

  const urlSelection = core.readSelection(window.location.search, definitions);
  let initialTags = [];
  if (urlSelection) initialTags = Object.values(urlSelection).flat();
  else {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey));
      if (Array.isArray(saved)) initialTags = saved;
    } catch (_) { /* Ignore corrupt or unavailable local storage. */ }
  }
  for (const input of checkboxes) input.checked = initialTags.includes(input.value);
  for (const fieldset of document.querySelectorAll('#filter-form fieldset')) fieldset.disabled = false;
  const reset = document.getElementById('reset-filters');
  reset.disabled = false;
  document.getElementById('filter-form').addEventListener('submit', event => event.preventDefault());
  document.getElementById('filter-form').addEventListener('change', () => {
    saveSelection();
    applyFilters();
    updateURL();
  });
  reset.addEventListener('click', () => {
    for (const input of checkboxes) input.checked = false;
    saveSelection();
    applyFilters();
    updateURL();
  });
  reorder(Date.now());
  tick();
  applyFilters();
  saveSelection();
  updateURL();
  setInterval(tick, 1000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) tick(); });
})();
