/**
 * Module to send the response, can be extended to handle different response types.
 */

/**
 * Responds with the response.
 */
function handleResponse () {
  return function (req, res, next) {
    if (req.result) {
      req.rooturl = req.headers.host

      return res.send(req.result)
    } else if (res.location) {
      return res.send(204)
    } else {
      next()
    }
  }
}

// Exports.
module.exports = handleResponse
