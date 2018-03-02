/**
 * Module for the sound-plugin, extends the core plugin.
 * Support for simulations.
 */

// Requires.
let CorePlugin = require('./corePlugin')
let utils = require('./../lib/utils')

// Class.
class SoundPlugin extends CorePlugin {
  constructor (params) {
    super(params, 'sound', ['soundState'])
  }

  /**
   * Deactivates the sensor and turns the sound off.
   */
  doStop () {
    this._actuator.unexport()
  }

  /**
   * Adds a simulation of an output.
   */
  doSimulate () {
    // No simulation.
  }

  /**
   * Connects to the sound.
   */
  connectHardware () {
    // To be implemented.
  }

  /**
 * Turns the sound on and of by updating the model and, if not in simulation mode,
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
    value.state ? console.log('PRRRRRRRRRRR') : console.log('.................')
  }

  /**
   * Creates suitable value for the plugin.
   */
  createValue (data) {
    return {'playing': data, 'timestamp': utils.isoTimestamp()}
  }
}

// Exports.
module.exports = SoundPlugin
