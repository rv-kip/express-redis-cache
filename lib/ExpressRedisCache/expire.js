module.exports = (function () {

  'use strict';

  // Convert HTTP status codes into 1xx, 2xx, 3xx, 4xx, 5xx
  function maskStatus (statusCode) {
    return String(statusCode).match(/(\d)\d\d/)[1] + 'xx';
  }

  // Turn the policy argument into a function that consumes a
  // status code and returns the expiration value
  function createExpirationPolicy (options) {
    if (typeof options !== 'object' && typeof options !== 'number' && typeof options !== 'function') {
      throw new Error('expire option cannot be type ' + typeof options);
    }

    // If what's passed in is a function, return the function.
    if ( typeof options === 'function' ) {
      return options;
    }

    // Internally store expiration as an object,
    // so if a number is provided, use that as the default
    if ( typeof options === 'number' ) {
      options = {
        'xxx': options
      };
    }

    for (var k in options) {
      // Ensure that keys are in the form xxx, 4xx, or 400
      if (!k.match(/xxx/i) && !k.match(/[1-5]xx/i) && !k.match(/[1-5][0-9]{2}/)) {
        throw new Error('invalid statusCode ' + k);
      }
      // Ensure that the expiration values are numbers
      if (typeof options[k] !== 'number') {
        throw new Error('invalid expiration for statusCode ' + k);
      }
      // Convert keys to lower case
      var v = options[k];
      delete options[v];
      options[k.toLowerCase()] = v;
    }

    // Ensure that there is a default so we can always return a value
    if (!options.hasOwnProperty('xxx')) {
      throw new Error('no default expiration provided');
    }

    return function (req, res) {
      var statusCode = res.statusCode;

      // Look for exact status code matches first
      if (options.hasOwnProperty(statusCode)) {
        return options[statusCode];
      }
      // Test for a 4xx style match
      else if (options.hasOwnProperty(maskStatus(statusCode))) {
        return options[maskStatus(statusCode)];
      }
      // Fallback to the default expiration value
      else {
        return options.xxx;
      }
    };
  }

  return createExpirationPolicy;
})();
