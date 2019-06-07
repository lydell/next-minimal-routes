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

async function start() {
  const preparePromise = app.prepare();
  const server = express();

  server.get("*", async (req, res) => {
    try {
      await preparePromise;
      handle(req, res);
    } catch (error) {
      console.error("app prepare or handle failed", error);
      res.status(500).end("Internal server error");
    }
  });

  await new Promise((resolve, reject) => {
    server.listen(port, err => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

start().then(
  () => {
    console.log(`> Listening on http://localhost:${port}`);
  },
  error => {
    console.error("Failed to start server", error);
  }
);
