// WebSocket Server and Router
const WebSocket = require('ws');
const deepmerge = require('deepmerge');
const Util = require('./Util');
const { spawn } = require('child_process');
const fs = require('fs-extra');

class Server {
  constructor(wsOptions = {}, routeMapping = {}, routeSelectionProperty = 'action', callbackOptions = {}) {
    const defaults = {
      port: 9090,
      debugPort: 15988
    };

    this.options = deepmerge(defaults, wsOptions);
    this.server = new WebSocket.Server(this.options);
    this.routeMapping = routeMapping;
    this.routeSelectionProperty = routeSelectionProperty;
    this.onInfo = callbackOptions.onInfo || function onInfo() {};
    this.onBeforeRoute = callbackOptions.onBeforeRoute || function onBeforeRoute(socket, message) { return { socket, message }};
    this.onRouteResult = callbackOptions.onRouteResult || function onRouteResult() {};
    this.onError = callbackOptions.onError || function onError() {};
    // TODO: Make getters/setters for the on* properties so that they can be wrapped in a promise if not being set as async.
  }

  async start() {
    this.server.on('connection', (socket) => {
      this.onInfo('Socket connected.');
      socket.on('message', this.handleMessage.bind(this, socket));
    });
  }

  async handleMessage(socket, message) {
    this.onInfo('Calling onBeforeRoute on message.');
    const result = this.onBeforeRoute(socket, message);

    this.route(result.socket, result.message).then(this.onInfo).catch(this.onError);
  }

  async route(socket, message) {
    this.onInfo('Attempting to route.');
    const messageObject = Util.safeParse(message);
    const routeKey = messageObject[this.routeSelectionProperty];

    if (!routeKey) {
      this.onError(`Message has not value for routeKey. routeSelectionProperty=${this.routeSelectionProperty} message: ${message}`);
      return;
    }

    const lambdaConfig = this.routeMapping[routeKey];

    if (!lambdaConfig) {
      this.onError(`RouteKey of '${routeKey}' does not have a mapping to a Lambda.`); // TODO: $default
      return;
    }

    await this.writeEvent(lambdaConfig, Util.formatMessageToEvent(messageObject));
    this.startLambda(lambdaConfig);
  }

  async writeEvent(lambdaConfig, message) {
    const fileName = `tmp-event-${lambdaConfig.id}.json`;
    await fs.writeJSON(fileName, message);
  }

  startLambda(lambdaConfig) {
    const spawnArgs = ['local', 'invoke', lambdaConfig.id, `-etmp-event-${lambdaConfig.id}.json`];

    if (lambdaConfig.debug) {
      if (lambdaConfig.debugPort) {
        spawnArgs.push(`--debug-port=${lambdaConfig.debugPort}`);

      } else {
        spawnArgs.push('--debug-port=15988');
      }
    }

    const lambda = spawn('sam', spawnArgs);
    lambda.stdout.on('data', (data) => {
      this.onInfo(`>> ${data}`);
    });

    lambda.stderr.on('data', (data) => {
      this.onError(`err: ${data}`);
    });

    lambda.on('close', (code) => {
      this.onRouteResult(code);
    });
  }
}

module.exports = Server;
