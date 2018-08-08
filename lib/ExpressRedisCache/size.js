/**

  cache.ls()
  ##########

  This script is supposed to be called via `index.js`

**/

export default function(
  /* Function */ callback // Callback
) {
  /** set in /index.js **/
  var self = this;

  /** Tell Redis to fetch the keys name beginning by prefix **/
  self.client.keys(self.prefix + "*", function(keys) {
    var size = 0;

    require("async").parallel(
      /** for each keys **/

      keys.map(function(key) {
        return function(cb) {
          self.get(this.key.replace(new RegExp("^" + self.prefix), ""), cb);
        }.bind({ key: key });
      }),

      function(results) {
        results.forEach(function(result) {
          size += require("../sizeof")(result);
        });

        callback(null, size);
      }
    );
  });
}
