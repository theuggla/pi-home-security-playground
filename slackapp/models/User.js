/**
 * A User model for mongoose.
 */

// Requires.
let mongoose = require('mongoose')
let Schema = mongoose.Schema
let findOrCreate = require('mongoose-find-or-create')

// Schema.
let UserSchema = new Schema({
  slack: {
    id: {type: String},
    accessToken: {type: String},
    webhookURL: {type: String},
    channel: {type: String}
  },
  proxyJWT: { type: String }
})

UserSchema.plugin(findOrCreate)

mongoose.model('User', UserSchema)

// Exports.
module.exports = mongoose.model('User')
