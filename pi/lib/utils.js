/**
 * Module with util-functions.
 */

// Requires.
let _ = require('lodash/collection')

/**
 * Extracts filds from an object and puts them in another object.
 */
function extractFields (fields, object, target) {
  if (!target) {
    target = {}
  }

  for (let i = 0; i < fields.length; i++) {
    let field = fields[i]
    target[field] = object[field]
  }

  return target
}

/**
 * Turns part of the property model into a resource model to return as response to HTTP request.
 * @param {Object} subModel The part of the property model to turn into a resource.
 * @param {boolean} withValue Boolean to indicate wheter to return the latest value of the property.
 */
function modelToResources (subModel, withValue, includePrivate) {
  let resources = []

  Object.keys(subModel).forEach((key) => {
    let value = subModel[key]
    let resource = {}

    if (includePrivate || (value.tags && value.tags.indexOf('private') === -1)) {
      resource.id = key
      resource.name = value['name']

      if (withValue) {
        resource.values = value.data[value.data.length - 1]
      }

      resources.push(resource)
    }
  })

  return resources
}

/**
 * Returns an iso timestamp of now.
 */
function isoTimestamp () {
  var date = new Date()
  return date.toISOString()
}

/**
 * Finds a specific object in an array.
 */
function findObjectInArray (array, filterObj) {
  return _.find(array, filterObj)
}

// Exports.
module.exports = {
  extractFields: extractFields,
  modelToResources: modelToResources,
  isoTimestamp: isoTimestamp,
  findObjectInArray: findObjectInArray
}
