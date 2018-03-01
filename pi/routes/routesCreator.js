/**
 * Create routes for the resources.
 */

// Requires.
let RestifyRouter = require('restify-router').Router
let router = new RestifyRouter()
let uuid = require('node-uuid')
let utils = require('../lib/utils')

// Creates routes.
function create (server, model) {
  // Create data arrays if there are none.
  createDefaultData(model.links.properties.resources)
  createDefaultData(model.links.actions.resources)

  // Create the routes.
  createRootRoute(model)
  createModelRoutes(model)
  createPropertiesRoutes(model)
  createActionsRoutes(model)

  // Apply the routes.
  router.applyRoutes(server)
}

/**
 *  Returns model overview, includes Link-header.
 * */
function createRootRoute (model) {
  router.get('/', (req, res, next) => {
    // Create response
    req.model = model
    req.type = 'root'

    let fields = ['id', 'name', 'description', 'tags']
    req.result = utils.extractFields(fields, model)

    // Create Link header
    let type = model['@context']

    res.links({
      model: '/model/',
      properties: '/properties/',
      actions: '/actions/',
      ui: '/',
      type: type
    })

    next()
  })
}

/**
 * Returns the full model.
 */
function createModelRoutes (model) {
  router.get('/model', (req, res, next) => {
    // Create response
    req.result = model
    req.model = model

    // Create Link header
    let type = model['@context']

    res.links({
      type: type
    })

    next()
  })
}

/**
 * Creates routes for getting the property information for all or specific properties.
 */
function createPropertiesRoutes (model) {
  let properties = model.links.properties

  // GET /properties
  router.get(properties.link, (req, res, next) => {
    // Create response
    req.model = model
    req.type = 'properties'
    req.entityId = 'properties'

    req.result = utils.modelToResources(properties.resources, true)

    // Create Link header
    let type = 'http://model.webofthings.io/#property-resource'

    res.links({
      type: type
    })

    next()
  })

  // GET /properties/{id}
  router.get(properties.link + '/:id', (req, res, next) => {
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

    next()
  })
}

/**
 * Creates routes for getting information about or taking actions against the Thing.
 */
function createActionsRoutes (model) {
  let actions = model.links.actions

  // GET /actions
  router.get(actions.link, (req, res, next) => {
    // Create response
    req.result = utils.modelToResources(actions.resources, true)
    req.model = model
    req.type = 'actions'
    req.entityId = 'actions'

    // Create Link header
    let type = 'http://model.webofthings.io/#actions-resource'

    res.links({
      type: type
    })

    next()
  })

  // POST /actions/{actionType}
  router.post(actions.link + '/:actionType', (req, res, next) => {
    // Create action
    let action = req.body
    action.id = uuid.v1()
    action.status = 'pending'
    action.timestamp = utils.isoTimestamp()

    // Push action to actions-array in model.
    actions.resources[req.params.actionType].data.push(action)
    res.location(req.originalUrl + '/' + action.id)

    next()
  })

  // GET /actions/{actionType}
  router.get(actions.link + '/:actionType', (req, res, next) => {
    // CReate response
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

    next()
  })

  // GET /actions/{id}/{actionId}
  router.get(actions.link + '/:actionType/:actionId', (req, res, next) => {
    // Get specific action status
    req.result = utils.findObjectInArray(actions.resources[req.params.actionType].data, {id: req.params.actionId})
    next()
  })
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

// Exports.
module.exports = create
