var assert = require('assert');
var colors = require('colors');

module.exports = function (name, assertion) {
  try {
    assert(assertion);

    console.log(' ✓ %s'.green, name);
  }
  catch ( error ) {
    console.log(' × %s'.red, name, error);

    throw error;
  }
};