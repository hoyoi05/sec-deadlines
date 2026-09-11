const fs = require('node:fs');
const yaml = require('js-yaml');
const { loadCatalogue } = require('./catalogue.cjs');
const { validateData } = require('./upstream-data.cjs');
const catalogue = loadCatalogue();
validateData(catalogue, yaml.load(fs.readFileSync('_data/filters.yml', 'utf8')));
fs.writeFileSync('_data/catalogue.yml', yaml.dump(catalogue, { lineWidth: 140, noRefs: true }));
console.log(`Prepared ${catalogue.length} conference editions for Jekyll.`);
