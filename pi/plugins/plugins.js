/**
 * Module to initialize plugins.
 */

function init () {
  let LedsPlugin = require('./ledsPlugin')
  let PirPlugin = require('./pirPlugin')

  let ledsPlugin = new LedsPlugin({'simulate': process.env.SIMULATE, 'frequency': 100000})
  ledsPlugin.start()

  let pirPlugin = new PirPlugin({'simulate': process.env.SIMULATE, 'frequency': 100000})
  pirPlugin.start()

  process.on('SIGINT', () => {
    ledsPlugin.stop()
    pirPlugin.stop()
    console.log('Bye, bye!')
    process.exit()
  })
}

// Exports.
module.exports = init
