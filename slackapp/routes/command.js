/**
 * Router for the auth pages.
 */

// Requires.
let router = require('express').Router()

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
    console.log('got command:')
    console.log(req.body)
    res.send({text: 'Hurrah'})
  })

// Exports.
module.exports = router
