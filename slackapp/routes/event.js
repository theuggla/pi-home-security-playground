/**
 * Router for the auth pages.
 */

// Requires.
let router = require('express').Router()
let axios = require('axios')
let User = require('../models/User')

// Routes--------------------------------------------------------------------------------------------------------

/**
 * Send out a webhook event to the slack channel
 * */
router.route('/:event/:user')
    .get((req, res, next) => {
      console.log('someone is breaking in!')
      axios({
        method: 'POST',
        url: 'https://hooks.slack.com/services/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',
        headers: {'Content-Type': 'application/json'},
        data: {
          'text': 'Someone is breaking in!'
        }
      })
    })

// Exports.
module.exports = router
