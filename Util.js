const baseEvent = require('./base-integration-event');

class Util {
  static safeParse(json) {
    if (!json) return {};

    try {
      return JSON.parse(json);
    } catch (err) {
      return {};
    }
  }

  static formatMessageToEvent(message) {
    return {...baseEvent, body: JSON.stringify(message)};
  }
}

module.exports = Util;
