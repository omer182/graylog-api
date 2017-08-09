'use strict'

var bunyan = require('bunyan');

var logger = bunyan.createLogger({
    name: 'payments-trace',
    level: 'trace', 
    src: true
});

module.exports = logger;