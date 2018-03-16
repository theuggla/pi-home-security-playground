// Requires ---------------------------------------------------------------------------------------------------
let restify = require('restify')
let fs = require('fs')
let path = require('path')
let err = require('restify-errors')

// middleware
let corsMiddleware = require('restify-cors-middleware')
let plugins = require('restify').plugins
let auth = require('./middleware/auth')
let proxy = require('./middleware/proxy')
let bearerToken = require('express-bearer-token')

// variables
let port = process.env.PORT || 2424
let cwd = __dirname || process.cwd()

// Config -----------------------------------------------------------------------------------------------------
require('dotenv').config({path: path.join(cwd, '/.env')})

let httpsServerOptions = {
  key: fs.readFileSync(path.resolve(cwd, './certs/sslkey.pem')),
  cert: fs.readFileSync(path.resolve(cwd, './certs/sslcert.pem')),
  passphrase: process.env.CERT_PASSPHRASE
}

let cors = corsMiddleware({
  preflightMaxAge: 5,
  origins: ['*']
})

// Declare server ---------------------------------------------------------------------------------------------
let server = restify.createServer({
  name: 'security-gateway',
  httpsServerOptions: httpsServerOptions
})

// Middleware -------------------------------------------------------------------------------------------------

// Log
server.pre((req, res, next) => { console.log(req.method + ' ' + req.url); next() })

// Clean up route
server.pre(plugins.pre.dedupeSlashes())

// CORS
server.pre(cors.preflight)
server.use(cors.actual)

// Authorize
server.pre(bearerToken())
server.use(auth.jwtAuth())

// Routes ------------------------------------------------------------------------------------------------------

// Authorize
server.post('/authorize', plugins.jsonBodyParser(), (req, res, next) => {
  if (auth.isUserAuthorized(req.body.id)) {
    let jwt = auth.getJWTToken(req.body.id)
    res.header('Authorization', 'Bearer ' + jwt)
    res.send()
  } else {
    next(new err.ForbiddenError())
  }
})

// Proxy
server.get(/.*/, proxy())
server.post(/.*/, proxy())

// Server up ---------------------------------------------------------------------------------------------------
server.listen(port, () => { console.log('%s listening at %s', server.name, server.url) })
