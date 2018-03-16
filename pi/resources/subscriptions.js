/**
 * Module for a moongose Schema over subscriptions.
 */

/**
 * A User model for mongoose.
 */

// Requires.
let mongoose = require('mongoose')
let Schema = mongoose.Schema
let findOrCreate = require('mongoose-find-or-create')

// Schema.
let SubscriptionSchema = new Schema({
  callback: { type: String },
  event: { type: String }
})

SubscriptionSchema.plugin(findOrCreate)

mongoose.model('Subscription', SubscriptionSchema)

// Exports.
module.exports = mongoose.model('Subscription')
