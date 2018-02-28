/**
 * Module to authorize and authenticate the user.
 */

// Requires.
let access = require('../config/access-control.json')
let jwt = require('../lib/jwt')
let err = require('restify-errors')

function jwtAuth () {
  return function (req, res, next) {
    if (isOpen(req.path())) {
      return next()
    } else {
      console.log(req.token)
      if (!req.token) {
        return next(new err.UnauthorizedError({success: false, message: 'API token missing.'}))
      } else {
        jwt.verify(req.token)
        .then((result) => {
          checkUserAccess(result, req.path(), (err, user) => {
            if (err) {
              return next(new err.ForbiddenError({success: false, message: err}))
            }
            return next()
          })
        })
        .catch((error) => {
          return next(new err.ForbiddenError({success: false, message: error.message}))
        })
      }
    }
  }
};

function checkUserAccess (token, path, callback) {
  let errorMessage = 'Not authorized for this resource!'
  let userAccess = findInAccessList((authorizedUser) => {
    return authorizedUser.token === token && authorizedUser.resources.indexOf(path) !== -1
  })

  if (userAccess) {
    callback(null, userAccess)
  } else {
    callback(errorMessage, null)
  }
}

function findInAccessList (filter) {
  return access.protected.filter(filter)[0]
}

function isOpen (path) {
  return (access.open.indexOf(path) !== -1)
}

function isUserAuthorized (socialUserId) {
  let result = findInAccessList((authorizedUser) => {
    return authorizedUser.uid === socialUserId
  })

  if (result) {
    return true
  } else {
    return false
  }
}

function getJWTToken (socialUserId) {
  return jwt.create(socialUserId)
}

module.exports = {
  jwtAuth: jwtAuth,
  isUserAuthorized: isUserAuthorized,
  getJWTToken: getJWTToken
}
