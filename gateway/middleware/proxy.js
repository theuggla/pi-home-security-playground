/**
 * Module to proxy requests to Things.
 */

// Requires.
let fs = require('fs')
let pi = require('../config/access-control.json').things[0]
let httpProxy = require('http-proxy')
let path = require('path')
let cwd = __dirname || process.cwd()

// Create server.
let proxyServer = httpProxy.createProxyServer({
  ssl: {
    key: fs.readFileSync(path.resolve(cwd, '../certs/sslkey.pem')),
    cert: fs.readFileSync(path.resolve(cwd, '../certs/sslcert.pem')),
    passphrase: process.env.CERT_PASSPHRASE
  },
  secure: false
})

// Export proxy function.
module.exports = function () {
  return function proxy (req, res, next) {
    req.headers['authorization'] = ('Bearer ' + pi.token)
    proxyServer.web(req, res, {target: pi.url})
  }
}
