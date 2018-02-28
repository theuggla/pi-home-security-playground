// Requires ---------------------------------------------------------------------------------------------------
let restify = require('restify')
let fs = require('fs')
let path = require('path')

// middleware
let plugins = require('restify').plugins

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

// Declare server ---------------------------------------------------------------------------------------------
let server = restify.createServer({
  httpsServerOptions: httpsServerOptions,
  name: 'pi-security-system'
})

// Middleware -------------------------------------------------------------------------------------------------
// JSON
server.use(plugins.jsonBodyParser())

// Routes ------------------------------------------------------------------------------------------------------
server.get('/properties', (req, res, next) => { res.send({hello: 'from pi properties'}); console.log('got properties request in pi') })

// Server up ---------------------------------------------------------------------------------------------------
server.listen(port, () => { console.log('%s listening at %s', server.name, server.url) })
