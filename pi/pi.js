// Requires ---------------------------------------------------------------------------------------------------
let restify = require('restify')
let fs = require('fs')

// middleware
let plugins = require('restify').plugins

// variables
let port = process.env.PORT || 2424

// Config -----------------------------------------------------------------------------------------------------
require('dotenv').config()

let httpsServerOptions = {
  key: fs.readFileSync('./certs/sslkey.pem'),
  cert: fs.readFileSync('./certs/sslcert.pem'),
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

// Routes ------------------------------------------------------------------------------------------------------
server.get('/', (req, res, next) => { res.send({hello: 'from pi'}); console.log('got request in pi') })

// Server up ---------------------------------------------------------------------------------------------------
server.listen(port, () => { console.log('%s listening at %s', server.name, server.url) })
