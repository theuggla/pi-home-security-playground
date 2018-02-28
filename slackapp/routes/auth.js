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
          console.log(req.user.id)
          console.log(parse(response))
          // spara jwt + userid i database
          return res.render('authorize', {link: process.env.URL, state: process.env.SLACK_STATE})
        }
      })
      .catch((error) => {
        if (error.response.status === 403) {
          return res.render('unauth')
        }
      })
    }
  )

/**
 * Confirm user authorization of app.
 * */
router.route('/authorize/callback')
    .get((req, res, next) => {
      if (req.query && (req.query.state === process.env.SLACK_STATE)) {
        let query = querystring.stringify({ redirect_uri: process.env.URL + '/auth/authorize/callback', client_id: process.env.CLIENT_ID, client_secret: process.env.CLIENT_SECRET, code: req.query.code })
        axios.post('https://slack.com/api/oauth.access', query, {headers: {'Content-Type': 'application/x-www-form-urlencoded'}})
        .then((response) => {
          console.log(response.data)
          //spara undan användare
          return res.render('success')
        })
      }
    })

// Exports.
module.exports = router
