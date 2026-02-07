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
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

//================================
//PAGE PROTECTION
//===============================

/*
onAuthStateChanged(auth, (user) => {

  const currentPage = window.location.pathname;

  // If NOT logged in AND not on index page
  if (!user && !currentPage.includes("index.html")) {
    window.location.href = "index.html";
  }

});
*/

// ===============================
// SIGNUP
// ===============================

const signupBtn = document.getElementById("signupBtn");

if (signupBtn) {
  signupBtn.addEventListener("click", async () => {

    // Get values
    const companyName = document.getElementById("company-name").value;
    const gstin = document.getElementById("gstin").value;
    const userName = document.getElementById("user-name").value;
    const designation = document.getElementById("designation").value;
    const mobile = document.getElementById("mobile").value;
    const email = document.getElementById("signup-email").value;
    const address = document.getElementById("company-address").value;
    const password = document.getElementById("signup-password").value;

    try {

      // 1️⃣ Create Auth User
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2️⃣ Store Extra Data in Firestore
      await setDoc(doc(db, "users", user.uid), {
        companyName: companyName,
        gstin: gstin,
        userName: userName,
        designation: designation,
        mobile: mobile,
        email: email,
        address: address,
        createdAt: new Date()
      });

      alert("Signup successful!");
      window.location.href = "dashboard.html";

    } catch (error) {
      alert(error.message);
    }

  });
}


// ===============================
// LOGIN
// ===============================

const loginBtn = document.getElementById("loginBtn");

if (loginBtn) {
  loginBtn.addEventListener("click", async () => {

    const email = document.getElementById("login-email").value;
    const password = document.getElementById("signup-password").value;

    try {
      await signInWithEmailAndPassword(auth, email, password);
      alert("Login successful!");
      window.location.href = "dashboard.html";
    } catch (error) {
      alert(error.message);
    }

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






