/**
 * Module to initialize plugins.
 */

function init () {
  let LedsPlugin = require('./ledsPlugin')
  let PirPlugin = require('./pirPlugin')
  let CameraPlugin = require('./cameraPlugin')
  let SoundPlugin = require('./soundPlugin')

  let ledsPlugin = new LedsPlugin({'simulate': true, 'frequency': 100000})
  ledsPlugin.start()

  let pirPlugin = new PirPlugin({'simulate': true, 'frequency': 5000})
  pirPlugin.start()

  let soundPlugin = new SoundPlugin({'simulate': true, 'frequency': 100000})
  soundPlugin.start()

  let cameraPlugin = new CameraPlugin({'simulate': true, 'frequency': 100000})
  cameraPlugin.start()

  process.on('SIGINT', () => {
    ledsPlugin.stop()
    pirPlugin.stop()
    cameraPlugin.stop()
    soundPlugin.stop()
    console.log('Bye, bye!')
    process.exit()
  })
}

// Exports.
module.exports = init
