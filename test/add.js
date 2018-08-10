import should from "should";
import { config } from "../package.json";
import ERC from "../dist";

let prefix = process.env.EX_RE_CA_PREFIX || "erct:";
let host = process.env.EX_RE_CA_HOST || "localhost";
let port = process.env.EX_RE_CA_PORT || 6379;

let _name = "test1";
let _body = "test1 test1 test1";

const cache = new ERC({
  prefix,
  host,
  port,
  expire: 2
});

describe("add", () => {
  let error, name, entry;

  it("should be a function", () => {
    cache.add.should.be.a.Function();
  });

  it("should callback", done => {
    cache.add(_name, _body, ($error, $name, $entry) => {
      error = $error;
      name = $name;
      entry = $entry;
      done();
    });
  });

  it("should allow for zero expiration", done => {
    cache.add(_name, _body, { expire: 0 }, (err, $name, $entry) => {
      let resp;
      if ($entry.expire !== 0) {
        resp = new Error("entry.expire should be 0. It is " + $entry.expire);
      }
      done(resp);
    });
  });

  it("should not have error", () => {
    should(error).be.null;
  });

  it("should have a name which is a string and match the request", () => {
    name.should.be.a.String();
    name.should.equal(_name);
  });

  it("should have a entry which is an object", () => {
    entry.should.be.an.Object();
  });

  it(" - entry which has a property body which a string matching the request", () => {
    entry.body.should.be.a.String();
    entry.body.should.equal(_body);
  });

  it(" - entry which has a property type which a string matching default type", () => {
    entry.type.should.be.a.String();
    entry.type.should.equal(config.type);
  });

  it(" - entry which has a property touched which is a number which, when resolved to date, is less than 2 seconds from now", () => {
    entry.touched.should.be.a.Number();

    let date = new Date(entry.touched);

    (Date.now() - date).should.be.below(2000);
  });

  it(" - entry which has a property expire which equals cache.expire", () => {
    should(entry.expire).equal(cache.expire);
  });

  it("should have cached the content", done => {
    cache.add(_name, _body, { expire: -1 }, () => {
      cache.get(_name, (err, res) => {
        should(err).not.be.ok;
        res.should.be.an.Array();
        res.should.have.a.lengthOf(1);
        done();
      });
    });
  });

  it("should expire in " + cache.expire + " seconds", function(done) {
    this.timeout(2500); // allow more time for this test

    setTimeout(() => {
      cache.get(_name, (err, res) => {
        should(err).not.be.ok;
        res.should.be.an.Array();
        res.should.have.a.lengthOf(0);
        done();
      });
    }, cache.expire * 1000);
  });
});
