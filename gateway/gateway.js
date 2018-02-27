// Requires ---------------------------------------------------------------------------------------------------
let restify = require('restify')
let fs = require('fs')

// middleware
let corsMiddleware = require('restify-cors-middleware')
let plugins = require('restify').plugins

// variables
let port = process.env.PORT || 2323

// Config -----------------------------------------------------------------------------------------------------
require('dotenv').config()

let httpsServerOptions = {
  key: fs.readFileSync('./certs/sslkey.pem'),
  cert: fs.readFileSync('./certs/sslcert.pem'),
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
// CORS
server.pre(cors.preflight)
server.use(cors.actual)

// JSON
server.use(plugins.jsonBodyParser())

// Routes ------------------------------------------------------------------------------------------------------
server.get('/', (req, res, next) => { res.send({hello: 'from gateway'}); console.log('got request') })

// Server up ---------------------------------------------------------------------------------------------------
server.listen(port, () => { console.log('%s listening at %s', server.name, server.url) })
