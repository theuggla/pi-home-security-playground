/**
 * Router for the auth pages.
 */

// Requires.
let router = require('express').Router()
let axios = require('axios')
let User = require('../models/User')
let https = require('https')

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
      console.log('got event')
      console.log(req.params.event)
      let user
      User.findOne({'slack.id': req.params.user})
      .then((found) => {
        user = found
        return axios({
          method: 'POST',
          url: user.slack.webhookURL,
          headers: {'Content-Type': 'application/json'},
          data: {
            'text': 'Camera has been activated.'
          }
        })
      })
      .then(() => {
        return axios({
          method: 'GET',
          url: process.env.THING_PROXY + '/properties/camera',
          headers: {'authorization': 'Bearer ' + user.proxyJWT},
          httpsAgent: new https.Agent({
            rejectUnauthorized: false
          })
        })
      })
      .then((resp) => {
        let pictureURL = resp.data[0].picture
        let attachments = [
          {
            'fallback': 'Picture taken.',
            'pretext': 'At the present moment:',
            'image_url': process.env.THING_PROXY + pictureURL
          }
        ]

        axios({
          method: 'POST',
          url: user.slack.webhookURL,
          headers: {'Content-Type': 'application/json'},
          data: {
            'attachments': attachments
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
