/**
 * Handler for the commands.
 */

// Requires.
let axios = require('axios')
let https = require('https')

/**
 * Activates the alarm if the given code is correct.
 */
function alarm (code, state, user) {
  return new Promise((resolve, reject) => {
    let response = {}

    axios({
      method: 'POST',
      url: process.env.THING_PROXY + '/actions/alarmState',
      headers: {'authorization': 'Bearer ' + user.proxyJWT},
      httpsAgent: new https.Agent({
        rejectUnauthorized: false
      }),
      data: {
        state: state,
        code: code
      }
    })
    .then((resp) => {
      return axios({
        method: 'GET',
        url: process.env.THING_PROXY + resp.headers.location,
        headers: {'authorization': 'Bearer ' + jwt},
        httpsAgent: new https.Agent({
          rejectUnauthorized: false
        })
      })
    })
    .then((result) => {
      if (result.data.status !== 'rejected') {
        response.text = 'The alarm is ' + (state ? 'on' : 'off') + '.'
      } else {
        response.text = 'Wrong code.'
      }
      resolve(response)
    })
    .catch((error) => {
      response.text = 'It went badly.'
      reject(response)
    })
  })
}

/**
 * Subscribes the user to the picture event.
 */
function subscribe (user) {
  return new Promise((resolve, reject) => {
    let response = {}

    axios({
      method: 'GET',
      url: process.env.THING_PROXY + '/actions/takePicture',
      headers: {'authorization': 'Bearer ' + user.proxyJWT, 'upgrade': 'webhook', 'callback': process.env.URL + '/event/picture/' + user.slack.id},
      httpsAgent: new https.Agent({
        rejectUnauthorized: false
      })
    })
    .then(() => {
      response.text = 'You will be notified when the camera takes a picture.'
      resolve(response)
    })
    .catch(() => {
      response.text = 'Something went wrong with your subscription.'
      resolve(response)
    })
  })
}

/**
 * Returns the currently subscribed users.
 */
function subscriptions (user) {
  return new Promise((resolve, reject) => {
    let response = {}

    axios({
      method: 'GET',
      url: process.env.THING_PROXY + '/subscriptions',
      headers: {'authorization': 'Bearer ' + user.proxyJWT},
      httpsAgent: new https.Agent({
        rejectUnauthorized: false
      })
    })
    .then((resp) => {
      let subscribers = (resp.data.length === 0)
      ? 'No currently subscribed users.'
      : resp.data.map((sub) => {
        let callbackArray = sub.callback.split('/')
        let userID = callbackArray[(callbackArray.length - 1)]
        return userID
      }).join(', ')

      response.text = 'Current subscribers: ' + subscribers
      resolve(response)
    })
    .catch(() => {
      response.text = 'Couldn\'t get subscriptions.'
      resolve(response)
    })
  })
}

/**
 * Unsubscribes the user to the picture event.
 */
function unsubscribe (user) {
  return new Promise((resolve, reject) => {
    let response = {}

    axios({
      method: 'GET',
      url: process.env.THING_PROXY + '/actions/takePicture',
      headers: {'authorization': 'Bearer ' + user.proxyJWT, 'downgrade': 'webhook', 'callback': process.env.URL + '/event/picture/' + user.slack.id},
      httpsAgent: new https.Agent({
        rejectUnauthorized: false
      })
    })
    .then(() => {
      response.text = 'You have been unsubscribed.'
      resolve(response)
    })
    .catch(() => {
      response.text = 'Something went wrong with unsubscribing you.'
      resolve(response)
    })
  })
}

module.exports = {
  alarm: alarm,
  subscribe: subscribe,
  subscriptions: subscriptions,
  unsubscribe: unsubscribe
}
