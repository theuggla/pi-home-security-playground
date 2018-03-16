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
        headers: {'authorization': 'Bearer ' + user.proxyJWT},
        httpsAgent: new https.Agent({
          rejectUnauthorized: false
        })
      })
    })
    .then((result) => {
      if (result.data.status === 'completed') {
        response.text = 'The alarm is ' + (state ? 'on' : 'off') + '.'
      } else if (result.data.status === 'pending') {
        response.text = 'Alarm is a bit slow to respond, I\'ll get back to you in a while.'
      } else {
        response.text = 'Wrong code.'
      }
      resolve(response)
    })
    .catch(() => {
      response.text = 'It went badly.'
      reject(response)
    })
  })
}

/**
 * Takes a picture.
 */
function snap (user) {
  return new Promise((resolve, reject) => {
    let response = {}

    axios({
      method: 'POST',
      url: process.env.THING_PROXY + '/actions/takePicture',
      headers: {'authorization': 'Bearer ' + user.proxyJWT},
      httpsAgent: new https.Agent({
        rejectUnauthorized: false
      })
    })
    .then((resp) => {
      response.text = 'You have taken a picture.'
      resolve(response)
    })
    .catch(() => {
      response.text = 'It went badly.'
      reject(response)
    })
  })
}

/**
 * Turns the sound on or off
 */
function sound (command, user) {
  return new Promise((resolve, reject) => {
    let response = {}

    if (command !== 'on' && command !== 'off') {
      response.text = 'Say on or off.'
      resolve(response)
    }

    let state = command === 'on'

    axios({
      method: 'POST',
      url: process.env.THING_PROXY + '/actions/soundState',
      headers: {'authorization': 'Bearer ' + user.proxyJWT},
      httpsAgent: new https.Agent({
        rejectUnauthorized: false
      }),
      data: {
        state: state
      }
    })
    .then((resp) => {
      response.text = 'The sound has been turned ' + (state ? 'on' : 'off') + '.'
      resolve(response)
    })
    .catch(() => {
      response.text = 'It went badly.'
      reject(response)
    })
  })
}

/**
 * Returns the latest pictures taken.
 */
function pictures (user) {
  return new Promise((resolve, reject) => {
    let response = {}

    axios({
      method: 'GET',
      url: process.env.THING_PROXY + '/properties/camera',
      headers: {'authorization': 'Bearer ' + user.proxyJWT},
      httpsAgent: new https.Agent({
        rejectUnauthorized: false
      })
    })
    .then((resp) => {
      let attachments = []
      console.log(resp.data)

      for (let i = 0; i < resp.data.length && i < 10; i++) {
        attachments.push({
          'fallback': 'Picture taken.',
          'pretext': 'At ' + resp.data[i].timestamp + ':',
          'image_url': process.env.THING_PROXY + resp.data[i].picture
        })
      }

      response.text = 'Latest pictures: '
      response.attachments = attachments

      resolve(response)
    })
    .catch(() => {
      response.text = 'It went badly.'
      reject(response)
    })
  })
}

/**
 * Returns the latest presence recordings.
 */
function presence (user) {
  return new Promise((resolve, reject) => {
    let response = {}

    axios({
      method: 'GET',
      url: process.env.THING_PROXY + '/properties/pir',
      headers: {'authorization': 'Bearer ' + user.proxyJWT},
      httpsAgent: new https.Agent({
        rejectUnauthorized: false
      })
    })
    .then((resp) => {
      let makePretty = ''

      resp.data.forEach((instance) => {
        makePretty += 'Someone is present: ' + instance.presence + '\t\tAt time: ' + instance.timestamp + '\n'
      })

      response.text = makePretty

      resolve(response)
    })
    .catch(() => {
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

// Exports.
module.exports = {
  alarm: alarm,
  subscribe: subscribe,
  subscriptions: subscriptions,
  unsubscribe: unsubscribe,
  snap: snap,
  presence: presence,
  sound: sound,
  pictures: pictures
}
