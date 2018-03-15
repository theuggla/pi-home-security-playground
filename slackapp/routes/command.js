/**
 * Router for the auth pages.
 */

// Requires.
let router = require('express').Router()
let handler = require('./handlers/commandhandler')
let axios = require('axios')
let User = require('./../models/User')

// Routes--------------------------------------------------------------------------------------------------------

// Verify that the command is coming from slack
router.use((req, res, next) => {
  if (req.body.token === process.env.SLACK_VERIFICATION_TOKEN) return next()
  res.sendStatus(403)
})

/**
 * Receive commands from slack.
 * */
router.route('/')
  .post((req, res, next) => {
    res.send({text: 'Will do, I\'ll get back to you with how it went'})
    let user
    User.findOne({'slack.id': req.body.user_id})
    .then((found) => {
      user = found
      return handleCommand(req.body.command, req.body.text, user)
    })
    .then((response) => {
      return axios({
        method: 'POST',
        url: user.slack.webhookURL,
        headers: {'Content-Type': 'application/json'},
        data: response
      })
    })
    .catch((error) => {
      return axios({
        method: 'POST',
        url: user.slack.webhookURL,
        headers: {'Content-Type': 'application/json'},
        data: {text: 'Something went badly.'}
      })
    })
    .catch((error) => {
      console.log('Cannot respond to slack.')
    })
  })

  /**
   * Choses the right handler for the command.
   */
function handleCommand (command, text, user) {
  switch (command) {
    case '/activate':
      return handler.alarm(text, true, user)
    case '/deactivate':
      return handler.alarm(text, false, user)
    case '/subscribe':
      return handler.subscribe(user)
    case '/subscriptions':
      return handler.subscriptions(user)
    case '/unsubscribe':
      return handler.unsubscribe(user)
    case '/snap':
    break;
    case '/sound':
    break;
    case '/pictures':
    break;
    case '/presence':
    break;
  }
}

// Exports.
module.exports = router