
  // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  const firebaseConfig = {
    apiKey: "AIzaSyCU-n1q7C8gPszzIvZBMO0y3-Dw8pS2Sgc",
    authDomain: "avalapa-cmsc5373-webapp.firebaseapp.com",
    projectId: "avalapa-cmsc5373-webapp",
    storageBucket: "avalapa-cmsc5373-webapp.firebasestorage.app",
    messagingSenderId: "417093626321",
    appId: "1:417093626321:web:cb94d5b55235131c6598f0"
  };

  // Initialize Firebase
  export const app = initializeApp(firebaseConfig);