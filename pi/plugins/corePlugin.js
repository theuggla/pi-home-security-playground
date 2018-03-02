/**
 * Module for core-plugin, to be extended by actual plugins.
 * Support for simulations.
 */

// Requires.
let utils = require('./../lib/utils.js')
let util = require('util')
let resources = require('./../resources/model')
let eventChannel = require('./../lib/eventChannel')

// Class.
class CorePlugin {
  /**
 * params: e.g., {'simulate': false, 'frequency': 5000};
 * propertyId: the name of the Web Thing Model property covered by the sensor/actuator
 * doStop: function to invoke to stop the plugin, on top of what the Core Plugin provides
 * doSimulate: function to invoke to simulate a new value, on top of what the Core Plugin provides
 * actionIds: an Array of Actions to observe, e.g., ['ledState'], this is only for Actuators
 * doAction: this will be invoked when an observed Action happens, this is only for Actuators
 */
  constructor (params, propertyId, actionsIds) {
    if (params) {
      this._params = params
    } else {
      this._params = {'simulate': false, 'frequency': 5000}
    }

    this._actions = actionsIds
    this._model = resources.links.properties.resources[propertyId]
  }

  /**
   * If there are actions registred for this plugin, start observing them.
   * If simulate is true, start simulation, otherwise connect to hardware.
   */
  start () {
    if (this._actions) this.observeActions()

    if (this._params.simulate) {
      this.simulate()
    } else {
      this.connectHardware()
    }

    if (this.doStart) this.doStart()

    console.info('[plugin started] %s', this._model.name)
  }

  /**
   * If simulate is true, clear the simulation interval.
   * Otherwise, if there is a stop-function registred, invoke it.
   */
  stop () {
    if (this._params.simulate) {
      clearInterval(this._interval)
    } else {
      if (this.doStop) this.doStop()
    }

    console.info('[plugin stopped] %s', this._model.name)
  }

  /**
   * Start smulation.
   * Do the registred simulation at the stipulated interval.
   */
  simulate () {
    this._interval = setInterval(() => {
      this.doSimulate()
      this.showValue()
    }, this._params.frequency)

    console.info('[simulator started] %s', this._model.name)
  }

  /**
   * Connects to the hardware, should be implemented by the extended plugin.
   */
  connectHardware () {
    throw new Error('connectedHardware() should be implemented by Plugin')
  }

  /**
   * Logs the latest value for the plugin, read from the model.
   */
  showValue () {
    console.info('Current value for %s is %s', this._model.name, util.inspect(this._model.data[this._model.data.length - 1]))
  }

  /**
   * Observes if the action-model for this plugin changes, and if so, calls the registred doAction-function
   * with that action.
   */
  observeActions () {
    this._actions.forEach((actionId) => {
      let event = actionId + 'Change'
      eventChannel.on(event, (action) => {
        console.info('[plugin action detected] %s', actionId)
        if (this.doAction) this.doAction(action)
      })
    })
  }

  /**
   * Creates a suitable value for the plugin with the provided data.
   */
  createValue (data) {
    throw new Error('createValue(data) should be implemented by Plugin')
  }

  /**
   * Sets the value of the plugin in the model with the provided data.
   */
  addValue (data) {
    utils.cappedPush(this._model.data, this.createValue(data))
  }
}

// Exports.
module.exports = CorePlugin
