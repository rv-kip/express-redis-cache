CHANGE LOG
==========

# Changes between 0.0.8 and 0.1.0

## New features

### Conditional caching

We introduced the `(Boolean) res.express_redis_cache_skip` property which, if set to true, will not cache the route nor use the cache -- it will skip `cache.route()` altogether.

## Fixes

## Changed

### Test

We now use Mocha for testing instead of home-made testing framework

### Event Emitter

Module (`index.js`) now extends EventEmitter to emit events instead of custome event emitter before

### Use strict

We now use strict JavaScript

### Contributors

Added all the kind people who submit PRs to the list of contributors

### Module is now an object instead of a function

### Naming convention

Code base now strictly follows the following naming convention:

- Class names are in upper camel case (ie, `function MyClass () {}`)
- Function and method names are in lower camel case (ie, `function myFunction () {}`)
- Variable names are in lower snake case (ie, `var my_var;`)
- Upper cases for constants (even though we don't use the const keyword to declare them because it is not allowed in strict JavaScript) (ie, `var CONSTANT = 1`)

The variables from the previous code who are not following the naming convention are marked as deprecated (you can still use them) and their equivalent with the correct naming have been introduced (we recomend you to use them instead). See the section **## Deprecated** below.

## Deprecated

Still supported, but will issue a deprecation notice with a substitute. You can get notified like this:

```js
cache.on("deprecated", function (deprecated, substitute) {
  console.log('Deprecated: ' + deprecated +'. Use ' + substitute + ' instead');
});
```

### expressRedisCacheName

Now use `express_redis_cache_name`

```js
// Replace
res.expressRedisCacheName = "...";

// By
res.express_redis_cache_name = "...";
```

## Removed
