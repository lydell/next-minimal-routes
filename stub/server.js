/* eslint-disable */
require("@babel/register");
module.exports = require(`../${process.env.PACKAGE_DIR || ""}/server.js`);
