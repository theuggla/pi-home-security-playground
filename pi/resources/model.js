/**
 * Module to return the model-json as aProxy that emits events on change.
 */

// Requires.
let eventChannel = require('./../lib/eventChannel')
let model = require('./jsonld-model.json')

// Class to handle the changes and emit events.
class Handler {
  get (target, name) {
    let v = target[name]
    return typeof v === 'object' ? new Proxy(v, handler) : v
  }

  set (obj, prop, value) {
    if (value.action === true) {
      console.log('event')
      let eventType = value.type + 'Change'
      console.log('emitting event ' + eventType)
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
