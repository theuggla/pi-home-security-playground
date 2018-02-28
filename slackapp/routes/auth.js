/**
 * Router for the auth pages.
 */

// Requires.
let router = require('express').Router()
let passport = require('passport')
let axios = require('axios')
let querystring = require('querystring')

// Routes--------------------------------------------------------------------------------------------------------

/**
 * Render authentication view.
 * */
router.route('/')
    .get((req, res, next) => { res.render('authenticate', {link: process.env.URL}) })

/**
 * Authenticate against slack.
 * */
router.route('/auth/authenticate')
    .get(passport.authenticate('slack', { session: false }))

/**
 * Confirm slack authentication and authorize user.
 * */
router.route('/auth/authenticate/callback')
    .get(passport.authenticate('slack', { session: false }), (req, res, next) => {
        // check if id is allowed to install. if yes, redirect to install, if no render fail.
      res.render('authorize', {link: process.env.URL, state: process.env.SLACK_STATE})
    }
  )

/**
 * Confirm user authorization of app.
 * */
router.route('/auth/authorize/callback')
    .get((req, res, next) => {
      if (req.query && (req.query.state === process.env.SLACK_STATE)) {
        let query = querystring.stringify({ redirect_uri: process.env.URL + '/auth/authorize/callback', client_id: process.env.CLIENT_ID, client_secret: process.env.CLIENT_SECRET, code: req.query.code })
        axios.post('https://slack.com/api/oauth.access', query, {headers: {'Content-Type': 'application/x-www-form-urlencoded'}})
        .then((response) => {
          console.log(response.data)
          res.render('success')
        })
      }
    })

// Exports.
module.exports = router
