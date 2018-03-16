/**
 * Module for the sound-plugin, extends the core plugin.
 * Support for simulations.
 */

// Requires.
let CorePlugin = require('./corePlugin')
let utils = require('./../lib/utils')
let path = require('path')

// Class.
class CameraPlugin extends CorePlugin {
  constructor (params) {
    super(params, 'camera', ['takePicture'])
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
    let filename = '/images/' + utils.isoTimestamp() + '.jpg'
    let pathToImage = path.resolve(__dirname, '../resources/' + filename)
    if (!this._params.simulate) {
      this._actuator.config.output = pathToImage
      this._actuator.snap()
        .then((result) => {
          this.addValue(filename)
        })
        .catch((error) => {
          console.log(error)
        })
    } else {
      this.addValue(filename)
    }

    value.status = 'completed'

    console.info('Changed value of %s to %s', this._model.name, filename)
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
