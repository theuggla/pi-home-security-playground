/**
 * Middleware to subscribe to a webhook of a specific event.
 */

// Requires.
let errs = require('restify-errors')
let axios = require('axios')
let eventChannel = require('./../lib/external-event-channel')
let Subscription = require('./../resources/subscriptions')

/**
 * Will subscribe the user to the event contained in the request path, if
 * the request contains the upgrade: webhook header. Needs a callback
 * header to call when the event is fired.
 */
function upgrade () {
  return function (req, res, next) {
    if (req.header('upgrade') && req.header('upgrade') === 'webhook') {
      if (req.header('callback')) {
        let callback = req.header('callback')
        let event = getEvent(req.path())

        Subscription.findOne({callback: callback, event: event})
          .then((subscription) => {
            if (!subscription) {
              let newSub = new Subscription({callback: callback, event: event, id: Date.now()})
              return newSub.save()
            } else {
              return Promise.resolve()
            }
          })
          .then((subscription) => {
            if (subscription) {
              eventChannel.on(subscription.event, alert(subscription))
            }

            res.send(200)
          })
          .catch((err) => {
            console.log(err)
          })
      } else {
        return next(new errs.BadRequestError('Callback for webhook is required.'))
      }
    } else if (req.header('downgrade') && req.header('downgrade') === 'webhook') {
      if (req.header('callback')) {
        let callback = req.header('callback')
        let event = getEvent(req.path())

        Subscription.findOneAndRemove({callback: callback, event: event})
          .then(() => {
            removeAllSubscriptionListeners(event)
            addAllSubscriptionListeners(event)
          })
        return res.send(200)
      } else {
        return next(new errs.BadRequestError('Callback for downgrading webhook is required.'))
      }
    }

    return next()
  }
}

/**
 * Will alert a webhook of an event.
 */
function alert (subscription) {
  return function () {
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
  }
}

/**
 * Removes all subscription listeners.
 */
function addAllSubscriptionListeners (event) {
  Subscription.find({event: event})
  .then((subscriptions) => {
    subscriptions.forEach((sub) => {
      eventChannel.addListener(event, alert(sub))
    })
  })
}

/**
 * Adds all subscription listeners.
 */
function removeAllSubscriptionListeners (event) {
  eventChannel.removeAllListeners(event)
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
  addAllSubscriptionListeners: addAllSubscriptionListeners,
  removeAllSubscriptionListeners: removeAllSubscriptionListeners
}
