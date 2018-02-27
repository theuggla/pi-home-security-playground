// Requires ---------------------------------------------------------------------------------------------------
let restify = require('restify')
let fs = require('fs')
let path = require('path')

// middleware
let corsMiddleware = require('restify-cors-middleware')
let plugins = require('restify').plugins
let proxy = require('./middleware/proxy.js')

// variables
let port = process.env.PORT || 2323
let cwd = __dirname || process.cwd()

// Config -----------------------------------------------------------------------------------------------------
require('dotenv').config()

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
// CORS
server.pre(cors.preflight)
server.use(cors.actual)

// JSON
server.use(plugins.jsonBodyParser())

//
server.use(proxy())

// Routes ------------------------------------------------------------------------------------------------------
server.get('/', (req, res, next) => { res.send({hello: 'from gateway'}); console.log('got request') })

// Server up ---------------------------------------------------------------------------------------------------
server.listen(port, () => { console.log('%s listening at %s', server.name, server.url) })
