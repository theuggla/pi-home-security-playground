/**
 * Module for the sound-plugin, extends the core plugin.
 * Support for simulations.
 */

// Requires.
let CorePlugin = require('./corePlugin')
let utils = require('./../lib/utils')

// Class.
class CameraPlugin extends CorePlugin {
  constructor (params) {
    super(params, 'camera', ['takePicture'])
  }

  /**
   * Deactivates the camera.
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
    const PiCamera = require('pi-camera')
    const opts = {
      mode: 'photo',
      width: 640,
      height: 480,
      nopreview: true
    }
    this._actuator = new PiCamera(opts)
  }

/**
 * Takes a picture by updating the model and, if not in simulation mode,
 * writing to the hardware. Change the action status to complete.
 */
  doAction (value) {
    console.log('Taking picture')
    if (!this._params.simulate) {
      let filename = `${__dirname}/resources/images/${utils.isoTimestamp()}.jpg`
      this._actuator.config.output = filename
      this._actuator.snap()
        .then(() => {
          this.addValue(filename)
        })
        .catch(() => {
          // Handle error
        })
    } else {
      this.addValue(`${__dirname}/resources/images/${utils.isoTimestamp()}.jpg`)
    }

    value.status = 'completed'
    this.eventChannel.emit('pictureTaken', {})

    console.info('Changed value of %s to %s', this._model.name, value.state)
  }

  /**
   * Creates suitable value for the plugin.
   */
  createValue (data) {
    return {'picture': data, 'timestamp': utils.isoTimestamp()}
  }
}

// Exports.
module.exports = CameraPlugin
