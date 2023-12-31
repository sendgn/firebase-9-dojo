import { initializeApp } from 'firebase/app';
import {
  getFirestore, collection, onSnapshot,
  addDoc, deleteDoc, doc,
  getDocs, query, where,
  orderBy, serverTimestamp,
  getDoc, updateDoc,
} from 'firebase/firestore';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signOut, signInWithEmailAndPassword,
  onAuthStateChanged
} from 'firebase/auth'

const firebaseConfig = {
  apiKey: "AIzaSyB-qOtsmwlOtOUNHQbx6rf_enkxzc2ZlHs",
  authDomain: "fir-9-dojo-cbbb2.firebaseapp.com",
  projectId: "fir-9-dojo-cbbb2",
  storageBucket: "fir-9-dojo-cbbb2.appspot.com",
  messagingSenderId: "587458817876",
  appId: "1:587458817876:web:27f3fded09a57f0a1a22c1"
};

// Init firebase app
// ----------------------
// connect our app to firebase backend using the config
initializeApp(firebaseConfig);

// Init services
// ---------------
// it represents our data base connection, and anytime we do smth
// with the database like reach out to get data we're gonna use this constant
const db = getFirestore();
// initialize the authentication service
const auth = getAuth();

// Collection ref
// ----------------
// get an access to a specific collection (in our case - books)
const colRef = collection(db, 'books');

// Real time collection data
// onSnapshot(colRef, (snapshot) => {
//   let books = [];
//   snapshot.docs.forEach((doc) => {
//     books.push({ ...doc.data(), id: doc.id });
//   });
//   console.log(books);
// });

// Firestore queries
const q = query(colRef, orderBy('createdAt'));

// Realtime collection data (but callback doesn't fire when we change collection directly from firebase website)
// -------------------------------------------
// onSnapshot() returns an subscribe function
// which is stored inside this constant
const unsubCol = onSnapshot(q, (snapshot) => {
  let books = [];
  snapshot.docs.forEach((doc) => {
    books.push({ ...doc.data(), id: doc.id });
  });
  console.log(books);
});

// Adding documents
const addBookForm = document.querySelector('.add');
addBookForm.addEventListener('submit', (e) => {
  e.preventDefault();

  addDoc(colRef, {
    title: addBookForm.title.value,
    author: addBookForm.author.value,
    createdAt: serverTimestamp()
  })
    .then(() => {
      addBookForm.reset();
    });
});

// Deleting documents
const deleteBookForm = document.querySelector('.delete');
deleteBookForm.addEventListener('submit', (e) => {
  e.preventDefault();

  // Get a document reference we want to delete
  const docRef = doc(db, 'books', deleteBookForm.id.value);

  deleteDoc(docRef)
    .then(() => {
      deleteBookForm.reset();
    });
});

// Get a single document
const docRef = doc(db, 'books', '3l6gzWekugv3x66mIIk9');

// Real time subscription to a document
const unsubDoc = onSnapshot(docRef, (doc) => {
  console.log(doc.data(), doc.id);
});

// get document once without a subscription
// getDoc(docRef)
//   .then((doc) => {
//     console.log(doc.data(), doc.id);
//   });

// Updating a document
const updateForm = document.querySelector('.update');
updateForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const docRef = doc(db, 'books', updateForm.id.value);

  // specify fields that we want to update inside a document
  // in our case this is 'title' field
  updateDoc(docRef, {
    title: 'updated title'
  })
    .then(() => {
      updateForm.reset();
    })
});

// Firebase authentication
// -----------------------------
// Firebase auth uses json webtoken to authenticate users (sign up, log in/out)
// --------------------------------------------
// When a user logged in this web token
// is sent to the firebase server on every request
// so the firebase can authenticate the request
// ---------------------------------------
// We can then use that to lockdown other services
// so that only authenticated users can access certain features of our site
// such as reading db data or uploading files

// Signing users up
const signupForm = document.querySelector('.signup');
signupForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const email = signupForm.email.value;
  const password = signupForm.password.value;

  // By default when we create a new user using this function
  // firebase automatically logs them in after they've signed up,
  // so at this moment a user would be considered to be logged in
  createUserWithEmailAndPassword(auth, email, password)
    // callback takes in an argument - a user credential object
    .then((cred) => {
      console.log('user created:', cred.user);
      console.log('unique id:', cred.user.uid);
      signupForm.reset();
    })
    .catch((err) => {
      console.log(err.message);
    });
});

// Logging in and out
const logoutButton = document.querySelector('.logout');
logoutButton.addEventListener('click', () => {
  signOut(auth)
    .then(() => {
      console.log('the user signed out');
    })
    .catch((err) => {
      console.log(err.message);
    })
});

const loginForm = document.querySelector('.login');
loginForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const email = loginForm.email.value;
  const password = loginForm.password.value;
  signInWithEmailAndPassword(auth, email, password)
    .then((cred) => {
      console.log('user logged in:', cred.user);
    })
    .catch((err) => {
      console.log(err.message);
    });
});

// Subscribing to auth changes
// -------------------------------
// if a user signs up, logs in/out then callback fires
const unsubAuth = onAuthStateChanged(auth, (user) => {
  // if user logged out --> user is null
  console.log('------------------------------')
  console.log('user status changed:', user);
  console.log('------------------------------')
});

// Unsubscribing changes
// -----------------------
// it's a good practice to unsubscribe from any subscription
// when you no longer need it
const unsubButton = document.querySelector('.unsub');
unsubButton.addEventListener('click', () => {
  console.log('unsubscribing');
  unsubCol();
  unsubDoc();
  unsubAuth();
});
