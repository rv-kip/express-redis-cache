import async from "async";
import sizeOf from "../sizeof";

export default function(
  /* Function */ callback // Callback
) {
  /** set in /index.js **/
  let self = this;

  /** Tell Redis to fetch the keys name beginning by prefix **/
  self.client.keys(self.prefix + "*", (err, keys) => {
    let size = 0;

    async.parallel(
      /** for each keys **/

      keys.map(key => {
        return function(cb) {
          self.get(this.key.replace(new RegExp("^" + self.prefix), ""), cb);
        }.bind({ key: key });
      }),

      results => {
        results.forEach(result => {
          size += sizeOf(result);
        });

        callback(null, size);
      }
    );
  });
}
