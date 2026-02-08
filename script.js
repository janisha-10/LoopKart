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
  signOut,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

//================================
// PAGE PROTECTION (optional, uncomment if needed)
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
// ELEMENTS
// ===============================

const tabLogin = document.getElementById("tab-login");
const tabSignup = document.getElementById("tab-signup");
const signupFields = document.getElementById("signupFields");
const loginFields = document.getElementById("loginFields");
const passwordField = document.getElementById("auth-password"); // single password input
const slider = document.getElementById("slider");
const continueBtn = document.getElementById("continueBtn");

// ===============================
// TAB TOGGLE
// ===============================

tabLogin?.addEventListener("click", () => {
  signupFields.classList.add("hidden");
  loginFields.classList.remove("hidden");
  slider.style.left = "0%";
  tabLogin.classList.add("text-primary");
  tabSignup.classList.remove("text-primary");
  passwordField.value = ""; // reset password
});

tabSignup?.addEventListener("click", () => {
  signupFields.classList.remove("hidden");
  loginFields.classList.add("hidden");
  slider.style.left = "50%";
  tabSignup.classList.add("text-primary");
  tabLogin.classList.remove("text-primary");
  passwordField.value = ""; // reset password
});

// ===============================
// CONTINUE BUTTON FOR LOGIN/SIGNUP
// ===============================

continueBtn?.addEventListener("click", async () => {
  const isSignup = !signupFields.classList.contains("hidden"); // determine visible form

  const email = isSignup
    ? document.getElementById("signup-email").value.trim()
    : document.getElementById("login-email").value.trim();

  const password = passwordField.value;

  if (!email || !password) {
    alert("Please enter email and password.");
    return;
  }

  try {
    if (isSignup) {
      // -----------------------
      // SIGNUP
      // -----------------------
      const companyName = document.getElementById("company-name").value.trim();
      const gstin = document.getElementById("gstin").value.trim();
      const userName = document.getElementById("user-name").value.trim();
      const designation = document.getElementById("designation")?.value.trim();
      const mobile = document.getElementById("mobile").value.trim();
      const address = document.getElementById("company-address").value.trim();

      // 1️⃣ Create Auth User
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2️⃣ Store Extra Data in Firestore
      await setDoc(doc(db, "users", user.uid), {
        companyName,
        gstin,
        userName,
        designation,
        mobile,
        email,
        address,
        createdAt: new Date()
      });

      alert("Signup successful!");
      window.location.href = "dashboard.html";

    } else {
      // -----------------------
      // LOGIN
      // -----------------------
      await signInWithEmailAndPassword(auth, email, password);
      alert("Login successful!");
      window.location.href = "dashboard.html";
    }
  } catch (error) {
    alert(error.message);
  }
});

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

  try {
    // Query Firestore for the current user's document
    const userQuery = query(collection(db, "users"), where("__name__", "==", user.uid));
    const userDocs = await getDocs(userQuery);

    if (userDocs.empty) {
      profileDiv.innerHTML = "<p>No profile data found.</p>";
      return;
    }

    // Since __name__ == UID, there will be only one document
    userDocs.forEach(docSnap => {
      const data = docSnap.data();

      profileDiv.innerHTML = `
        <p>Company Name: ${data.companyName || "-"}</p>
        <p>GSTIN: ${data.gstin || "-"}</p>
        <p>User Name: ${data.userName || "-"}</p>
        <p>Designation: ${data.designation || "-"}</p>
        <p>Mobile: ${data.mobile || "-"}</p>
        <p>Email: ${data.email || "-"}</p>
        <p>Address: ${data.address || "-"}</p>
        <button id="logoutBtn" class="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">
          Logout
        </button>
      `;

      // Attach logout functionality
      const logoutBtn = document.getElementById("logoutBtn");
      logoutBtn?.addEventListener("click", async () => {
        try {
          await signOut(auth);
          alert("Logged out successfully!");
          window.location.href = "index.html";
        } catch (error) {
          alert("Error logging out: " + error.message);
        }
      });
    });
  } catch (error) {
    profileDiv.innerHTML = `<p>Error loading profile: ${error.message}</p>`;
  }
}

// Call the function when the page loads
auth.onAuthStateChanged(user => {
  if (user) {
    loadProfile();
  } else {
    // Redirect to login page if not logged in
    window.location.href = "index.html";
  }
});



