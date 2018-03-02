/**
 * Module for the pir-plugin, extends the core  plugin.
 * Support for simulations.
 */

// Requires.
let CorePlugin = require('./corePlugin')
let utils = require('./../lib/utils.js')

// Class.
class PirPlugin extends CorePlugin {
  constructor (params) {
    super(params, 'pir', ['alarmState'])
    this.addValue(true)
  }

  doStop () {
    this._sensor.unexport()
  }

  doSimulate () {
    this.addValue(false)
  }

  /**
   * Turns the sensor on and of by updating the model and, if not in simulation mode,
   * writing to the hardware. Change the action status to complete.
   */
  doAction (value) {
    if (value.code === process.env.ALARM_CODE && value.state === true) {
      this.start()
    } else if (value.code === process.env.ALARM_CODE && value.state === false) {
      this.stop()
    }

    value.status = 'completed'

    console.info('Changed value of %s to %s', this._model.name, value.state)
  }

  createValue (data) {
    return {'presence': data, 'timestamp': utils.isoTimestamp()}
  }

  connectHardware () {
    let Gpio = require('onoff').Gpio
    this._sensor = new Gpio(this._model.values.presence.customFields.gpio, 'in', 'both')
    this._sensor.watch((err, value) => {
      if (err) exit(err)
      this.addValue(!!value)
      this.showValue()
    })

    console.info('Hardware %s sensor started!', this._model.name)
  }
}

// Exports.
module.exports = PirPlugin
