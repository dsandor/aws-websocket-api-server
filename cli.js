#!/usr/bin/env node

/*
  Starts the server.
 */
const program = require('commander');
const pkg = require('./package');

const Server = require('./Server');
const chalk = require('chalk');
const fs = require('fs-extra');

program
  .version(pkg.version)
  .option('-p --port <port>', 'Port to start websocket api on.', '9090')
  .option('-dp --debug-port <debugPort>', 'Port to use for attaching node inspector to the running lambda.', 15988)
  .command('start <routeConfig>')
  .action(async function(routeConfigFilename) {
    const routeConfig = await fs.readJSON(routeConfigFilename);

    console.log(chalk.cyanBright('Route Configuration:\n') + chalk.cyan(JSON.stringify(routeConfig)));

    const callbackOptions = {
      onInfo: (message) => {
        console.log(chalk.blueBright('>> ') + chalk.greenBright(message));
      },
      onError: (message) => {
        console.error(chalk.redBright('!! ') + chalk.gray(message));
      }
    };

    console.log(chalk.yellow('Starting WebSocket server on port:'), chalk.yellowBright(program.port));
    const server = new Server({ port: Number(program.port), debugPort: Number(program.debugPort) }, routeConfig, 'action', callbackOptions);
    server.start();
  });

program.parse(process.argv);
