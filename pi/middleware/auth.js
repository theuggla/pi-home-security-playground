/**
 * Module to authenticate API-keys of requests.
 */

// Requires.
let errs = require('restify-errors')

function auth () {
  return function (req, res, next) {
    if (!req.token) {
      return next(new errs.UnauthorizedError({success: false, message: 'API token missing.'}))
    } else {
      if (req.token !== process.env.API_TOKEN) {
        return next(new errs.ForbiddenError({success: false, message: 'Unauthorized token'}))
      } else {
        return next()
      }
    }
  }
}

module.exports = auth
