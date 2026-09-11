const fs = require('node:fs');
const yaml = require('js-yaml');
const { ensureRevision } = require('./upstream-data.cjs');
ensureRevision(yaml.load(fs.readFileSync('_config.yml', 'utf8')).upstream_revision);
