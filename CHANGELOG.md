CHANGE LOG
==========

# Changes between 0.0.8 and 0.1.x

## Disclaimer

Even though we updated the major version in the semantic version (from 0.0.x to 0.1.x), this version has been designed so there would be **no breaking changes** and that clients may **safely upgrade** -- keeping in mind we ship `as-is`.

So why having incremented the major version then? It reflects that architectural changes have been made (view below) to redesign, normalize and standardize the codebase (better documentation, better syntax, better tests, etc.) -- yet, once again, these changes should not have an impact for clients upgrading (no code change required on their side).

## New features

### Conditional caching

We introduced the `(Boolean) res.express_redis_cache_skip` property which, if set to true, will not cache the route nor use the cache -- it will skip `cache.route()` altogether (see README for more info, look for Conditional caching).

### Deprecated event

The code now emits a *deprecated* event when stumbling upon a deprecated part of the code. View below for more info.

## Fixes

No fixes have been made.

## Changed

### Test

We now use Mocha and should.js for testing instead of home-made testing framework

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
- Constant names are in upper case (even though we don't use the `const` keyword to declare them because it is not allowed in strict JavaScript) (ie, `var CONSTANT = 1`)

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

### expressRedisCache

Now use `use_express_redis_cache`

```js
// Replace
if ( res.expressRedisCache ) {}

// By
if ( res.use_express_redis_cache ) {}
```

## Removed

- the `ls` method have been removed both from API and CLI. Use `get` instead.
