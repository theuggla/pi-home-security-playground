/**
 * Router for the auth pages.
 */

// Requires.
let router = require('express').Router()
let axios = require('axios')
let User = require('../models/User')

// Routes--------------------------------------------------------------------------------------------------------

// Verify that the event is coming from the Thing
router.use((req, res, next) => {
  if (req.body.token === process.env.SELF_VERIFICATION_TOKEN) return next()
  res.sendStatus(403)
})

/**
 * Send out a webhook event to the slack channel
 * */
router.route('/:event/:user')
    .post((req, res, next) => {
      User.findOne({'slack.id': req.params.user})
      .then((user) => {
        axios({
          method: 'POST',
          url: user.slack.webhookURL,
          headers: {'Content-Type': 'application/json'},
          data: {
            'text': 'Someone is breaking in!'
          }
        })
      })
      .catch((error) => {
        console.log(error)
      })

      return res.sendStatus(200)
    })

// Exports.
module.exports = router
