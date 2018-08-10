import should from "should";
import async from "async";
import ERC from "../dist";

let prefix = process.env.EX_RE_CA_PREFIX || "erct:";
let host = process.env.EX_RE_CA_HOST || "localhost";
let port = process.env.EX_RE_CA_PORT || 6379;

const cache = new ERC({
  prefix: prefix,
  host: host,
  port: port
});

describe("del", function() {
  let error, deletions;

  before(function(done) {
    cache.add("test-to-del", "-", done);
  });

  it("should be a function", function() {
    cache.del.should.be.a.Function;
  });

  it("should callback", function(done) {
    cache.del("test-to-del", function($error, $deletions) {
      error = $error;
      deletions = $deletions;
      done();
    });
  });

  it("should not have error", function() {
    should(error).be.null;
  });

  it("should be a number", function() {
    deletions.should.be.a.Number;
  });

  it("should be a 1 or above", function() {
    deletions.should.be.above(0);
  });
});

describe("del with wilcard", function() {
  let error, deletions;

  before(function(done) {
    let parallel = [0, 1, 2, 3, 4, 5].map(function(num) {
      return function(done) {
        cache.add("test-to-del." + this.num, "-", done);
      }.bind({ num: num });
    });

    async.series(parallel, function(error) {
      done(error);
    });
  });

  it("should be a function", function() {
    cache.del.should.be.a.Function;
  });

  it("should callback", function(done) {
    cache.del("test-to-del.*", function($error, $deletions) {
      error = $error;
      deletions = $deletions;
      done();
    });
  });

  it("should not have error", function() {
    should(error).be.null;
  });

  it("should be a number", function() {
    deletions.should.be.a.Number;
  });

  it("should be a 1 or above", function() {
    deletions.should.be.eql(6);
  });
});
