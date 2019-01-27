/*
This file is used both in your Next.js app, and in your custom (Express) server.
It has to use syntax that both understand.
*/
/* global module, require */

const { makeRoute } = require("next-minimal-routes");

module.exports = {
  home: makeRoute({
    page: "/",
  }),
  about: makeRoute({
    page: "/about",
  }),
  product: makeRoute({
    page: "/product",
    pattern: "/products/:slug",
  }),
  badLink: makeRoute({
    page: "/bad-link",
    pattern: "/bad-link/:name/:type",
  }),
  weird: makeRoute({
    page: "/weird",
    pattern: "/weird/:optional_repeat*/:duplicate/:duplicate",
  }),
};
