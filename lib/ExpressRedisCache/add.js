import util from 'util'
import { config } from '../../package.json';
import sizeOf from '../sizeof';

/**  Add
 *
 *  @function
 *  @description Add a new cache entry
 *  @return void
 *  @callback
 *  @arg {String} name - The cache entry name
 *  @arg {String} body - The cache entry body
 *  @arg {Object} options - Optional { type: String, expire: Number }
 *  @arg {Number} expire - The cache life time in seconds [OPTIONAL]
 *  @arg {Function} callback
 */

function add (name, body, options, callback) {
  var self = this;

  /** Adjust arguments in case @options is omitted **/
  if ( ! callback && (typeof options === 'function') ) {
    callback = options;
    options = {};
  }

  if (self.connected === false) {
    return callback(null, []); // simulate cache miss
  }

  /** The new cache entry **/
  var entry = {
    body: body,
    type: options.type || config.type,
    touched: +new Date(),
    expire: (typeof options.expire !== 'undefined' && options.expire !== false) ? options.expire : self.expire
  };

  var size = sizeOf(entry);

  var prefix = self.prefix.match(/:$/) ? self.prefix.replace(/:$/, '')
    : self.prefix;

  /* Save as a Redis hash */
  var redisKey = prefix + ':' + name;
  self.client.hmset(redisKey, entry,
    function (res) {
      var calculated_size = (size / 1024).toFixed(2);
      /** If @expire then tell Redis to expire **/
      if ( typeof entry.expire === 'number' && entry.expire > 0 ) {
        self.client.expire(redisKey, +entry.expire,
          function () {
            self.emit('message', util.format('SET %s ~%d Kb %d TTL (sec)', redisKey, calculated_size, +entry.expire));
            callback(null, name, entry, res);
          });
      }
      else
      {
        self.emit('message', util.format('SET %s ~%d Kb', redisKey, calculated_size));
        callback(null, name, entry, res);
      }
    });
}

export default add;