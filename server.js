//
// this file for supporting ES6 in nodejs files
// we require here a main server.js file - node server where we render application
//
require('babel-core/register');
['.css', '.less', '.sass', '.ttf', '.woff', '.woff2'].forEach((ext) => require.extensions[ext] = () => {});
require('babel-polyfill');
var scrapInit = require('./src/server.js');
scrapInit();
