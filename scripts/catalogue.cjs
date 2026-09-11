const fs = require('node:fs');
const yaml = require('js-yaml');
const { key } = require('./upstream-data.cjs');

// Official forensic CFP records replace the same name/edition from upstream.
// Keep the upstream file intact so scheduled synchronization cannot erase corrections.
function combineCatalogue(upstream, ai, forensics) {
  const result = new Map();
  for (const group of [upstream, ai, forensics]) {
    const seen = new Set();
    for (const conf of group) {
      const id = key(conf);
      if (seen.has(id) || (result.has(id) && group !== forensics)) throw new Error(`중복 학회: ${id}`);
      if (group === forensics && (!conf.cfp || !conf.checked_on || !conf.tags.includes('FORENSICS'))) {
        throw new Error(`포렌식 공식 CFP 검증 정보 누락: ${id}`);
      }
      seen.add(id);
      result.set(id, conf);
    }
  }
  return [...result.values()];
}

function loadCatalogue() {
  const groups = ['conferences', 'ai_conferences', 'forensics_conferences'].map(name => yaml.load(fs.readFileSync(`_data/${name}.yml`, 'utf8')));
  return combineCatalogue(...groups);
}

module.exports = { combineCatalogue, loadCatalogue };
