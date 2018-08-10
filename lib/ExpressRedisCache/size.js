import async from "async";
import sizeOf from "../sizeof";

export default function(
  /* Function */ callback // Callback
) {
  /** set in /index.js **/
  var self = this;

  /** Tell Redis to fetch the keys name beginning by prefix **/
  self.client.keys(self.prefix + "*", function(err, keys) {
    var size = 0;

    async.parallel(
      /** for each keys **/

      keys.map(function(key) {
        return function(cb) {
          self.get(this.key.replace(new RegExp("^" + self.prefix), ""), cb);
        }.bind({ key: key });
      }),

      function(results) {
        results.forEach(function(result) {
          size += sizeOf(result);
        });

        callback(null, size);
      }
    );
  });
}
