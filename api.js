const API = "http://localhost:3000";

async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem("token");
  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const res = await fetch(API + endpoint, { ...options, headers });

  if (!res.ok) {
    let errData;
    try {
      errData = await res.json();
    } catch {
      errData = { message: `HTTP ${res.status}` };
    }
    throw new Error(errData.message || `Request failed (${res.status})`);
  }

  return res.json();
}

// ─── Auth ────────────────────────────────────────
export async function login(email, password) {
  const data = await apiFetch("/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  localStorage.setItem("userEmail", data.email);
  return data;
}

export function logout() {
  localStorage.removeItem("userEmail");
  localStorage.removeItem("token");
  window.location.href = "/index.html";
}

export function getCurrentUserEmail() {
  return localStorage.getItem("userEmail");
}

export function isLoggedIn() {
  return !!getCurrentUserEmail();
}

// ─── Emails ──────────────────────────────────────
export async function sendMail({ to, subject = "", message = "" }) {
  const sender = getCurrentUserEmail();
  if (!sender) throw new Error("Not logged in");

  return apiFetch("/send", {
    method: "POST",
    body: JSON.stringify({ sender, receiver: to.trim(), subject, message }),
  });
}

export async function getInbox(page = 1, limit = 15) {
  const email = getCurrentUserEmail();
  if (!email) throw new Error("Not logged in");
  return apiFetch(`/inbox/${email}?page=${page}&limit=${limit}`);
}

export async function getSent(page = 1, limit = 15) {
  const email = getCurrentUserEmail();
  if (!email) throw new Error("Not logged in");
  return apiFetch(`/sent/${email}?page=${page}&limit=${limit}`);
}

export async function markAsRead(id) {
  const receiver = getCurrentUserEmail();
  if (!receiver) throw new Error("Not logged in");
  return apiFetch(`/emails/${id}/read`, {
    method: "PATCH",
    body: JSON.stringify({ receiver }),
  });
}

export async function getUnreadCount() {
  const email = getCurrentUserEmail();
  if (!email) throw new Error("Not logged in");
  const data = await apiFetch(`/unread/${email}`);
  return data.unread;
}

export async function getContacts() {
  const email = getCurrentUserEmail();
  if (!email) throw new Error("Not logged in");
  return apiFetch(`/contacts/${email}`);
}
// ... existing exports ...

export async function getDrafts(page = 1, limit = 12) {
  const email = getCurrentUserEmail();
  if (!email) throw new Error("Not logged in");
  return apiFetch(`/drafts/${email}?page=${page}&limit=${limit}`);
}

export async function saveDraft({ subject = "", message = "" }) {
  const sender = getCurrentUserEmail();
  if (!sender) throw new Error("Not logged in");
  return apiFetch("/drafts", {
    method: "POST",
    body: JSON.stringify({ sender, subject, message }),
  });
}

export async function getTrash(page = 1, limit = 12) {
  const email = getCurrentUserEmail();
  if (!email) throw new Error("Not logged in");
  return apiFetch(`/trash/${email}?page=${page}&limit=${limit}`);
}

export async function moveToTrash(id) {
  const owner = getCurrentUserEmail();
  return apiFetch(`/emails/${id}/trash`, {
    method: "PATCH",
    body: JSON.stringify({ owner }),
  });
}

export async function restoreFromTrash(id) {
  const owner = getCurrentUserEmail();
  return apiFetch(`/emails/${id}/restore`, {
    method: "PATCH",
    body: JSON.stringify({ owner }),
  });
}
// Add new contact
export async function addContact(contactEmail) {
  const owner = getCurrentUserEmail();
  if (!owner) throw new Error("Not logged in");

  return apiFetch("/contacts", {
    method: "POST",
    body: JSON.stringify({ owner, contactEmail }),
  });
}

// Remove contact
export async function removeContact(contactEmail) {
  const owner = getCurrentUserEmail();
  if (!owner) throw new Error("Not logged in");

  return apiFetch(`/contacts/${encodeURIComponent(contactEmail)}?owner=${encodeURIComponent(owner)}`, {
    method: "DELETE",
  });
}