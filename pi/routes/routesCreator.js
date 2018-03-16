/**
 * Create routes for the resources.
 */

// Requires.
let RestifyRouter = require('restify-router').Router
let router = new RestifyRouter()
let uuid = require('node-uuid')
let utils = require('../lib/utils')
let errs = require('restify-errors')
let Subscription = require('./../resources/subscriptions')

// Creates routes.
function create (server, model, respond, subscriptions) {
  // Create data arrays if there are none.
  createDefaultData(model.links.properties.resources)
  createDefaultData(model.links.actions.resources)

  // Create the routes.
  createRootRoute(model, respond)
  createModelRoutes(model, respond)
  createPropertiesRoutes(model, respond)
  createActionsRoutes(model, respond)
  createSubscriptionRoutes(subscriptions, respond)

  // Apply the routes.
  router.applyRoutes(server)
}

/**
 *  Returns model overview, includes Link-header.
 * */
function createRootRoute (model, respond) {
  router.get('/', (req, res, next) => {
    // Create response
    req.model = model
    req.type = 'root'

    let fields = ['@id', 'name', 'description', 'tags']
    req.result = utils.extractFields(fields, model)

    // Create Link header
    let type = model['@context']
    let ui = model.links.ui.link

    res.links({
      model: '/model/',
      properties: '/properties/',
      actions: '/actions/',
      ui: ui,
      type: type
    })

    return next()
  }, respond)
}

/**
 * Returns the full model.
 */
function createModelRoutes (model, respond) {
  router.get('/model', (req, res, next) => {
    // Create response
    req.result = model
    req.model = model

    // Create Link header
    let type = model['@context']

    res.links({
      type: type
    })

    return next()
  }, respond)
}

/**
 * Creates routes for getting the property information for all or specific properties.
 */
function createPropertiesRoutes (model, respond) {
  let properties = model.links.properties

  // GET /properties
  router.get(properties.link, (req, res, next) => {
    // Create response
    req.model = model
    req.type = 'properties'
    req.entityId = 'properties'

    req.result = utils.modelToResources(properties.resources, true, false)

    // Create Link header
    let type = 'http://model.webofthings.io/#property-resource'

    res.links({
      type: type
    })

    return next()
  }, respond)

  // GET /properties/{id}
  router.get(properties.link + '/:id', (req, res, next) => {
    // Check that property is available
    if (!properties.resources[req.params.id] || (properties.resources[req.params.id].tags.indexOf('private') !== -1)) return next(new errs.BadRequestError('No such property.'))

    // Create response
    req.model = model
    req.propertyModel = properties.resources[req.params.id]
    req.type = 'property'
    req.entityId = req.params.id

    // Data in chronological order.
    req.result = reverseResults(properties.resources[req.params.id].data)

    // Create link header
    let type = 'http://model.webofthings.io/#property-resource'

    res.links({
      type: type
    })

    return next()
  }, respond)
}

/**
 * Creates routes for getting information about or taking actions against the Thing.
 */
function createActionsRoutes (model, respond) {
  let actions = model.links.actions

  // GET /actions
  router.get(actions.link, (req, res, next) => {
    // Create response
    req.result = utils.modelToResources(actions.resources, true, false)
    req.model = model
    req.type = 'actions'
    req.entityId = 'actions'

    // Create Link header
    let type = 'http://model.webofthings.io/#actions-resource'

    res.links({
      type: type
    })

    return next()
  }, respond)

  // POST /actions/{actionType}
  router.post(actions.link + '/:actionType', (req, res, next) => {
    // Check if action type is available
    if (!actions.resources[req.params.actionType] || (actions.resources[req.params.actionType].tags.indexOf('private') !== -1)) return next(new errs.NotFoundError('No such action.'))

    // Check for required parameters
    if (!checkParameters(actions, req.params.actionType, req.body)) return next(new errs.BadRequestError('Missing parametes.'))

    // Create action
    let action = req.body
    if (!action) action = {}

    action.id = uuid.v1()
    action.status = 'pending'
    action.timestamp = utils.isoTimestamp()
    action.type = req.params.actionType
    action.action = true

    // Push action to actions-array in model.
    let resourceLocation = req.href() + '/' + action.id
    actions.resources[req.params.actionType].data.push(action)
    res.setHeader('location', resourceLocation)

    return next()
  }, respond)

  // GET /actions/{actionType}
  router.get(actions.link + '/:actionType', (req, res, next) => {
    // Check if action type is available
    if (!actions.resources[req.params.actionType] || (actions.resources[req.params.actionType].tags.indexOf('private') !== -1)) return next(new errs.NotFundError('No such action.'))

    // Create response
    req.result = reverseResults(actions.resources[req.params.actionType].data)
    req.actionModel = actions.resources[req.params.actionType]
    req.model = model

    req.type = 'action'
    req.entityId = req.params.actionType

    // Create Link header
    let type = 'http://model.webofthings.io/#actions-resource'

    res.links({
      type: type
    })

    return next()
  }, respond)

  // GET /actions/{actionType}/{actionId}
  router.get(actions.link + '/:actionType/:actionId', (req, res, next) => {
    // Get specific action status
    req.result = utils.findObjectInArray(actions.resources[req.params.actionType].data, {id: req.params.actionId})
    return next()
  }, respond)
}

/**
 * Returns the subscriptions.
 */
function createSubscriptionRoutes (respond) {
  router.get('/subscriptions', (req, res, next) => {
    // Create response
    Subscription.find({})
    .then((subscriptions) => {
      req.result = subscriptions
      return next()
    })
  }, respond)
}

/**
 * Creates data arrays if there are no readings or actions present.
 */
function createDefaultData (resources) {
  Object.keys(resources).forEach((resKey) => {
    let resource = resources[resKey]

    if (!resource.data) {
      resource.data = []
    }
  })
}

/**
 * Reverses a value array for the properties.
 */
function reverseResults (array) {
  return array.slice(0).reverse()
}

/**
 * Checks that all the required parameters are given.
 */
function checkParameters (actions, action, parameters) {
  let result
  if (!actions.resources[action].values) return true

  let params = Object.keys(actions.resources[action].values)
  params.every((param) => {
    if (actions.resources[action].values[param].required === true) {
      result = parameters && parameters[param] !== undefined
      return result
    }
  })

  return result
}

// Exports.
module.exports = create
