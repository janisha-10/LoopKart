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
// TOGGLE LOGIN / SIGNUP TABS
// ===============================
tabLogin?.addEventListener("click", () => {
  signupFields.classList.add("hidden");
  loginFields.classList.remove("hidden");
  slider.style.left = "0%";
  tabLogin.classList.add("text-primary");
  tabSignup.classList.remove("text-primary");
  passwordField.value = ""; // reset password field
});

tabSignup?.addEventListener("click", () => {
  signupFields.classList.remove("hidden");
  loginFields.classList.add("hidden");
  slider.style.left = "50%";
  tabSignup.classList.add("text-primary");
  tabLogin.classList.remove("text-primary");
  passwordField.value = ""; // reset password field
});

// ===============================
// CONTINUE BUTTON (SIGNUP / LOGIN)
// ===============================
continueBtn?.addEventListener("click", async () => {
  const isSignup = !signupFields.classList.contains("hidden"); // visible form

  const email = isSignup
    ? document.getElementById("signup-email").value.trim()
    : document.getElementById("login-email").value.trim();

  const password = passwordField.value.trim();

  if (!email || !password) {
    alert("Please enter email and password.");
    return;
  }

  try {
    if (isSignup) {
      // SIGNUP
      const companyName = document.getElementById("company-name").value.trim();
      const gstin = document.getElementById("gstin").value.trim();
      const userName = document.getElementById("user-name").value.trim();
      const designation = document.getElementById("designation")?.value.trim();
      const mobile = document.getElementById("mobile").value.trim();
      const address = document.getElementById("company-address").value.trim();

      // 1️⃣ Create Firebase Auth User
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2️⃣ Store extra data in Firestore
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
      // LOGIN
      await signInWithEmailAndPassword(auth, email, password);
      alert("Login successful!");
      window.location.href = "dashboard.html";
    }
  } catch (error) {
    alert(error.message);
  }
});

// ===============================
// WELCOME USERNAME
// ===============================
const usernameSpan = document.getElementById("dashboardUsername");

async function loadUsername() {
  const user = auth.currentUser;
  if (!user || !usernameSpan) return;

  try {
    const userQuery = query(collection(db, "users"), where("__name__", "==", user.uid));
    const userDocs = await getDocs(userQuery);

    if (!userDocs.empty) {
      userDocs.forEach(docSnap => {
        const data = docSnap.data();
        usernameSpan.textContent = data.userName || "User";
      });
    }
  } catch (error) {
    console.error("Error loading username:", error);
    usernameSpan.textContent = "User";
  }
}

// ===============================
// PAGE PROTECTION + LOAD USERNAME
// ===============================
onAuthStateChanged(auth, user => {
  const currentPage = window.location.pathname;

  if (user) {
    // Load username and profile if applicable
    loadUsername();
    loadProfile?.();
  } else {
    // Only redirect if user is not logged in AND NOT already on index page
    if (!currentPage.endsWith("index.html") && currentPage !== "/") {
      window.location.href = "index.html";
    }
  }
});

// ===============================
// LOAD PROFILE DATA
// ===============================
async function loadProfile() {
  const user = auth.currentUser;
  if (!user) return;

  try {
    const userQuery = query(collection(db, "users"), where("__name__", "==", user.uid));
    const userDocs = await getDocs(userQuery);

    if (userDocs.empty) return;

    userDocs.forEach(docSnap => {
      const data = docSnap.data();
      document.getElementById("profile-name").value = data.userName || "";
      document.getElementById("profile-phone").value = data.mobile || "";
      document.getElementById("profile-company").value = data.companyName || "";
      document.getElementById("profile-gstin").value = data.gstin || "";
    });
  } catch (error) {
    alert("Error loading profile: " + error.message);
  }
}

// ===============================
// SAVE PROFILE UPDATES
// ===============================
const saveProfileBtn = document.getElementById("saveProfileBtn");
saveProfileBtn?.addEventListener("click", async () => {
  const user = auth.currentUser;
  if (!user) return alert("No user logged in.");

  try {
    const userRef = doc(db, "users", user.uid);
    const updatedData = {
      userName: document.getElementById("profile-name").value.trim(),
      mobile: document.getElementById("profile-phone").value.trim(),
      companyName: document.getElementById("profile-company").value.trim(),
      gstin: document.getElementById("profile-gstin").value.trim(),
    };
    await updateDoc(userRef, updatedData);
    alert("Profile updated successfully!");
    loadUsername(); // update welcome name immediately
  } catch (error) {
    alert("Error updating profile: " + error.message);
  }
});

// ===============================
// LOGOUT
// ===============================
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
        <button onclick="sendRequest('${docSnap.id}')">Send Request</button>
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
  if (!user) return alert("Login to send request.");

  await addDoc(collection(db, "requests"), {
    productId: productId,
    buyerId: user.uid,
    status: "pending",
    createdAt: serverTimestamp()
  });

  alert("Request Sent");
};

// ===============================
// ADD PRODUCT FORM
// ===============================
const addProductForm = document.getElementById("addProductForm");
addProductForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const user = auth.currentUser;
  if (!user) return alert("Login to add product.");

  const title = document.getElementById("title").value.trim();
  const material = document.getElementById("material").value.trim();
  const condition = document.getElementById("condition").value.trim();
  const price = document.getElementById("price").value.trim();
  const quantity = document.getElementById("quantity").value.trim();

  await addDoc(collection(db, "products"), {
    title,
    material,
    condition,
    price,
    quantity,
    sellerId: user.uid,
    createdAt: serverTimestamp()
  });

  alert("Product Uploaded");
});
