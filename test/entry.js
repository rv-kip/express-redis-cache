/**

  Basic smoke test for object Entry
  #################################

  Assert an Entry Object


**/

module.exports = function (entry) {

  var assert = require('./assert');
  
  assert('first entry should have a body which is a text', typeof entry.body === 'string');
  
  assert('first entry should have a Unix timestamp number', /^\d+/.test(entry.touched));
  
  assert('first entry should have an expiration date', typeof entry.expire === 'number' || /^\d+/.test(entry.expire) || entry.expire === '-1');
  
  assert('first entry should have a name', typeof entry.name === 'string');
};