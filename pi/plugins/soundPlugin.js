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
    console.log('connecting hardware')
    this._actuator = require('play-sound')({player: 'omxplayer'})
  }

  /**
 * Turns the sound on and of by updating the model and, if not in simulation mode,
 * writing to the hardware. Change the action status to complete.
 */
  doAction (value) {
    if (!this._params.simulate) {
      console.log('playing')
      this._actuator.play(path.resolve(__dirname, '/../resources/police_s.wav'), (err) => {
        if (err) {
          console.log(err)
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
