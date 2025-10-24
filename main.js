// ----- User & Note Management -----
let currentUser = null;

// Load users from LocalStorage
function getUsers() {
  return JSON.parse(localStorage.getItem("users") || "{}");
}

function saveUsers(users) {
  localStorage.setItem("users", JSON.stringify(users));
}

// Register user
function registerUser() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  const msg = document.getElementById("auth-msg");

  if (!username || !password) {
    msg.textContent = "Please enter username and password.";
    return;
  }

  let users = getUsers();
  if (users[username]) {
    msg.textContent = "Username already exists.";
    return;
  }

  users[username] = { password: btoa(password), notes: [] }; // encode password
  saveUsers(users);
  msg.textContent = "Registered successfully. You can login now.";
}

// Login user
function loginUser() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  const msg = document.getElementById("auth-msg");

  let users = getUsers();
  if (!users[username] || atob(users[username].password) !== password) {
    msg.textContent = "Invalid username or password.";
    return;
  }

  currentUser = username;
  document.getElementById("auth-section").style.display = "none";
  document.getElementById("note-section").style.display = "block";
  document.getElementById("current-user").textContent = currentUser;
  msg.textContent = "";
  renderNotes();
}

// Generate random note ID
function genID() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

// Save note
function saveNote() {
  const noteText = document.getElementById("note-text").value.trim();
  const isPublic = document.getElementById("is-public").checked;
  if (!noteText) return alert("Note cannot be empty.");

  let users = getUsers();
  const noteID = genID();
  const note = {
    id: noteID,
    content: noteText,
    public: isPublic,
    hidden: !isPublic,
    created: new Date().toISOString()
  };

  // Create new version (do not overwrite old)
  users[currentUser].notes.push(note);
  saveUsers(users);
  document.getElementById("note-text").value = "";
  document.getElementById("is-public").checked = false;
  renderNotes();
}

// Render notes list
function renderNotes() {
  const ul = document.getElementById("note-list");
  ul.innerHTML = "";
  const users = getUsers();
  const notes = users[currentUser].notes;

  notes.forEach(note => {
    const li = document.createElement("li");
    const text = document.createElement("span");
    text.textContent = note.content.length > 50 ? note.content.slice(0,50)+"..." : note.content;
    li.appendChild(text);

    // Buttons
    const btnCopy = document.createElement("button");
    btnCopy.textContent = "Copy";
    btnCopy.className = "note-btn";
    btnCopy.onclick = () => navigator.clipboard.writeText(note.content);

    const btnRAW = document.createElement("button");
    btnRAW.textContent = "RAW";
    btnRAW.className = "note-btn";
    btnRAW.onclick = () => {
      const rawWin = window.open("", "_blank");
      rawWin.document.write("<pre>" + note.content.replace(/[&<>]/g, t => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[t])) + "</pre>");
    };

    const btnDelete = document.createElement("button");
    btnDelete.textContent = "Delete";
    btnDelete.className = "note-btn";
    btnDelete.onclick = () => {
      if (confirm("Delete this note permanently?")) {
        const index = users[currentUser].notes.findIndex(n => n.id === note.id);
        if (index > -1) users[currentUser].notes.splice(index,1);
        saveUsers(users);
        renderNotes();
      }
    };

    li.appendChild(btnCopy);
    li.appendChild(btnRAW);
    li.appendChild(btnDelete);
    ul.appendChild(li);
  });
}
