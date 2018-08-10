let app = require("express")(),
  cache = require("../")({ expire: 5 });

cache.on("message", message => {
  console.log("cache", message);
});

cache.on("error", error => {
  console.error("cache", error);
});

let port = 3000;
app.listen(port);
console.log(`Server listening on http://localhost:${port}`);

// Serve simple page with timestamp cached for 5 seconds
app.get("/:skip_cache?", cache.route(), (req, res) => {
  if (req.params.skip_cache) {
    res.use_express_redis_cache = false;
    console.log("Cache disabled on this request");
  }

  let currTime = new Date();
  res.send(`Date and time: ${currTime}`);
});
