'use strict'

var bunyan = require('bunyan'),
    common = require('./common-constants');

var logger = bunyan.createLogger({
    name: 'payments-trace',
    level: 'trace', 
    src: true
});

module.exports = logger;