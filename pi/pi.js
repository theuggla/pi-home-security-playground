// Requires ---------------------------------------------------------------------------------------------------
let restify = require('restify')
let fs = require('fs')
let path = require('path')
let bearerToken = require('express-bearer-token')
let cors = require('cors')
let createRoutes = require('./routes/routesCreator')
let respond = require('./routes/responseHandler')()
let model = require('./resources/model')
let initPlugins = require('./plugins/plugins')

// Middleware
let restifyPlugins = require('restify').plugins
let auth = require('./middleware/auth')
let webhook = require('./middleware/webhook')
let linkHeader = require('restify-links')

// Variables
let port = process.env.PORT || 2424
let cwd = __dirname || process.cwd()

// Config -----------------------------------------------------------------------------------------------------
require('dotenv').config({path: path.join(cwd, '/.env')})

let httpsServerOptions = {
  key: fs.readFileSync(path.resolve(cwd, './certs/sslkey.pem')),
  cert: fs.readFileSync(path.resolve(cwd, './certs/sslcert.pem')),
  passphrase: process.env.CERT_PASSPHRASE
}

// Declare server ---------------------------------------------------------------------------------------------
let server = restify.createServer({
  httpsServerOptions: httpsServerOptions,
  name: 'pi-security-system'
})

// Middleware -------------------------------------------------------------------------------------------------

// Clean up route
server.pre(restifyPlugins.pre.dedupeSlashes())

// JSON
server.pre(restifyPlugins.jsonBodyParser())

// CORS
server.pre(cors())

// Link header
server.pre(linkHeader())

// Log
server.pre((req, res, next) => { console.log(req.method + ' ' + req.url); next() })

// Authorize
server.use(bearerToken())
server.use(auth())
server.use(webhook())

// Routes ------------------------------------------------------------------------------------------------------
createRoutes(server, model, respond)

// Plugins -----------------------------------------------------------------------------------------------------
initPlugins()

// Server up ---------------------------------------------------------------------------------------------------
server.listen(port, () => { console.log('%s listening at %s', server.name, server.url) })
