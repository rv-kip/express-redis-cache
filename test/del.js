module.exports = function (cb) {

  var cache = this;

  var domain = require('domain').create();

  domain.on('error', function (error) {
    cb(error);
  });

  domain.run(function () {
    var assert = require('./assert');

    cache.del('test_2', domain.intercept(function (occ) {
      console.log();
      console.log(' Testing cache.del'.bold.blue);
      console.log();

      assert('it should be a number', ! isNaN(occ));

      cb();
    }));
  });
};