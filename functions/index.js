const https = require('https');
const functions = require('firebase-functions');

// Function that listens to a firestore events
exports.messageSniffer = functions.firestore
    .document('forms/{userName}')
    .onCreate(event => {
        var dataWritten = event.data.data();
        console.log(dataWritten);
        if(dataWritten.name == 'firebaseUser') {
            return event.data.ref.update({"message" : "This message was updated by the messageSniffer cloud function"});
        }
    });

// Function that listens to HTTP requests
exports.echoMessage = functions.https.onRequest((request, response) => {
    var receivedText = request.query.text;
    if(receivedText != null) {
        response.send("Got a message to echo: " + receivedText);
    } else {
        response.send("No text to echo was received");
    }
});