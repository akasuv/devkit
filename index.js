#! /usr/bin/env node
const fs = require("fs");
const config = require("./config");
const prettier = require("prettier");
const util = require("util");
const minimist = require("minimist");
const inquirer = require("inquirer");
const Ora = require("ora");

(function () {
  const validOptions = ["_", "generate"];

  const options = minimist(process.argv.slice(2));

  if (Object.keys(options).length === 1) {
    console.log("Please input command options");
  }

  if (Object.keys(options).some((item) => !validOptions.includes(item))) {
    console.log("command not found");
  }

  const handleGeneration = (value) => {
    const types = {
      config: generationConfigFile,
    };

    return types[value] ? types[value]() : null;
  };

  if (options.generate) {
    const generateValues = ["config"];
    if (generateValues.includes(options.generate)) {
      handleGeneration(options.generate);
    } else {
      console.log(`devkit can't generate ${options.generate}`);
    }
  }

  function generationConfigFile() {
    inquirer
      .prompt({
        name: "configChoice",
        type: "list",
        message: "choose configs:",
        choices: ["all (prettier, eslint)", "prettier", "eslint"],
      })
      .then((answers) => {
        if (answers.configChoice === "all (prettier, eslint)") {
          const filenames = ["prettier", "eslint"];

          const existedFiles = filenames.filter((item) =>
            fs.existsSync(`./.${item}rc.js`)
          );

          filenames
            .filter((item) => !fs.existsSync(`./.${item}rc.js`))
            .forEach(writeFile);

          if (existedFiles.length) {
            inquirer
              .prompt({
                name: "overrideCheck",
                type: "checkbox",
                message:
                  "These files already exist, check files below you want to override:",
                choices: existedFiles,
              })
              .then((check) => {
                check.overrideCheck.forEach(writeFile);
              });
          }
        } else {
          if (fs.existsSync(`./.${answers.configChoice}rc.js`)) {
            inquirer
              .prompt({
                name: "overrideConfirm",
                type: "confirm",
                message: `.${answers.configChoice}rc.js already exists, do you want to override?`,
              })
              .then((confirm) => {
                if (confirm.overrideConfirm) {
                  writeFile(answers.configChoice);
                }
              });
          } else writeFile(answers.configChoice);
        }
      });
  }

  function writeFile(name) {
    const spinner = new Ora({
      text: `Generating .${name}rc.js `,
    });

    spinner.start();
    fs.writeFile(
      `./.${name}rc.js`,
      prettier.format(
        `module.exports = ${util.inspect(config[name], {
          depth: Infinity,
        })}`,
        { parser: "babel" }
      ),
      (err) => {
        if (!err) {
          spinner.succeed(`${name}rc.js generated!`);
        }
      }
    );
  }
})();
