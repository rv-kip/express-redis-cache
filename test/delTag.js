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

describe("delTag", () => {
  before(done => {
    cache.add(
      "tag-to-del",
      "-",
      {
        tag: "testtag"
      },
      done
    );
  });

  it("should be a function", () => {
    cache.delTag.should.be.a.Function;
  });

  it("should callback", done => {
    cache.delTag("testtag", ($error, $deletions) => {
      debugger;
      done();
    });
  });
});
