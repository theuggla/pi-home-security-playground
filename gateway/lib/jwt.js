/**
 * Module to sign jwt:s containing the user information.
 */

// Requires.
let jwt = require('jsonwebtoken')

/**
 * Create a JWT.
 */
function create (id) {
  let payload = {id: id}
  return jwt.sign(payload, process.env.JWT_SECRET)
}

/**
 * Verify a JWT.
 */
function verify (token) {
  return new Promise((resolve, reject) => {
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) reject(err)

      resolve(decoded.id)
    })
  })
}

// Exports.
module.exports = {
  create: create,
  verify: verify
}
