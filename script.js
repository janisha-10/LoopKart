// Import db and auth
import { db, auth } from "./firebase.js";

// Import Firebase functions
import {
  collection,
  addDoc,
  getDocs,
  doc,
  setDoc,
  updateDoc,
  query,
  where,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged
  signOut
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

//================================
//PAGE PROTECTION
//===============================


onAuthStateChanged(auth, (user) => {

  const currentPage = window.location.pathname;

  // If NOT logged in AND not on index page
  if (!user && !currentPage.includes("index.html")) {
    window.location.href = "index.html";
  }

});

// ===============================
// SIGNUP
// ===============================

const signupForm = document.getElementById("signupTab");

if (signupTab) {
  signupTab.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("signupName").value;
    const phone = document.getElementById("signupPhone").value;
    const email = document.getElementById("signupEmail").value;
    const password = document.getElementById("signupPassword").value;

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Store user info in Firestore
    await setDoc(doc(db, "users", user.uid), {
      name: name,
      phone: phone,
      email: email,
      createdAt: serverTimestamp()
    });

    alert("Signup successful");
  });
}


// ===============================
// LOGIN
// ===============================

const loginForm = document.getElementById("loginForm");

if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    await signInWithEmailAndPassword(auth, email, password);

    alert("Login successful");
    window.location.href = "dashboard.html";
  });
}


// ===============================
// ADD PRODUCT
// ===============================

const addProductForm = document.getElementById("addProductForm");

if (addProductForm) {
  addProductForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const user = auth.currentUser;

    const title = document.getElementById("title").value;
    const material = document.getElementById("material").value;
    const condition = document.getElementById("condition").value;
    const price = document.getElementById("price").value;
    const quantity = document.getElementById("quantity").value;

    await addDoc(collection(db, "products"), {
      title: title,
      material: material,
      condition: condition,
      price: price,
      quantity: quantity,
      sellerId: user.uid,
      createdAt: serverTimestamp()
    });

    alert("Product Uploaded");
  });
}


// ===============================
// LOAD PRODUCTS (Dashboard)
// ===============================

async function loadProducts() {

  const productList = document.getElementById("productList");
  if (!productList) return;

  productList.innerHTML = "";

  const snapshot = await getDocs(collection(db, "products"));

  snapshot.forEach((docSnap) => {
    const data = docSnap.data();

    productList.innerHTML += `
      <div>
        <h3>${data.title}</h3>
        <p>Material: ${data.material}</p>
        <p>Condition: ${data.condition}</p>
        <p>Price: ₹${data.price}</p>
        <p>Quantity: ${data.quantity}</p>
        <button onclick="sendRequest('${docSnap.id}')">
          Send Request
        </button>
      </div>
      <hr>
    `;
  });
}

loadProducts();


// ===============================
// SEND REQUEST
// ===============================

window.sendRequest = async function(productId) {

  const user = auth.currentUser;

  await addDoc(collection(db, "requests"), {
    productId: productId,
    buyerId: user.uid,
    status: "pending",
    createdAt: serverTimestamp()
  });

  alert("Request Sent");
};


// ===============================
// LOAD USER PROFILE
// ===============================

async function loadProfile() {

  const profileDiv = document.getElementById("profileInfo");
  if (!profileDiv) return;

  const user = auth.currentUser;
  if (!user) return;

  const userDoc = await getDocs(
    query(collection(db, "users"), where("__name__", "==", user.uid))
  );

  userDoc.forEach(docSnap => {
    const data = docSnap.data();
    profileDiv.innerHTML = `
      <p>Name: ${data.name}</p>
      <p>Email: ${data.email}</p>
      <p>Phone: ${data.phone}</p>
    `;
  });
}

onAuthStateChanged(auth, (user) => {
  if (user) {
    loadProfile();
  }
});

