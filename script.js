const API = "http://localhost:3000";

// REGISTER (only if you still have register.html — otherwise can be removed)
function register() {
    const name = document.getElementById("name")?.value || "";
    const email = document.getElementById("email")?.value;
    const password = document.getElementById("password")?.value;

    if (!email || !password) {
        alert("Email and password are required");
        return;
    }

    fetch(API + "/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
    })
    .then(res => res.json())
    .then(data => {
        alert(data.message);
        if (data.message.includes("success")) {
            window.location.href = "index.html";
        }
    })
    .catch(err => {
        console.error(err);
        alert("Registration failed");
    });
}

// LOGIN — FIXED VERSION
function login() {
    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;

    if (!email || !password) {
        alert("Please enter email and password");
        return;
    }

    fetch(API + "/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
    })
    .then(res => {
        if (!res.ok) throw new Error("Login failed");
        return res.json();
    })
    .then(data => {
        if (data.message?.includes("Invalid credentials")) {
            alert("Invalid email or password");
            return;
        }
        if (data.email) {
            localStorage.setItem("userEmail", data.email);
            // Optional: store more if needed later
            // localStorage.setItem("user", JSON.stringify(data));
            window.location.href = "inbox.html";
        } else {
            alert(data.message || "Login failed");
        }
    })
    .catch(err => {
        console.error("Login error:", err);
        alert("Something went wrong. Check console.");
    });
}

// Make logout consistent across pages
function logout() {
    localStorage.clear();
    window.location.href = "index.html";
}