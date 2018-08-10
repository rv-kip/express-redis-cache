import util from "util";
import async from "async";

/**  Delete cache entries
 *
 *  @method ExpressRedisCache.del
 *  @description Delete entry by name
 *  @return null
 *  @arg {String} name - The entry name
 *  @arg {Function} callback
 */

function del(name, callback) {
  let self = this;

  if (typeof name !== "string") {
    return this.emit(
      "error",
      new Error("ExpressRedisCache.del: missing first argument String")
    );
  }

  if (typeof callback !== "function") {
    return this.emit(
      "error",
      new Error("ExpressRedisCache.del: missing second argument Function")
    );
  }

  /** Get prefix */

  let prefix = self.prefix.match(/:$/)
    ? self.prefix.replace(/:$/, "")
    : self.prefix;

  /** Tell Redis to delete hash */

  let redisKey = `${prefix}:${name}`;

  /** Detect wilcard syntax */

  let hasWildcard = redisKey.indexOf("*") >= 0;

  /** If has wildcard */

  if (hasWildcard) {
    /** Get a list of keys using the wildcard */

    self.client.keys(redisKey, (err, keys) => {
      async.each(
        keys,

        (key, callback) => {
          self.client.del(key, () => {
            self.emit("message", util.format("DEL %s", key));
            callback();
          });
        },

        error => {
          if (error) {
            throw error;
          }

          callback(null, keys.length);
        }
      );
    });
  } else {
    /** No wildcard **/

    self.client.del(redisKey, (err, deletions) => {
      self.emit("message", util.format("DEL %s", redisKey));
      callback(null, +deletions);
    });
  }
}

export default del;
