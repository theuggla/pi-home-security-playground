/**
 * Module to authenticate API-keys of requests.
 */

// Requires.
let errs = require('restify-errors')
let subscriptions = require('./../resources/subscriptions')
let eventChannel = require('./../lib/event-channel')
let axios = require('axios')

function webhook () {
  return function (req, res, next) {
    if (req.header('upgrade') && req.header('upgrade') === 'webhook') {
      if (req.header('callback')) {
        let id = Date.now()
        let callback = req.header('callback')
        let event = getEvent(req.path())

        subscriptions.push({id: id, callback: callback, event: event})

        eventChannel.on(event, () => {
          axios({
            method: 'GET',
            url: callback,
            data: {
              event: event
            }
          })
        })
      } else {
        return next(new errs.BadRequestError('Callback for webhook is required.'))
      }
    }

    return next()
  }
}

function getEvent (path) {
  let event = path.split('actions/')[1]
  event = event.split('/')[0]
  return event + 'Change'
}

module.exports = webhook
