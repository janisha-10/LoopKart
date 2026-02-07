// Import Firebase core
import { initializeApp } from 
"https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";

// Import Firestore
import { getFirestore } from 
"https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Import Authentication
import { getAuth } from 
"https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";


// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCA_2NT3C5MK-uWjekOdsgCO4yyeN6U4aM",
  authDomain: "hacktu-3999c.firebaseapp.com",
  projectId: "hacktu-3999c",
  storageBucket: "hacktu-3999c.firebasestorage.app",
  messagingSenderId: "372674928918",
  appId: "1:372674928918:web:cb46904d8a3f058d5c3037",
  measurementId: "G-0ZRNDHPSQC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
const db = getFirestore(app);
const auth = getAuth(app);

// Export so script.js can use
export { db, auth };



