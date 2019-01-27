// Based on https://github.com/zeit/next.js/blob/125aaf88348ec97c7ed3246e2b62942810a347ed/examples/custom-server-express/server.js

const express = require("express");
const next = require("next");

// New imports:
const { getRequestHandler } = require("next-minimal-routes/server");
const routes = require("../routes");

const port = parseInt(process.env.PORT, 10) || 3000;
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });

// Use this instead of the usual `app.getRequestHandler()`.
const handle = getRequestHandler({ app, routes: Object.values(routes) });

app.prepare().then(() => {
  const server = express();

  server.get("*", (req, res) => {
    return handle(req, res);
  });

  server.listen(port, err => {
    if (err) {
      throw err;
    }
    console.log(`> Ready on http://localhost:${port}`);
  });
});
