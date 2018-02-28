// Requires ---------------------------------------------------------------------------------------------------
let express = require('express')
let path = require('path')
let bodyParser = require('body-parser')
let SlackStrategy = require('passport-slack').Strategy
let passport = require('passport')
let exphbs = require('express-secure-handlebars')

// Variables
let port = process.env.PORT || 2525
let cwd = __dirname || process.cwd()

// Declare server ---------------------------------------------------------------------------------------------
let server = express()

// Config -----------------------------------------------------------------------------------------------------
require('dotenv').config({path: path.join(cwd, '/.env')})

passport.use('authenticate-slack', new SlackStrategy({
  clientID: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET
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
server.get('/', (req, res, next) => { res.render('authenticate', {link: process.env.URL}); console.log('got request in slackbot') })

server.get('/auth/authenticate', passport.authorize('authenticate-slack'))

server.get('/auth/authenticate/callback',
  passport.authorize('authenticate-slack'),
  (req, res) => { 
    //check if id is allowed to install. if yes, redirect to install, if no render fail.
    res.redirect('/') 
  }
)

// Server up ---------------------------------------------------------------------------------------------------
server.listen(port, () => { console.log('%s listening at port %s', server.name, port) })
