/**
 * Module to return the model-json as a Proxy that emits events on change.
 */

// Requires.
let model = require('./jsonld-model.json')
let eventChannel = require('./../lib/event-channel')

// Class to handle the changes and emit events.
class Handler {
  get (target, name) {
    let v = target[name]
    return typeof v === 'object' ? new Proxy(v, handler) : v
  }

  set (obj, prop, value) {
    if (value.action === true) {
      let eventType = value.type + 'Change'
      eventChannel.emit(eventType, value)
    }

    obj[prop] = value
    return true
  }
}

// Variables.
let handler = new Handler()
let proxiedModel = new Proxy(model, handler)

// Exports.
module.exports = proxiedModel
