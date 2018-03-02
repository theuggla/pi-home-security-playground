/**
 * A central event-channel so that the whole Pi can listen to the same events.
 */

// Requires.
let EventEmitter = require('events')

// Channel.
let eventChannel = new EventEmitter()

// Exports.
module.exports = eventChannel
