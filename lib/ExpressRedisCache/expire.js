module.exports = (function () {

  'use strict';

  // Convert HTTP status codes into 1xx, 2xx, 3xx, 4xx, 5xx
  function maskStatus (statusCode) {
    return String(statusCode).match(/(\d)\d\d/)[1] + 'xx';
  }

  // Turn the policy argument into a function that consumes a
  // status code and returns the expiration value
  function createExpirationPolicy (options) {
    if (typeof options !== 'object' && typeof options !== 'number') {
      throw new Error('expire option cannot be type ' + typeof options);
    }

    if ( typeof options === 'number' ) {
      options = {
        'xxx': options
      };
    }

    for (var k in options) {
      if (!k.match(/xxx/i) && !k.match(/[1-5]xx/i) && !k.match(/[1-5][0-9]{2}/)) {
        throw new Error('invalid statusCode ' + k);
      }
      if (typeof options[k] !== 'number') {
        throw new Error('invalid expiration for statusCode ' + k);
      }
      var v = options[k];
      delete options[v];
      options[k.toLowerCase()] = v;
    }

    if (!options.hasOwnProperty('xxx')) {
      throw new Error('no default expiration provided');
    }

    return function (statusCode) {
      if (options.hasOwnProperty(statusCode)) {
        return options[statusCode];
      }
      else if (options.hasOwnProperty(maskStatus(statusCode))) {
        return options[maskStatus(statusCode)];
      }
      else {
        return options.xxx;
      }
    };
  }

  return createExpirationPolicy;
})();