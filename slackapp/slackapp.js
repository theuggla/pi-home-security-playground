// Requires ---------------------------------------------------------------------------------------------------
let express = require('express')
let path = require('path')
let bodyParser = require('body-parser')
let SlackStrategy = require('passport-slack-oauth2').Strategy
let passport = require('passport')
let exphbs = require('express-secure-handlebars')
let axios = require('axios')
let querystring = require('querystring');

// Variables
let port = process.env.PORT || 2525
let cwd = __dirname || process.cwd()

// Declare server ---------------------------------------------------------------------------------------------
let server = express()

// Config -----------------------------------------------------------------------------------------------------
require('dotenv').config({path: path.join(cwd, '/.env')})

passport.use('slack', new SlackStrategy({
  clientID: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  callbackURL: process.env.URL + '/auth/authenticate/callback'
}, (accessToken, refreshToken, profile, done) => {
  done(null, profile)
}
))

passport.use('slack-auth', new SlackStrategy({
  clientID: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  callbackURL: process.env.URL + '/auth/authorize/callback',
  skipUserProfile: true,
  scope: ['commands', 'incoming-webhook']
}, (accessToken, refreshToken, profile, done) => {
  done(null, profile)
}
))

// View engine.
server.engine('.hbs', exphbs({
  defaultLayout: 'main',
  extname: '.hbs'
}))
server.set('view engine', '.hbs')

// Middleware -------------------------------------------------------------------------------------------------
// Parse requests
server.use(bodyParser.json())
server.use(bodyParser.urlencoded({ extended: true }))

// Passport
server.use(passport.initialize())

// Routes ------------------------------------------------------------------------------------------------------
server.get('/', (req, res, next) => { res.render('authenticate', {link: process.env.URL}) })

server.get('/auth/authenticate', passport.authenticate('slack', { session: false }))

server.get('/auth/authenticate/callback',
  passport.authenticate('slack', { session: false }),
  (req, res) => {
    // check if id is allowed to install. if yes, redirect to install, if no render fail.
    res.render('authorize', {link: process.env.URL})
  }
)

server.get('/auth/authorize/callback',
  (req, res) => {
    if (req.query && req.query.code) {
      let query = querystring.stringify({ redirect_uri: process.env.URL + '/auth/authorize/callback', client_id: process.env.CLIENT_ID, client_secret: process.env.CLIENT_SECRET, code: req.query.code })
      axios.post('https://slack.com/api/oauth.access', query, {headers: {'Content-Type': 'application/x-www-form-urlencoded'}})
      .then((response) => {
        console.log(response.data)
        res.render('success')
      })
    }
  })

// Server up ---------------------------------------------------------------------------------------------------
server.listen(port, () => { console.log('%s listening at port %s', server.name, port) })
