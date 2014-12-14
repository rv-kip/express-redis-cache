express-redis-cache
===================

A module to make Express interact with Redis (create, get, delete). You can automatically cache all your most popular routes in Redis.

# Install

    npm install express-redis-cache
    
`express-redis-cache` ships with a CLI utility you can invoke from the console. In order to use it, install `express-redis-cache` globally (might require super user privileges):

    npm install -g express-redis-cache
    
# Automatically cache a route

Just use it as a middleware in your route.

```js
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

# Errors

You can catch errors by adding a listener:

```js
cache.on('error', function (error) {
    // ...
});
```

# Messages

`express-redis-cache` logs some information at runtime. You can access it like this:

```js
cache.on('message', function (message) {
    // ...
});
```

# Other events

- **connected** emitted when the client is connected to Redis server
    
# Objects

## The Entry object

    Object Entry {
        body:    String // the content of the cache
        touched: Number // last time cache was set (created or updated) as a Unix timestamp
        expire:  Number // the seconds cache entry lives (-1 if does not expire)
    }
    
## The ConstructorOPtions Object

    Object ConstructorOPtions {
        host:   String?     // Redis Host
        port:   Number?     // Redis port
        prefix: String?     // Cache entry name prefix,
        expire: Number?     // Default expiration time in seconds
        client: RedisClient // A Redis client of npm/redis
    }

# Commands

## Constructor

    cache( Object ConstructorOPtions? )

## Route
    
    cache.route( String name?, Number expire? )
        
    
If `name` is a string, it is a cache entry name. If it is null, the route's URI (`req.originalUrl`) will be used as the entry name.

```js
app.get('/', cache.route('home'), require('./routes/'))
// will get/set a cache entry named 'home'

app.get('/about', cache.route(), require('./routes/'))
// will get/set a cache entry named '/about'
```

Optionally, you can get more naming control on defining `res.expressRedisCacheName`:

```js
app.get('/user/:userid',
    function (req, res, next) {
        res.expressRedisCacheName = '/user/' + req.params.userid;
        next();
    },
    cache.route(),
    require('./routes/user')
);

app.post('/search',
    function (req, res, next) {
        res.expressRedisCacheName = '/search/' + req.body.tag;
        next();
    },
    cache.route(),
    require('./routes/user')
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
cache.route('my-page', cache.FOREVER);
```


## Get the list of all cache entries

    cache.ls( Function ( Error, [Entry] ) )
    
Feed a callback with an array of the cache entry names.
    
## Get a single cache entry by name
    
    cache.get( String name, Function( Error, Entry ) )
    
## Add a new cache entry
    
    cache.add( String name, String body, Number expire?, Function( Error, Entry ) )
    
Example:

```js
cache.add('user:info', JSON.stringify({ id: 1, email: 'john@doe.com' }), 60, console.log);
```

## Delete a cache entry
    
    cache.del( String name, Function ( Error, Number deletedEntries ) )

## Get cache size for all entries
    
    cache.size( Function ( Error, Number bytes ) )
    
# Command line

We ship with a CLI. You can invoke it like this: `express-redis-cache`

# Test

    mocha --host <redis-host> --port <redis-port>

    # or

    npm test --host=<redis-host> --port=<redis-port>

Enjoy!
