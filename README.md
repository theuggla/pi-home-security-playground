A basic home security system as a WOT-Thing, using a Raspberry Pi and integrated with slack to send messages and recieve commands.

The Pi is based on the [example](https://github.com/webofthings/webofthings.js) from the Web Of Things-book by Dominique D. Guinard and Vlad M. Trifa.

# How it works
The Pi will, when turned on:
  * Have a motion sensor that can be turned on and off if the right code is supplied. If the motion sensor is on, a LED is on as well.
  * Have a camera that will take a picture when told.
  * Have a speaker that will make a sound when called.
  * If the motion sensor is activated, the Pi will automatically take a picture, sound the sound, and send the picture to all the subscribed users.

# Test functionality.
The Raspberry only allows connections from a gateway, and the gateway only allows connections from two specific slack userIDs. To test the application/raspberry's functionality you can either log in on a specific slack account created for this purpose, or download and run the Postman-tests provided in this repository. The slack-commands only offers a limited functionality, so I'd reccomend doing both. The pi is running on a port on my home network with a camera, so it'll not be on all the time - please let me know somewhat around when it will be tested so I can make sure it's on.

## Through slack.
Log in to the workspace **lysandeltd** with the email **lysandeltd.raspberry@gmail.com** and the password **cirkusmiramar**. Use the *general* channel.

### Slack slash commands to use
1. /activate 1891
  * Activates the alarm. If the alarm is activated, it will turn on the LED, detect motion, and take a picture if motion is   detected.
2. /deactivate 1891
  * Dectivates the alarm. If the alarm is deactivated, it will turn off the LED and stop detecting motion. It can still take a picture when told manually, or send onformation about previous states.
3. /snap
  * Takes a picture with the camera.
4. /pictures
  * Returns the ten latest pictures.
5. /sound on
  * Makes a sound from the pi.
6. /sound off
  * Stops making a sound if the sound is on.
7. /subscribe
  * Will notify you in this workspace when a picture is taken as well as send the picture.
8. /unsubscribe
  * Will stop notifying you when a picture is taken.
9. /presence
  * Will return the latest readings with times and whether or not someone was present at that time.

## Through Postman tests.
Download the Postman tests and environment provided in this repository and import them into a Postman program to run. Newman will reject the collection since the requests are made agains a self-signed cerificate, so just stick with importing them into Postman.

They will show the result of, in line with Guidard and Trifas principles, calling the routes:

*/authorize* - Returns an authorization header from the Gateway, containing a JWT to use for further requests against the Pi. If the JWT contains the userID of an authorized user the request will be proxied forth to the Pi.

*/*  - Contains Link-header with links to model, ui and a short description.

*/model* - Returns the full model, with the properties and the actions of the device and their latest readings.

*/properties* - returns the Pis properties and current values.

*/properties/:id* - returns an array of the latest readings for a specific property. Available properties, as found under /properties, are **/sound**, **/pir**, **/camera**, and **/led**

*/actions* - returns the available actions to take on the Pi as well as the latest action taken.

*/actions/actionType* - **GET** returns an array of the latest times someone took this action, as well as the status of the action, and the action ID. **POST** Posts a request to do the action, and returns a **Location** header of where to enquire about the status of the specific action. Avaliable actions, as stated under /actions, are **/soundState**, **/alarmState** and **/takePicture**. A **GET** request to **/takePicture** that includes an *Upgrade: webhhok* and a *callback* header will subscribe the user to all pictures that gets taken. The code is written to support subscriptions to all actions, but only the takePicture one is currently implemented.

*/actions/actionType/:id* - returns the information about and the status of an action with a specific ID.*

*/images* - Serves static images taken by the camera.

**/actions/actionType/:id** and **/images** concerns specific, not always present resources, and are therefore tested as flows in folders under */actions/actionType/:id*. All routes are called as an authenticated and authorized, authenticated and unauthorized and unauthenticated user.
