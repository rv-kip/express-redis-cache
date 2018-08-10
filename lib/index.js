import { EventEmitter } from "events";
import redis from "redis";
import Get from "./ExpressRedisCache/get";
import Add from "./ExpressRedisCache/add";
import Del from "./ExpressRedisCache/del";
import DelTag from "./ExpressRedisCache/delTag";
import Route from "./ExpressRedisCache/route";
import Size from "./ExpressRedisCache/size";
import { config } from "../package.json";

/**  ExpressRedisCache
 *
 *  @class
 *  @description Main class
 *  @extends EventEmitter
 *  @arg {Object} options? - Options (view README)
 */

export default class ExpressRedisCache extends EventEmitter {
  constructor(options) {
    super(options);

    /** The request options
     *
     *  @type Object
     */

    this.options = options || {};

    /** The entry name prefix
     *
     *  @type String
     */

    this.prefix = this.options.prefix || config.prefix;

    /** The host to connect to (default host if null)
     *
     *  @type String
     */

    this.host = this.options.host || "localhost";

    /** The port to connect to (default port if null)
     *
     *  @type Number
     */

    this.port = this.options.port || "6379";

    /** The password of Redis server (optional)
     *
     *  @type String
     */
    this.auth_pass = this.options.auth_pass;

    /** An alias to disable expiration for a specific route
     *
     *  var cache = new ExpressRedisCache();
     *  cache.route('page', cache.FOREVER); // cache will not expire
     *
     *  @type number
     */

    this.FOREVER = -1;

    /** Set expiration time in seconds, default is -1 (No expire)
     *  @type number
     */

    this.expire = this.options.expire || this.FOREVER;

    /** Whether or not express-redis-cache is connected to Redis
     *
     *  @type Boolean
     */

    this.connected = false;

    /** The Redis Client
     *
     *  @type Object
     */

    this.client =
      this.options.client ||
      redis.createClient(this.port, this.host, { auth_pass: this.auth_pass });

    /** If client can emit */

    if (this.client.on) {
      this.client.on("error", error => {
        console.error(error);
        this.connected = false;
        this.emit("message", "Redis is unavailable or not running");
      });

      this.client.on("connect", () => {
        this.connected = true;
        this.emit("connected", { host: this.host, port: this.port });
        this.emit("message", `OK connected to redis://${this.client.address}`);
      });

      this.client.on("end", () => {
        this.connected = false;
        this.emit("disconnected", { host: this.host, port: this.port });
        this.emit(
          "message",
          `Disconnected from redis://${this.client.host}:${this.client.port}`
        );
      });
    }

    /**  js-comment
     *
     *  @method
     *  @description Get -
     *  @return void{Object}
     *  @arg {Object} arg - About arg
     */

    this.get = Get;

    /**  js-comment
     *
     *  @method
     *  @description This is a method
     *  @return void{Object}
     *  @arg {Object} arg - About arg
     */

    this.add = Add;

    /**  js-comment
     *
     *  @method
     *  @description This is a method
     *  @return void{Object}
     *  @arg {Object} arg - About arg
     */

    this.del = Del;

    /**  js-comment
     *
     *  @method
     *  @description This is a method
     *  @return void{Object}
     *  @arg {Object} arg - About arg
     */

    this.delTag = DelTag;

    /**  js-comment
     *
     *  @method
     *  @description This is a method
     *  @return void{Object}
     *  @arg {Object} arg - About arg
     */

    this.route = Route;

    /**  js-comment
     *
     *  @method
     *  @description This is a method
     *  @return void{Object}
     *  @arg {Object} arg - About arg
     */

    this.size = Size;
  }
}
