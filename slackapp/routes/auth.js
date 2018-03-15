/**
 * Router for the auth pages.
 */

// Requires.
let router = require('express').Router()
let passport = require('passport')
let axios = require('axios')
let querystring = require('querystring')
let https = require('https')
let parse = require('parse-bearer-token')
let User = require('../models/User')

// Routes--------------------------------------------------------------------------------------------------------

/**
 * Render authentication view.
 * */
router.route('/')
    .get((req, res, next) => { res.render('authenticate', {link: process.env.URL}) })

/**
 * Authenticate against slack.
 * */
router.route('/authenticate')
    .get(passport.authenticate('slack', { session: false }))

/**
 * Confirm slack authentication and authorize user.
 * */
router.route('/authenticate/callback')
    .get(passport.authenticate('slack', { session: false }), (req, res, next) => {
      axios.post(process.env.THING_PROXY + '/authorize', {id: req.user.id}, {
        httpsAgent: new https.Agent({
          rejectUnauthorized: false
        })
      })
      .then((response) => {
        if (response.headers.authorization) {
          User.findOrCreate({'slack.id': req.user.id}, {'slack.id': req.user.id, proxyJWT: parse(response)}, (err, result) => {
            if (err) {
              return res.send(500)
            }
            return res.render('authorize', {link: process.env.URL, state: process.env.SLACK_STATE})
          })
        }
      })
      .catch((error) => {
        if (error.response && error.response.status === 403) {
          return res.render('unauth')
        } else {
          return res.send(500)
        }
      })
    }
  )

/**
 * Confirm user authorization of app against slack and recieve access token.
 * */
router.route('/authorize/callback')
    .get((req, res, next) => {
      if (req.query && (req.query.state === process.env.SLACK_STATE)) {
        let query = querystring.stringify({ redirect_uri: process.env.URL + '/auth/authorize/callback', client_id: process.env.CLIENT_ID, client_secret: process.env.CLIENT_SECRET, code: req.query.code })
        axios.post('https://slack.com/api/oauth.access', query, {headers: {'Content-Type': 'application/x-www-form-urlencoded'}})
        .then((response) => {
          User.findOrCreate({'slack.id': response.data.user_id}, {'slack.id': response.data.user_id, 'slack.accessToken': response.data.access_token, 'slack.webhookURL': response.data.incoming_webhook.url, 'slack.channel': response.data.incoming_webhook.channel}, (err, user) => {
            if (err) {
              return res.send(500)
            }
            axios.get({
              url: process.env.THING_PROXY + '/actions/takePicture',
              headers: {
                'upgrade': 'webhook',
                'callback': process.env.URL + '/event/picture/' + response.data.user_id,
                'authorization': user.proxyJWT
              }
            })
            .then(() => {
              return res.render('success')
            })
            .catch(() => {
              return res.send(500)
            })
          })
        })
        .catch(() => {
          return res.send(500)
        })
      } else {
        return res.send(500)
      }
    })

// Exports.
module.exports = router
