express-redis-cache
===================

Easily cache pages of your app using Express and Redis. Could be used without Express. 

# Install

    npm install express-redis-cache
    
`express-redis-cache` ships with a CLI utility you can invoke from the console. In order to use it, install `express-redis-cache` globally (might require super user privileges):

    npm install -g express-redis-cache
    
# Upgrade

Read [this](https://github.com/co2-git/express-redis-cache/blob/master/CHANGELOG.md) if you are upgrading from 0.0.8 to 0.1.0,

# Usage

Just use it as a middleware in the stack of the route you want to cache.

```js
var app = express();
var cache = require('express-redis-cache')();

// replace
app.get('/',
    function (req, res)  { ... });

// by
app.get('/',
    cache.route(),
    function (req, res)  { ... });
```
    
This will check if there is a cache entry for this route. If not. it will cache it and serve the cache next time route is called.

# Redis connexion info

By default, redis-express-cache connects to Redis using localhost as host and nothing as port (using Redis default port). To use different port or host, declare them when you require express-redis-cache.

```js
var cache = require('express-redis-cache')({
    host: String, port: Number
    });
```
        
You can pass a Redis client as well:

```js
require('express-redis-cache')({ client: require('redis').createClient() })
```

# Events

The module emits the following events:

## error

You can catch errors by adding a listener:

```js
cache.on('error', function (error) {
    throw new Error('Cache error!');
});
```

## message

`express-redis-cache` logs some information at runtime. You can access it like this:

```js
cache.on('message', function (message) {
    // ...
});
```

## connected

Emitted when the client is connected to Redis server

```js
cache.on('connected', function () {
    console.log('Ready to party!');
});
```
    
# The Entry Model

This is the object synopsis we use to represent a cache entry:

```js
var entry = {
  body:    String // the content of the cache
  touched: Number // last time cache was set (created or updated) as a Unix timestamp
  expire:  Number // the seconds cache entry lives (-1 if does not expire)
};
```

# The module

The module exposes a function which instantiates a new instance of a class called [ExpressRedisCache](master/index.js).

```js
// This
var cache = require('express-redis-cache')({ /* ... */ });
// is the same than
var cache = new (require('express-redis-cache/lib/ExpressRedisCache'))({ /* ... */ });
```

# The constructor

As stated above, call the function exposed by the module to create a new instance of `ExpressRedisCache`,

```js
var cache = require('express-redis-cache')(/** Object | Undefined */ options);
```

Where `options` is an object that has the following properties:

|   Option    |  Type   |  Default  |  Description  |
| ------------- |----------|-------|----------|--------|
| **host**          | `String`    | `undefined` | Redis server host
| **port**      | `Number`     | `undefined` | Redis server port
| **prefix**       | `String`  | `require('express-redis-cache/package.json').config.prefix` | Default prefix (This will be prepended to all entry names) |
| **expire**   | `Number` | `undefined` | Default life time of entries in seconds |
| **client**   | `RedisClient` | `require('redis').createClient({ host: cache.host, port: cache.port })` | A Redis client |

## Route `cache.route()`
    
```js
cache.route(/*** String or Object or Undefined */ name, /*** Number or String or Undefined */ custom);
```

### `@arg name`
    
**If `name` is a string**, it will be used as the cache entry's name.

```js
cache.route('entry-name'); // entry name will be {prefix}:entry-name
```

**If `name` is undefined**, the route's URI (`req.originalUrl`) will be used as the entry name.

```js
app.get('/about', cache.route(), require('./routes/'))
// the name of the enrty will be '{prefix}:/about'
```

### Custom name

Optionally, you can gain more naming control on defining `res.express_redis_cache_name`:

```js
// Example with using parameters
app.get('/user/:userid',
    function (req, res, next) {
        res.express_redis_cache_name = '/user/' + req.params.userid; // name of the entry
        next();
    },
    cache.route(),
    require('./routes/user')
);

// Example with using payload
app.post('/search',
    function (req, res, next) {
        res.express_redis_cache_name = '/search/' + req.body.tag; // name of the entry
        next();
    },
    cache.route(),
    require('./routes/user')
);
```

### Conditional caching

You can also introduce a logic to decide if to use the cache:

```js
app.get('/',
  
  /** Pre function to decide if to use the cache */
  
  function (req, res, next) {
    /** Dummy story: don't use the cache if user has cookie */
    res.express_redis_cache_skip = !! req.signedCookies.user;
    
    /** Continue in stack */
    next();
    },
    
  /** Express-Redis-Cache middleware */
  /** This will be skipped if user has cookie */
  
  cache.route(),
  
  /** The view middleware */
  
  function (req, res) {
    res.render('index');
    }
    
  );
```

### Set an expiration date for the cache entry

The number of seconds the cache entry will live

```js
cache.route('home', ( 60 * 5 ));
// cache will expire in 5 minutes
```
    
If you don't define an expiration date in your route but have set a default one in your constructor, the latter will be used. If you want your cache entry not to expire even though you have set a default expiration date in your constructor, do like this:

```js
cache.route('my-page', cache.FOREVER); // This entry will never expire
```

### Overwrite default prefix with custom prefix

```js
cache.route('home', 'custom');
// entry name will be "custom:home"
```

### Don't use prefix

```js
cache.route('home', false);
// entry name will be "home"
```

# API

The `route` method is designed to integrate easily with Express. You can also define your own caching logics using the other methos of the API shown below.

## `ls` Get the list of all cache entries

    cache.ls( Function ( Error, [Entry] ) )
    
Feed a callback with an array of the cache entry names.
    
## `get` Get a single cache entry by name
    
    cache.get( String name, Function( Error, Entry ) )
    
## `add` Add a new cache entry
    
    cache.add( String name, String body, Number expire?, Function( Error, Entry ) )
    
Example:

```js
cache.add('user:info', JSON.stringify({ id: 1, email: 'john@doe.com' }), 60,
    function (error, added) {
    });
```

## `del` Delete a cache entry
    
    cache.del( String name, Function ( Error, Number deletedEntries ) )

## `size` Get cache size for all entries
    
    cache.size( Function ( Error, Number bytes ) )
    
# Command line

We ship with a CLI. You can invoke it like this: `express-redis-cache`

# Test

    mocha --host <redis-host> --port <redis-port>

    # or

    npm test --host=<redis-host> --port=<redis-port>

Enjoy!
