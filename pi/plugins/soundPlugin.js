/**
 * Module for the sound-plugin, extends the core plugin.
 * Support for simulations.
 */

// Requires.
let CorePlugin = require('./corePlugin')
let utils = require('./../lib/utils')
let path = require('path')

// Class.
class SoundPlugin extends CorePlugin {
  constructor (params) {
    super(params, 'sound', ['soundState'])
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
    console.log('connecting sound')
    this._actuator = require('play-sound')({player: 'omxplayer'})
  }

  /**
 * Turns the sound on and of by updating the model and, if not in simulation mode,
 * writing to the hardware. Change the action status to complete.
 */
  doAction (value) {
    console.log('got sound action')
    console.log(value)
    if (!this._params.simulate) {
      this._actuator.play(path.resolve(__dirname, '../resources/police_s.wav'), (err) => {
        if (err) {
          console.log('Could not play.')
        } else {
          console.log('Played.')
        }
      })
      this.addValue(value.state)
    } else {
      this.addValue(value.state)
    }

    value.status = 'completed'
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
