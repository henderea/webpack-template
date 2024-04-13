const fs = require('fs');

/*
 |--------------------------------------------------------------------------
 | Browser-sync config file
 |--------------------------------------------------------------------------
 |
 | For up-to-date information about the options:
 |   http://www.browsersync.io/docs/options/
 |
 | There are more options than you see here, these are just the ones that are
 | set internally. See the website for more info.
 |
 |
 */

function ensureInt(val, fallback) {
  if(!val) { return fallback; }
  const rv = parseInt(String(val));
  if(Number.isNaN(rv)) {
    return fallback;
  }
  return rv;
}

function flagFalse(flag) {
  return flag === false || flag === 'false' || flag === 0 || flag === '0';
}

const port = ensureInt(process.env.BS_PORT, 3000);

const uiPortFlag = process.env.BS_UI_PORT;

const noUi = flagFalse(uiPortFlag);

const ui = noUi ? false : { port: ensureInt(uiPortFlag, 3001) };

const openFlag = process.env.BS_OPEN;
const noOpen = flagFalse(openFlag);
const open = noOpen ? false : (openFlag || 'local');

const host = process.env.BS_HOST || null;

const httpsKey = process.env.BS_HTTPS_KEY;
const httpsCert = process.env.BS_HTTPS_CERT;

const https = (httpsKey && httpsCert && fs.existsSync(httpsKey) && fs.existsSync(httpsCert)) ? { key: httpsKey, cert: httpsCert } : undefined;

module.exports = {
  port,
  ui,
  files: ['build'],
  server: 'build',
  ghostMode: false,
  open,
  host,
  clientEvents: [],
  reloadOnRestart: true,
  https
};
