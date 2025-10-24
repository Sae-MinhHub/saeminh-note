let currentUser = null;

// ----- Users -----
function getUsers() {
  return JSON.parse(localStorage.getItem("users") || "{}");
}

function saveUsers(users) {
  localStorage.setItem("users", JSON.stringify(users));
}

// ----- Session -----
function getSession() {
  return localStorage.getItem("currentUser");
}

function setSession(username) {
  localStorage.setItem("currentUser", username);
}

// ----- Register / Login -----
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

  users[username] = { password: btoa(password), notes: [] };
  saveUsers(users);
  msg.textContent = "Registered successfully. You can login now.";
}

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
  setSession(currentUser);
  showNoteSection();
}

// Show note section
function showNoteSection() {
  document.getElementById("auth-section").style.display = "none";
  document.getElementById("note-section").style.display = "block";
  document.getElementById("current-user").textContent = currentUser;
  renderNotes();
}

// ----- Generate ID -----
function genID() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

// ----- Save note -----
function saveNote() {
  const noteName = document.getElementById("note-name").value.trim();
  const noteText = document.getElementById("note-text").value.trim();
  const isPublic = document.getElementById("is-public").checked;

  if (!noteName) return alert("Please enter note name.");
  if (!noteText) return alert("Note content cannot be empty.");

  let users = getUsers();
  const noteID = genID();
  const note = {
    id: noteID,
    name: noteName,
    content: noteText,
    public: isPublic,
    hidden: !isPublic,
    created: new Date().toISOString()
  };

  users[currentUser].notes.push(note);
  saveUsers(users);

  // Reset input
  document.getElementById("note-name").value = "";
  document.getElementById("note-text").value = "";
  document.getElementById("is-public").checked = false;

  renderNotes();
}

// ----- Render notes -----
function renderNotes() {
  const ul = document.getElementById("note-list");
  ul.innerHTML = "";
  const users = getUsers();
  const notes = users[currentUser].notes;

  notes.forEach(note => {
    const li = document.createElement("li");
    const text = document.createElement("span");
    text.textContent = `${note.name}: ${note.content.length > 50 ? note.content.slice(0,50)+"..." : note.content}`;
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
      if (note.public) {
        const rawLink = `https://raw.githubusercontent.com/Sae-MinhHub/saeminh-note/main/raw/${currentUser}/${note.name}_${note.id}.txt`;
        window.open(rawLink, "_blank");
      } else {
        const rawWin = window.open("", "_blank");
        rawWin.document.write("<pre>" + note.content.replace(/[&<>]/g, t => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[t])) + "</pre>");
      }
    };

    const btnDownload = document.createElement("button");
    btnDownload.textContent = "Download";
    btnDownload.className = "note-btn";
    btnDownload.onclick = () => {
      const filename = note.hidden ? `${currentUser}_${note.name}_${note.id}.hidden.txt` : `${currentUser}_${note.name}_${note.id}.txt`;
      const blob = new Blob([note.content], {type: "text/plain"});
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      link.click();
    };

    const btnEdit = document.createElement("button");
    btnEdit.textContent = "Edit";
    btnEdit.className = "note-btn";
    btnEdit.onclick = () => {
      document.getElementById("note-name").value = note.name;
      document.getElementById("note-text").value = note.content;
      document.getElementById("is-public").checked = note.public;
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
    li.appendChild(btnDownload);
    li.appendChild(btnEdit);
    li.appendChild(btnDelete);
    ul.appendChild(li);
  });
}

// ----- Auto login if session exists -----
window.onload = () => {
  const sessionUser = getSession();
  if (sessionUser && getUsers()[sessionUser]) {
    currentUser = sessionUser;
    showNoteSection();
  }
};
