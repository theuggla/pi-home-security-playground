// Requires ---------------------------------------------------------------------------------------------------
let restify = require('restify')
let fs = require('fs')
let path = require('path')
let bearerToken = require('express-bearer-token')
let cors = require('cors')
let createRoutes = require('./routes/routesCreator')
let model = require('./resources/model')

// Middleware
let plugins = require('restify').plugins
let auth = require('./middleware/auth')

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

// JSON
server.use(plugins.jsonBodyParser())

// CORS
server.use(cors())

// Log
server.use((req, res, next) => { console.log(req.url); next() })

// Authorize
server.use(bearerToken())
server.use(auth())

// Routes ------------------------------------------------------------------------------------------------------
createRoutes(server, model)

// Server up ---------------------------------------------------------------------------------------------------
server.listen(port, () => { console.log('%s listening at %s', server.name, server.url) })
