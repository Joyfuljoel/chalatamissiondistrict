// Import necessary Firebase modules
import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.7.1/firebase-app.js';
import { getDatabase, ref, push, update, remove, onValue } from 'https://www.gstatic.com/firebasejs/11.7.1/firebase-database.js';

// Firebase configuration object
const firebaseConfig = {
  apiKey: 'AIzaSyAGxpk0pdmSm9ID3sw02Y9nNk-8vKKtxyE',
  authDomain: 'chalata-website.firebaseapp.com',
  projectId: 'chalata-website',
  storageBucket: 'chalata-website.appspot.com',
  messagingSenderId: '725066930896',
  appId: '1:725066930896:web:7ab55b42954e01bd439cd5',
  measurementId: 'G-QKV4KBWJDE'
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app); // Initialize the Realtime Database

// Exporting necessary Firebase features
export { db, ref, push, update, remove, onValue };
