#! /usr/bin/env node
const fs = require("fs");
const config = require("./config");
const prettier = require("prettier");
const util = require("util");

module.exports = {
  config,
};

fs.writeFile(
  "./prettier.config.js",
  prettier.format(
    `module.exports = ${util.inspect(config.prettier, { depth: Infinity })}`,
    { parser: "babel" }
  ),
  () => {}
);
