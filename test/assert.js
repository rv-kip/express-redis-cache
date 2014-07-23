/**

  Assert with a message
  #####################

  # Abstract

  Assert @assertion. Display @message in red if assert failed, in green otherwise


**/

var assert = require('assert');
var colors = require('colors');

module.exports = function (message, assertion) {
  try {
    assert(assertion);

    console.log(' ✓ %s'.green, message);
  }
  catch ( error ) {
    console.log(' × %s'.red, message, error);

    throw error;
  }
};