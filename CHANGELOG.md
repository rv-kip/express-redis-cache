CHANGE LOG
==========

# Changes between 0.0.8 and 0.1.0

## New features

### Conditional caching

We introduced the `(Boolean) res.express_redis_cache_skip` property which, if set to true, will not cache the route nor use the cache -- it will skip `cache.route()` altogether.

## Fixes

## Changed

- **test** We now use Mocha for testing instead of home-made testing framework
- **Event Emitter** Module (`index.js`) now extends EventEmitter to emit events instead of custome event emitter before
- **use strict** We now use strict JavaScript
- **added contributors** Added all the kind people who submit PRs to the list of contributors

### Module is now an object instead of a function

## Deprecated

## Removed
