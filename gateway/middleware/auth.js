/**
 * Module to authorize and authenticate the user.
 */

// Requires.
let access = require('../config/access-control.json')
let jwt = require('../lib/jwt')
let err = require('restify-errors')

/*
*Authorizes a users JWT against the path they are accessing
*/
function jwtAuth () {
  return function (req, res, next) {
    if (isOpen(req.path())) {
      return next()
    } else if (isSlackForImagePath(req.path(), req.header('user-agent'))) {
      return next()
    } else {
      if (!req.token) {
        return next(new err.UnauthorizedError({success: false, message: 'API token missing.'}))
      } else {
        jwt.verify(req.token)
        .then((result) => {
          checkUserAccess(result, req.path(), (err, user) => {
            if (err) {
              return next(new err.ForbiddenError({success: false, message: 'Unauthorized for that route'}))
            }
            return next()
          })
        })
        .catch(() => {
          return next(new err.ForbiddenError({success: false, message: 'Unverified JWT'}))
        })
      }
    }
  }
};

/*
*Checks if the user is authorized to access the path.
*/
function checkUserAccess (token, path, callback) {
  let errorMessage = 'Not authorized for this resource!'
  let paths = path.split('/')
  let concatPath = ''

  let userAccessProper = findInAccessList((authorizedUser) => {
    return (authorizedUser.uid === token) && (authorizedUser.resources.indexOf(path) !== -1)
  })

  let userAccessWildcard = findInAccessList((authorizedUser) => {
    return (authorizedUser.uid === token) && (paths.filter((pathway) => {
      let wildcardPath = concatPath + pathway + '/*'
      let wildcardPresent = authorizedUser.resources.indexOf(wildcardPath) !== -1
      concatPath += pathway + '/'
      return wildcardPresent
    })[0])
  })

  if (userAccessProper || userAccessWildcard) {
    callback(null, userAccessProper || userAccessWildcard)
  } else {
    callback(errorMessage, null)
  }
}

/*
*Finds something in the access list.
*/
function findInAccessList (filter) {
  return access.protected.filter(filter)[0]
}

/*
*Checks if the path is open.
*/
function isOpen (path) {
  return (access.open.indexOf(path) !== -1)
}

/**
 * Check if it is the slack bot enquiring for an image
 */
function isSlackForImagePath (path, agent) {
  return path.indexOf('images/') !== -1 && agent.indexOf('Slackbot 1.0') !== -1
}

/*
*Checks if the user is in the access list.
*/
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

/*
*Returnesa signed JWT for the user.
*/
function getJWTToken (socialUserId) {
  return jwt.create(socialUserId)
}

// Exports.
module.exports = {
  jwtAuth: jwtAuth,
  isUserAuthorized: isUserAuthorized,
  getJWTToken: getJWTToken
}
