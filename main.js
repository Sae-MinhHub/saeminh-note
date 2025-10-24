let currentUser = null;

// ===== USER SYSTEM =====
function getUsers() {
  return JSON.parse(localStorage.getItem("users") || "{}");
}
function saveUsers(users) {
  localStorage.setItem("users", JSON.stringify(users));
}
function setSession(user) {
  localStorage.setItem("currentUser", user);
}
function getSession() {
  return localStorage.getItem("currentUser");
}

// ===== REGISTER / LOGIN =====
function registerUser() {
  const u = username.value.trim();
  const p = password.value.trim();
  if (!u || !p) return alert("Please enter username and password.");

  let users = getUsers();
  if (users[u]) return alert("Username already exists!");

  users[u] = { password: btoa(p), notes: [] };
  saveUsers(users);
  alert("Registered! Please login now.");
}

function loginUser() {
  const u = username.value.trim();
  const p = password.value.trim();
  let users = getUsers();

  if (!users[u] || atob(users[u].password) !== p) {
    alert("Invalid username or password!");
    return;
  }

  currentUser = u;
  setSession(u);
  showNoteSection();
}

// ===== AUTO LOGIN =====
window.onload = () => {
  const u = getSession();
  if (u && getUsers()[u]) {
    currentUser = u;
    showNoteSection();
  } else renderPublicNotes();
};

// ===== INTERFACE =====
function showNoteSection() {
  auth-section.style.display = "none";
  note-section.style.display = "block";
  current-user.textContent = currentUser;
  renderNotes();
  renderPublicNotes();
}

// ===== NOTE SYSTEM =====
function genID() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function saveNote() {
  const name = note-name.value.trim();
  const content = note-text.value.trim();
  const isPublic = is-public.checked;

  if (!name || !content) return alert("Fill all fields!");

  let users = getUsers();
  const note = {
    id: genID(),
    name,
    content,
    public: isPublic,
    owner: currentUser,
    created: new Date().toISOString()
  };

  users[currentUser].notes.push(note);
  saveUsers(users);
  note-name.value = "";
  note-text.value = "";
  is-public.checked = false;

  renderNotes();
  renderPublicNotes();
}

// ===== RENDER NOTES =====
function renderNotes() {
  const ul = document.getElementById("note-list");
  ul.innerHTML = "";
  let notes = getUsers()[currentUser].notes;

  notes.forEach(note => {
    const li = document.createElement("li");
    li.innerHTML = `<span><b>${note.name}</b> ${note.public ? "(Public)" : "(Private)"}</span>`;

    const btnRaw = createBtn("RAW", () => openNote(note));
    const btnCopy = createBtn("Copy", () => navigator.clipboard.writeText(note.content));
    const btnDel = createBtn("Delete", () => deleteNote(note.id));

    li.append(btnRaw, btnCopy, btnDel);
    ul.appendChild(li);
  });
}

// ===== PUBLIC NOTES =====
function renderPublicNotes() {
  const ul = document.getElementById("public-list");
  ul.innerHTML = "";
  let users = getUsers();
  Object.keys(users).forEach(u => {
    users[u].notes
      .filter(n => n.public)
      .forEach(note => {
        const li = document.createElement("li");
        li.innerHTML = `<span><b>${note.name}</b> by ${u}</span>`;
        const btn = createBtn("View", () => openNote(note));
        ul.appendChild(li);
        li.appendChild(btn);
      });
  });
}

// ===== UTILS =====
function createBtn(text, fn) {
  const b = document.createElement("button");
  b.textContent = text;
  b.className = "note-btn";
  b.onclick = fn;
  return b;
}

function openNote(note) {
  if (!note.public && note.owner !== currentUser) {
    alert("This note is private.");
    return;
  }
  const blob = new Blob([note.content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank");
}

function deleteNote(id) {
  let users = getUsers();
  let notes = users[currentUser].notes;
  users[currentUser].notes = notes.filter(n => n.id !== id);
  saveUsers(users);
  renderNotes();
}
