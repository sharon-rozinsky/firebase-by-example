// Initialize Firebase
var config = {
    // Add initialization parameters per your firebase project.
    // This can be found in the firebase console.
};
firebase.initializeApp(config);

// --- Realtime Database --- //
// Reference messages collection
var messagesRef = firebase.database().ref('messages');

document.getElementById('contactForm').addEventListener('submit', submitForm);

function submitForm(e) {
    e.preventDefault(); //prevent reloading the html page

    var name = getInputVal('name');
    var email = getInputVal('email');
    var company = getInputVal('company');
    var phone = getInputVal('phone');
    var message = getInputVal('message');

    saveMessageToRealtimeDB(name, company, email, phone, message);
    saveFormToFirestore(name, company, email, phone, message);

    document.querySelector('.alert').style.display = 'block';
    setTimeout(function () {
        document.querySelector('.alert').style.display = 'none';
    }, 3000);

    document.getElementById('contactForm').reset();
}

function getInputVal(id) {
    return document.getElementById(id).value;
}

function saveMessageToRealtimeDB(name, company, email, phone, message) {
    var newMessageRef = messagesRef.push();
    newMessageRef.set({
        name: name,
        company: company,
        email: email,
        phone: phone,
        message: message
    });
}

// --- File Storage --- //
// Reference storage
var storageRef = firebase.storage().ref('media_content');

document.getElementById('fileUpload').addEventListener('change', function (e) {
    var fileToUpload = e.target.files[0];
    var fileToUploadRef = storageRef.child(fileToUpload.name);
    var task = fileToUploadRef.put(fileToUpload);

    // The put method returns an observer called state_changed that can raise the events: running / progress / pause.
    // We can use these events to manage UI elements like a progress bar.
    // A template for that would be:

    task.on('state_changed', function (snapshot) {
        // check the state change in snapshot.state and act according to the state
    }, function (error) {
        // unsuccessful upload
    }, function () {
        console.log('File uploaded: ' + fileToUploadRef.name);
    });
});

// --- Firestore --- //
const firestore = firebase.firestore();
const documentRef = firestore.collection("forms");

function saveFormToFirestore(name, company, email, phone, message) {
    documentRef.doc(name).set({
        name: name,
        company: company,
        email: email,
        phone: phone,
        message: message
    }).then(function () {
        console.log("Added document to collection");
    }).catch(function (error) {
        console.error("Error while adding document: ", error);
    });
}

document.getElementById("queryFirestore").addEventListener('click', function (e) {
    var nameToQuery = getInputVal('nameToQuery');
    documentRef.doc(nameToQuery).get()
        .then(function (doc) {
            if (doc.exists) {
                document.getElementById('firestoreQueryResult').textContent = JSON.stringify(doc.data());
            } else {
                document.getElementById('firestoreQueryResult').textContent = "No document found for that name";
            }

            document.getElementById('nameToQuery').textContent = "";
        }).catch(function (error) {
            console.error("Error while getting document: ", error);
        });
});

// --- Authentication --- //
var provider = new firebase.auth.GoogleAuthProvider();
document.getElementById('signIn').addEventListener('click', function (e) {
    firebase.auth().signInWithRedirect(provider);
});

document.getElementById('signOut').addEventListener('click', function (e) {
    firebase.auth().signOut()
        .then(function () {
            console.log('User signed out');
        }).catch(function (error) {
            console.error('Error while signing out: ', error);
        })
});

firebase.auth().getRedirectResult()
    .then(function (result) {
        if (result.credential) {
            console.log('Got Google Token');
        }
        var user = result.user;
        console.log(user);
    }).catch(function (error) {
        console.error('Error(code: ' + error.code + ', message: ' + error.message + ')');
    });

firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
        document.getElementById('signedUserName').textContent = 'Signed in user: ' + user.displayName + '[email: ' + user.email + ']';
        document.getElementById('userImage').src = user.photoURL;
    } else {
        document.getElementById('signedUserName').textContent = 'Signed in user: NONE';
        document.getElementById('userImage').src = '';
    }
});

// --- Cloud Functions --- //
document.getElementById('echoButton').addEventListener('click', function (e) {
    var textToEcho = getInputVal('textToEcho');
    var request = new XMLHttpRequest();
    request.open('GET', 'https://us-central1-fir-by-example.cloudfunctions.net/echoMessage?text=' + textToEcho);
    request.setRequestHeader('Access-Control-Allow-Origin', '*');
    request.send(null);
    alert('Returned from cloud function: ' + request.responseText);
});