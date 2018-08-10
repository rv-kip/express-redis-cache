import util from "util";
import async from "async";

/**  Delete cache entries by tag
 *
 *  @method ExpressRedisCache.delTag
 *  @description Delete entries by tag
 *  @return null
 *  @arg {String} name - The tag name
 *  @arg {Function} callback
 */

function delTag(name, callback) {
  let self = this;

  if (typeof name !== "string") {
    return this.emit(
      "error",
      new Error("ExpressRedisCache.delTag: missing first argument String")
    );
  }

  if (typeof callback !== "function") {
    return this.emit(
      "error",
      new Error("ExpressRedisCache.delTag: missing second argument Function")
    );
  }

  /** Get prefix */

  let prefix = self.prefix.match(/:$/)
    ? self.prefix.replace(/:$/, "")
    : self.prefix;

  /** Tell Redis to delete hash */

  let redisKey = `${prefix}:${name}`;

  self.client.smembers(redisKey, (err, deletions) => {
    deletions.push(redisKey);
    async.each(
      deletions,

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

        callback(null, deletions.length);
      }
    );
  });
}

export default delTag;
