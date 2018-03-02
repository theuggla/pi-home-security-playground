/**
 * Module to return the model-json as aProxy that emits events on change.
 */
let EventEmitter = require('events')

let model = require('./jsonld-model.json')

class Handler extends EventEmitter {
  get (target, name) {
    let v = target[name]
    return typeof v === 'object' ? new Proxy(v, handler) : v
  }

  set (obj, prop, value) {
    console.log('set')

    if (value.action === true) {
      console.log('event')
      let eventType = value.type + 'Change'
      this.emit(eventType, value)
    }

    obj[prop] = value
    return true
  }
}

let handler = new Handler()

const proxiedModel = new Proxy(model, handler)

module.exports = proxiedModel
