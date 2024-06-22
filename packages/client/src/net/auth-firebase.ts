import { initializeApp } from 'firebase/app';

const firebaseConfig = {
    apiKey: "AIzaSyB2QVX4sLUcQcK0Imvi5BKfqj3F2p8IBR0",

    authDomain: "ctf-game-b1fcd.firebaseapp.com",

    projectId: "ctf-game-b1fcd",

    storageBucket: "ctf-game-b1fcd.appspot.com",

    messagingSenderId: "379771074353",

    appId: "1:379771074353:web:6141371935a0f9d4fda210"

}

const app = initializeApp(firebaseConfig);

function authUser() {


    var ui = new firebaseui.auth.AuthUI(firebase.auth());

    ui.start('#firebaseui-auth-container', {
        signInOptions: [
            {
                provider: firebase.auth.EmailAuthProvider.PROVIDER_ID,
                signInMethod: firebase.auth.EmailAuthProvider.EMAIL_LINK_SIGN_IN_METHOD
            },
            firebase.auth.GoogleAuthProvider.PROVIDER_ID,


        ],
        // Other config options...
    });

    // Is there an email link sign-in?
    if (ui.isPendingRedirect()) {
        ui.start('#firebaseui-auth-container', uiConfig);
    }
    // This can also be done via:
    if (firebase.auth().isSignInWithEmailLink(window.location.href)) {
        ui.start('#firebaseui-auth-container', uiConfig);
    }



}