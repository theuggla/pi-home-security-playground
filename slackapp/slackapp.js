// Requires ---------------------------------------------------------------------------------------------------
let express = require('express')
let path = require('path')
let bodyParser = require('body-parser')
let SlackStrategy = require('passport-slack-oauth2').Strategy
let passport = require('passport')
let exphbs = require('express-secure-handlebars')

// Variables
let port = process.env.PORT || 2525
let cwd = __dirname || process.cwd()
let auth = require('./routes/auth')
let db = require('./lib/db-connector')

// Declare server ---------------------------------------------------------------------------------------------
let server = express()

// Config -----------------------------------------------------------------------------------------------------
require('dotenv').config({path: path.join(cwd, '/.env')})

// Auth.
passport.use('slack', new SlackStrategy({
  clientID: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  callbackURL: process.env.URL + '/auth/authenticate/callback'
}, (accessToken, refreshToken, profile, done) => {
  done(null, profile)
}
))

// DB.
db.connect()

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
server.get('/', (req, res, next) => { res.redirect('auth') })
server.use('/auth', auth)

// Server up ---------------------------------------------------------------------------------------------------
server.listen(port, () => { console.log('%s listening at port %s', server.name, port) })
