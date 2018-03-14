/**
 * Module for the leds-plugin, extends the core  plugin.
 * Support for simulations.
 */

// Requires.
let CorePlugin = require('./corePlugin')
let utils = require('./../lib/utils.js')

// Class.
class LedsPlugin extends CorePlugin {
  constructor (params) {
    super(params, 'leds', ['ledState'])

    this.addValue(false)
  }

  createValue (data) {
    return {'1': data, 'timestamp': utils.isoTimestamp()}
  }

  /**
   * Connects to the GPIO of the LED.
   */
  connectHardware () {
    let Gpio = require('onoff').Gpio
    this._actuator = new Gpio(this._model.values['1'].customFields.gpio, 'out')

    console.info('Hardware %s actuator started!', this._model.name)
  }

  /**
 * Turns the light on and of by updating the model and, if not in simulation mode,
 * writing to the hardware. Change the action status to complete.
 */
  doAction (value) {
    if (!this._params.simulate) {
      this._actuator.write(value.state === true ? 1 : 0, () => {
        this.addValue(value.state)
      })
    } else {
      this.addValue(value.state)
    }

    value.status = 'completed'

    console.info('Changed value of %s to %s', this._model.name, value.state)
  }

  /**
   * Unconnects the hardware.
   */
  doStop () {
    this._actuator.unexport()
  }

  /**
   * Simulates
   */
  doSimulate () {
    // No simulation.
  }
}

module.exports = LedsPlugin
