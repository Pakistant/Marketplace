const { app, initDb } = require("./app");
const { port } = require("./config");

initDb()
  .then(() => {
    app.listen(port, () => {
      console.log(`MarketDouala API listening on http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error("Unable to start API", error);
    process.exit(1);
  });

