/**
 * Middleware to subscribe to a webhook of a specific event.
 */

// Requires.
let errs = require('restify-errors')
let axios = require('axios')
let eventChannel = require('./../lib/event-channel')

/**
 * Will subscribe the user to the event contained in the request path, if
 * the request contains the upgrade: webhook header. Needs a callback
 * header to call when the event is fired.
 */
function upgrade (subscriptions) {
  return function (req, res, next) {
    if (req.header('upgrade') && req.header('upgrade') === 'webhook') {
      if (req.header('callback')) {
        let id = Date.now()
        let callback = req.header('callback')
        let event = getEvent(req.path())

        subscriptions.push({id: id, callback: callback, event: event})

        eventChannel.removeAllListeners()
        alert(subscriptions)
      } else {
        return next(new errs.BadRequestError('Callback for webhook is required.'))
      }
    } else if (req.header('downgrade') && req.header('downgrade') === 'webhook') {
      if (req.header('callback')) {
        let index = subscriptions.findIndex((sub) => {
          return sub.callback === req.header('callback')
        })

        if (index > -1) {
          subscriptions.splice(index, 1)
          eventChannel.removeAllListeners()
          alert(subscriptions)
        }
      } else {
        return next(new errs.BadRequestError('Callback for downgrading webhook is required.'))
      }
    }

    return next()
  }
}

/**
 * Will alert all subcribed webhooks of events.
 */
function alert (subscriptions) {
  console.log('adding alerts')
  subscriptions.forEach((subscription) => {
    eventChannel.on(subscription.event, () => {
      axios({
        method: 'POST',
        url: subscription.callback,
        data: {
          event: subscription.event,
          token: process.env.GATEWAY_TOKEN
        }
      })
      .catch((error) => {
        console.log(error)
      })
    })
  })
}

/**
 * Extracts the event from the path.
 */
function getEvent (path) {
  let event = path.split('actions/')[1]
  event = event.split('/')[0]
  return event + 'Change'
}

// Exports.
module.exports = {
  upgrade: upgrade,
  alert: alert
}
