var request = require('request');
var logger = require('./logger');
var methods = require('./api-methods');

function serializeObjToUri(obj) {
  return Object.keys(obj).map(function (key) {
    return key + '=' + encodeURIComponent(obj[key]);
  }).join('&');
}

function buildBasicAuthHeader(obj) {
  return 'Basic ' + new Buffer(obj.username + ':' + obj.password).toString('base64');
}

var Api = function (config) {
  this._protocol = config.protocol || 'http'; // or https
  this._auth = (config.basicAuth) ? buildBasicAuthHeader(config.basicAuth) : '';
  this._host = config.host || 'localhost';
  this._port = config.port || '12900';
  this._path = config.path || '';
  this._uri = this._protocol + '://' + this._host + ':' + this._port + this._path;
};

Object.keys(methods).forEach(function (mName) {

  var m = methods[mName];

  Api.prototype[mName] = function (parameters, path, callback) {

    if (arguments.length === 1) callback = parameters;
    if (arguments.length === 2) callback = path;

    var computedPath = m.path;
    if (typeof arguments[1] === 'object') {
      computedPath = m.path.replace(/{([^}]*)}/g, function (s, p) {
        return path[p];
      });
    }

    var reqUri = this._uri + computedPath;

    if (m.method === 'GET' && parameters) {
      reqUri = reqUri + '?' + serializeObjToUri(parameters);
    }

    var opts = {
      url: reqUri,
      method: m.method,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this._auth
      },
      body: (m.method !== 'GET' && parameters) ? parameters : null,
      json: false
    };

    request(opts, function (error, response, body) {
      logger.trace('DEBUG raw response from graylog: error: ' + JSON.stringify(error));
      if (error) {
        return callback([error, body]);
      }
      logger.trace('DEBUG raw response from graylog: body: ' + JSON.stringify(body));
      try {
        /*
        removeStream() will respond an empty body;
        we need a fallback to prevent JSON.parse(body) to fail
         */
        if (body === '')
          body = '{}';
        callback(null, JSON.parse(body));
      } catch (err) {
        callback(['Bad response', err, reqUri]);
      }
    });
  };

});

var connect = function (config, callback) {
  var that = new Api(config);
  return that;
};

connect.connect = connect; // backwards compatible
connect.Api = Api;
module.exports = connect;