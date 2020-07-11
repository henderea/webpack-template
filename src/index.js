require('./index.scss');
const $ = require('jquery');
// require('jquery-ui');
// const _ = require('lodash');
// const rand = require('lodash/random');

if(process.env.NODE_ENV === 'production') {
    const registerServiceWorker = require('@henderea/static-site-builder/registerServiceWorker');
    registerServiceWorker();
}