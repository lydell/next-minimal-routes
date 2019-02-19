const urlLib = require("url");

const { matchRoute } = require("./index");

function getRequestHandler({ app, routes, skip = defaultSkip }) {
  const handle = app.getRequestHandler();

  return (req, res) => {
    // Let static files through without matching routes.
    if (skip(req, res)) {
      handle(req, res);
      return;
    }

    const url = urlLib.parse(req.url, true);

    let pathname = undefined;
    try {
      pathname = decodeURIComponent(url.pathname);
    } catch {
      // Usually, this never happens. Express or CloudFlare or whatever error
      // out earlier.
      res.status(400).end("Bad Request");
      return;
    }

    const match = matchRoute(routes, pathname);

    if (match != null) {
      app.render(req, res, match.route.page, {
        ...url.query,
        ...match.params,
      });
    } else {
      handle(req, res);
    }
  };
}

function defaultSkip(req) {
  return req.url.startsWith("/_next/") || req.url.startsWith("/static/");
}

module.exports = {
  __esModule: true,
  getRequestHandler,
};
