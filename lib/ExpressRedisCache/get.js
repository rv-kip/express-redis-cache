import async from "async";
import util from "util";
import sizeOf from "../sizeof";

/**  Get
 *
 *  @function
 *  @return void
 *  @callback
 *  @arg {String} name - The cache entry name to get (wildcards accepted)
 *  @arg {Function} callback - Callback
 */

function get(name, callback) {
  let self = this;

  if (typeof name === "function") {
    callback = name;
    name = "*";
  }

  let prefix = self.prefix.match(/:$/)
    ? self.prefix.replace(/:$/, "")
    : self.prefix;

  let redisKey = `${prefix}:${name || "*"}`;

  /** Detect wildcard syntax */
  let hasWildcard = redisKey.indexOf("*") >= 0;

  let fetchKey = function(key, cb) {
    self.client.hgetall(key, (err, result) => {
      if (result) {
        let names = key.split(":");
        result.name = names[1];
        result.prefix = names[0];
        self.emit(
          "message",
          util.format("GET %s ~%d Kb", key, (sizeOf(result) / 1024).toFixed(2))
        );
      }
      cb(err, result);
    });
  };

  /** If has wildcard */

  if (hasWildcard) {
    /** Get a list of keys using the wildcard */

    self.client.keys(`${prefix}:${name}`, (err, keys) => {
      if (!keys.length) {
        callback(null, []);
        return;
      }

      async.parallel(
        keys.map(key => {
          return function(cb) {
            return fetchKey(key, cb);
          };
        }),
        (err, results) => {
          callback(null, results);
        }
      );
    });
  } else {
    /** No wildcard **/

    fetchKey(redisKey, (err, result) => {
      if (result) {
        callback(err, [result]);
      } else {
        callback(err, []);
      }
    });
  }
}

export default get;
