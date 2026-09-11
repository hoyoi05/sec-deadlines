// Liquid preview for UI inspection. The deployment is built by GitHub's Jekyll action.
const fs = require('node:fs');
const path = require('node:path');
const yaml = require('js-yaml');
const { Liquid } = require('liquidjs');
const engine = new Liquid();
engine.registerFilter('slugify', value => String(value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''));
const site = yaml.load(fs.readFileSync('_config.yml', 'utf8'));
site.data = Object.fromEntries(['conferences', 'ai_conferences', 'filters'].map(name => [name, yaml.load(fs.readFileSync(`_data/${name}.yml`, 'utf8'))]));
const out = path.join('.preview', site.baseurl.replace(/^\//, ''));
(async () => {
  fs.mkdirSync(out, { recursive: true });
  for (const file of ['index.html', 'attribution.html']) {
    const template = fs.readFileSync(file, 'utf8').replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n|^---\r?\n---\r?\n/, '');
    fs.writeFileSync(path.join(out, file), await engine.parseAndRender(template, { site }));
  }
  fs.cpSync('static', path.join(out, 'static'), { recursive: true });
  console.log(`Preview rendered at ${out}; production uses Jekyll.`);
})().catch(error => { console.error(error); process.exitCode = 1; });
