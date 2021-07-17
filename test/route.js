import should from "should";
import Domain from "domain";
import async from "async";
import assert from "assert";
import ERC from "../dist";

let prefix = process.env.EX_RE_CA_PREFIX || "erct:";
let host = process.env.EX_RE_CA_HOST || "localhost";
let port = process.env.EX_RE_CA_PORT || 6379;

let cache = new ERC({
  prefix: prefix,
  host: host,
  port: port
});

let _name = `test-route${process.pid}`;
let _expire = 60;

/** Emulate req **/
let req = {
  originalUrl: "/index"
};

/** Emulate res **/
let res = {
  statusCode: 200,
  send: function(body) {},
  _headers: {
    "content-type": "text/plain"
  }
};

/** Emulate next **/
let next = function() {
  // res.send(entry.body);
};

describe("route", () => {
  let middleware, error, results;

  it("should be a function", () => {
    cache.route.should.be.a.Function();
  });

  it("should return a function", () => {
    middleware = cache.route(_name, _expire);
    middleware.should.be.a.Function();
  });

  describe("On Calling the route", () => {
    it("should call next", done => {
      middleware(req, res, error => {
        if (error) {
          throw error;
        }
        res._headers["cache-control"].should.equal("max-age=60000");
        res._headers["redis-cache-status"].should.equal(undefined);
        res.send("hello folks!");
        done();
      });
    });

    it("should have created the cache entry", done => {
      cache.get(_name, (error, $results) => {
        if (error) {
          throw error;
        }
        $results.length.should.be.above(0);
        results = $results;
        done();
      });
    });

    describe("cache entry", () => {
      it('should be have a property "body" which is a string and equals the sent text', () => {
        results.forEach(entry => {
          entry.should.have.property("body").which.is.a.String();
          entry.body.should.equal("hello folks!");
        });
      });

      it('should be have a property "type" which is a string and equals the sent type', () => {
        results.forEach(entry => {
          entry.should.have.property("type").which.is.a.String();
          entry.type.should.equal(res._headers["content-type"]);
        });
      });

      it(" - entry which has a property touched which is a number which, when resolved to date, is less than 2 seconds from now", () => {
        results.forEach(entry => {
          Number(entry.touched).should.be.a.Number();

          let date = new Date(Number(entry.touched));

          (Date.now() - date).should.be.below(2000);
        });
      });

      it(" - entry which has a property expire which equals sent expire", () => {
        results.forEach(entry => {
          should(+entry.expire).equal(_expire);
        });
      });
    });
  });
});
describe("binaryroute", () => {
  let middleware, error, results;

  it("should be a function", () => {
    cache.route.should.be.a.Function();
  });

  it("should return a function", () => {
    middleware = cache.route({ name: "binary", expire: _expire, binary: true });
    middleware.should.be.a.Function();
  });

  describe("On Calling the route", () => {
    it("should call next", done => {
      middleware(req, res, error => {
        if (error) {
          throw error;
        }

        res.send(Buffer.from("hello folks!").toString("base64"));
        done();
      });
    });

    it("should have created the cache entry", done => {
      cache.get("binary", (error, $results) => {
        if (error) {
          throw error;
        }
        $results.length.should.be.above(0);
        results = $results;
        done();
      });
    });

    describe("cache entry", () => {
      it('should be have a property "body" which is a base64 string and decodes to sent text', () => {
        results.forEach(entry => {
          entry.should.have.property("body").which.is.a.String();
          entry.body.should.equal("aGVsbG8gZm9sa3Mh"); //aGVsbG8gZm9sa3Mh = 'hello folks!' in base64
          let decodedString = Buffer.from(entry.body, "base64").toString(
            "utf8"
          );
          decodedString.should.equal("hello folks!");
        });
      });

      it('should be have a property "type" which is a string and equals the sent type', () => {
        results.forEach(entry => {
          entry.should.have.property("type").which.is.a.String();
          entry.type.should.equal(res._headers["content-type"]);
        });
      });

      it(" - entry which has a property touched which is a number which, when resolved to date, is less than 2 seconds from now", () => {
        results.forEach(entry => {
          Number(entry.touched).should.be.a.Number();

          let date = new Date(Number(entry.touched));

          (Date.now() - date).should.be.below(2000);
        });
      });

      it(" - entry which has a property expire which equals sent expire", () => {
        results.forEach(entry => {
          should(+entry.expire).equal(_expire);
        });
      });
    });
  });
});

/**

  Basic smoke test for method cache.route()
  #########################################

  Called by `test/test.js`

  # Abstract

  Expecting `test/test.js` to call this file and bind it with a `(require('express-redis-cache')())` instance.

  This instance should have an array property called `caches` which represent the entries that have been created when `test/test.js` is called. We use these entries to verify we can perform a basic smoke-test on method `cache.route()`.


**/

module.exports = function(cb) {
  if (typeof cb !== "function") {
    throw new Error("Missing callback");
  }

  let cache = this;

  async.parallel(
    /* for each new cache **/
    cache.newCaches

      /** if it is  a route cache */
      .filter(entry => {
        return !!/^\/route_/.test(entry.name);
      })

      .map(entry => {
        return function(then) {
          let name = this.name;
          let entry = this.entry;

          console.log();
          console.log(" Testing cache.route".bold.blue, name, entry);
          console.log();

          /** Emulate req **/
          let req = {
            path: name
          };

          /** Emulate res **/
          let res = {
            statusCode: 200,
            send: function(body) {
              assert("it should be the same message", body === entry.body);

              then();
            }
          };

          /** Emulate next **/
          let next = function() {
            assert(
              "There should be a response variable",
              !!res.expressRedisCache
            );

            res.send(entry.body);
          };

          let router = cache.route();

          assert("it should be a function", typeof router === "function");

          /** Emulate a HTTP request **/

          router.apply(cache, [req, res, next]);
        }.bind(entry);
      }),

    cb
  );
};
