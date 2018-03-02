/**
 * Module for the pir-plugin, extends the core  plugin.
 * Support for simulations.
 */

// Requires.
let CorePlugin = require('./corePlugin')
let utils = require('./../lib/utils')
let eventChannel = require('./../lib/eventChannel')

// Class.
class PirPlugin extends CorePlugin {
  /**
   * Listens for alarmState to turn on and off when the alarm turns on and off.
   */
  constructor (params) {
    super(params, 'pir', ['alarmState'])
  }

  /**
   * Deactivates the sensor and turns the led off.
   */
  doStop () {
    this._sensor.unexport()
    eventChannel.emit('ledStateChange', {state: false})
  }

  /**
   * Turns the LED on.
   */
  doStart () {
    eventChannel.emit('ledStateChange', {state: true})
  }

  /**
   * Adds a simulation of a reading.
   */
  doSimulate () {
    let newReading = Math.floor(Math.random() * 2)
    this._reading = this._reading ? this._reading : newReading

    if (newReading !== this._reading) {
      this.addValue(newReading)
      this.showValue()
      this._reading = newReading

      if (this._reading) {
        eventChannel.emit('takePictureChange', {})
        eventChannel.emit('soundStateChange', {state: true})
      }
    }
  }

  /**
   * Turns the sensor on and of by updating the model and, if not in simulation mode,
   * writing to the hardware. Change the action status to complete.
   */
  doAction (value) {
    if (value.code === process.env.ALARM_CODE && value.state === true) {
      console.log('starting alarm')
      this.start()
    } else if (value.code === process.env.ALARM_CODE && value.state === false) {
      console.log('stopping alarm')
      this.stop()
    }

    value.status = 'completed'
  }

  /**
   * Creates suitable value for the plugin.
   */
  createValue (data) {
    return {'presence': data, 'timestamp': utils.isoTimestamp()}
  }

  /**
   * Connects to the hardware.
   * Adds value on change.
   */
  connectHardware () {
    let Gpio = require('onoff').Gpio
    this._sensor = new Gpio(this._model.values.presence.customFields.gpio, 'in', 'both')
    this._sensor.watch((err, value) => {
      if (err) process.exit(err)
      this.addValue(!!value)
      this.showValue()

      if (value === 1) {
        eventChannel.emit('takePictureChange', {})
        eventChannel.emit('soundStateChange', {state: true})
      }
    })

    console.info('Hardware %s sensor started!', this._model.name)
  }
}

// Exports.
module.exports = PirPlugin
