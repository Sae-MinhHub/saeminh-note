// ===== GET HTML ELEMENTS =====
const username = document.getElementById("username");
const password = document.getElementById("password");
const authSection = document.getElementById("auth-section");
const noteSection = document.getElementById("note-section");
const currentUserSpan = document.getElementById("current-user");
const noteName = document.getElementById("note-name");
const noteText = document.getElementById("note-text");
const isPublic = document.getElementById("is-public");
const noteList = document.getElementById("note-list");
const publicList = document.getElementById("public-list");

// ===== USER SYSTEM =====
let currentUser = null;

function getUsers() { return JSON.parse(localStorage.getItem("users") || "{}"); }
function saveUsers(users) { localStorage.setItem("users", JSON.stringify(users)); }
function setSession(user) { localStorage.setItem("currentUser", user); }
function getSession() { return localStorage.getItem("currentUser"); }

// ===== REGISTER / LOGIN =====
function registerUser() {
  const u = username.value.trim();
  const p = password.value.trim();
  if(!u || !p) return alert("Enter username and password.");
  let users = getUsers();
  if(users[u]) return alert("Username exists!");
  users[u] = { password: btoa(p), notes: [] };
  saveUsers(users);
  alert("Registered! Please login.");
}

function loginUser() {
  const u = username.value.trim();
  const p = password.value.trim();
  let users = getUsers();
  if(!users[u] || atob(users[u].password) !== p) return alert("Invalid username/password");
  currentUser = u;
  setSession(u);
  showNoteSection();
}

// ===== AUTO LOGIN =====
window.onload = () => {
  const u = getSession();
  if(u && getUsers()[u]) { currentUser = u; showNoteSection(); }
  checkHashNote();
};

// ===== INTERFACE =====
function showNoteSection() {
  authSection.style.display="none";
  noteSection.style.display="block";
  currentUserSpan.textContent = currentUser;
  renderNotes();
  renderPublicNotes();
}

// ===== NOTE SYSTEM =====
function genID() { return Math.random().toString(36).substring(2,8).toUpperCase(); }

function saveNote(editID=null) {
  const name = noteName.value.trim();
  const content = noteText.value.trim();
  const pub = isPublic.checked;
  if(!name||!content) return alert("Fill all fields!");
  let users = getUsers();

  if(editID){
    // Edit mode
    let note = users[currentUser].notes.find(n=>n.id===editID);
    if(!note) return alert("Cannot edit note.");
    note.name = name;
    note.content = content;
    note.public = pub;
    saveUsers(users);
    alert("Note updated!");
  } else {
    // New note
    const id = genID();
    const note = {id,name,content,public:pub,owner:currentUser,created:new Date().toISOString()};
    users[currentUser].notes.push(note);
    saveUsers(users);
    const link = `${location.origin}${location.pathname}#${id}`;
    alert(`Note saved! Your link: ${link}`);
  }

  noteName.value=""; noteText.value=""; isPublic.checked=false;
  renderNotes(); renderPublicNotes();
}

// ===== RENDER NOTES =====
function renderNotes() {
  noteList.innerHTML="";
  let notes = getUsers()[currentUser].notes;
  notes.forEach(note=>{
    const li=document.createElement("li");
    li.innerHTML=`<span><b>${note.name}</b> ${note.public?"(Public)":"(Private)"}</span>`;
    const btnLink=createBtn("Link",()=>openNoteByID(note.id));
    const btnCopy=createBtn("Copy",()=>navigator.clipboard.writeText(note.content));
    const btnEdit=createBtn("Edit",()=>editNote(note.id));
    const btnDel=createBtn("Delete",()=>deleteNote(note.id));
    li.append(btnLink,btnCopy,btnEdit,btnDel);
    noteList.appendChild(li);
  });
}

// ===== PUBLIC NOTES =====
function renderPublicNotes() {
  publicList.innerHTML="";
  let users = getUsers();
  Object.keys(users).forEach(u=>{
    users[u].notes.filter(n=>n.public).forEach(note=>{
      const li=document.createElement("li");
      li.innerHTML=`<span><b>${note.name}</b> by ${u}</span>`;
      const btn=createBtn("View",()=>openNoteByID(note.id));
      li.appendChild(btn);
      publicList.appendChild(li);
    });
  });
}

// ===== UTILS =====
function createBtn(text,fn){
  const b=document.createElement("button");
  b.textContent=text;
  b.className="note-btn";
  b.onclick=fn;
  return b;
}

function deleteNote(id){
  let users=getUsers();
  users[currentUser].notes=users[currentUser].notes.filter(n=>n.id!==id);
  saveUsers(users);
  renderNotes();
}

// ===== OPEN NOTE BY ID =====
function openNoteByID(id){
  let users=getUsers(); let note=null;
  if(currentUser) note=users[currentUser].notes.find(n=>n.id===id);
  if(!note){
    Object.keys(users).forEach(u=>{
      if(!note) note=users[u].notes.find(n=>n.id===id && n.public);
    });
  }
  if(!note) return alert("Note not found or private.");
  const win=window.open("","_blank");
  win.document.write(`<pre>${note.content}</pre>`);
}

// ===== EDIT NOTE =====
function editNote(id){
  let users=getUsers();
  let note = users[currentUser].notes.find(n=>n.id===id);
  if(!note) return alert("Cannot edit note.");
  noteName.value = note.name;
  noteText.value = note.content;
  isPublic.checked = note.public;
  // Override save button temporarily
  const saveBtn = document.querySelector(".note-options button.clickable");
  saveBtn.onclick = ()=>{ saveNote(id); saveBtn.onclick=()=>saveNote(); };
}

// ===== CHECK HASH =====
function checkHashNote(){
  const id=location.hash.substring(1);
  if(!id) return;
  openNoteByID(id);
}
