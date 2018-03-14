/**
 * Router for the auth pages.
 */

// Requires.
let router = require('express').Router()

// Routes--------------------------------------------------------------------------------------------------------

/**
 * Render authentication view.
 * */
router.route('/')
  .post((req, res, next) => {
    console.log('got command:')
    console.log(req.body)
    res.send({text: 'Hurrah'})
  })

// Exports.
module.exports = router
