window.onload = function(){

const noteName = document.getElementById("note-name");
const noteText = document.getElementById("note-text");
const isPublic = document.getElementById("is-public");
const noteList = document.getElementById("note-list");
const publicList = document.getElementById("public-list");
const saveBtn = document.getElementById("save-btn");
const uploadFile = document.getElementById("upload-file");

let notes = JSON.parse(localStorage.getItem("notes") || "[]");

// ===== UTILS =====
function genUniqueID() {
  let id;
  do {
    id = Date.now().toString(36) + Math.random().toString(36).substring(2,5).toUpperCase();
  } while (notes.some(n => n.id === id));
  return id;
}

function saveAll() { localStorage.setItem("notes", JSON.stringify(notes)); }
function createBtn(text, fn) { const b=document.createElement("button"); b.textContent=text; b.className="note-btn"; b.onclick=fn; return b; }

// ===== SAVE NOTE =====
function saveNote(editID=null, fileName=null){
  const name = fileName || noteName.value.trim();
  const content = noteText.value.trim();
  const pub = isPublic.checked;
  if(!name||!content) return alert("Fill all fields!");

  if(editID){
    const note = notes.find(n=>n.id===editID);
    note.name = name; note.content = content; note.public = pub;
  } else {
    const id = genUniqueID();
    notes.push({id,name,content,public:pub});
    const link = `${location.origin}${location.pathname}#${id}`;
    alert(`Note saved!\nView: ${link}\nRaw: ${location.origin}${location.pathname}raw.html#${id}`);
  }
  noteName.value=""; noteText.value=""; isPublic.checked=false;
  saveAll(); renderNotes(); renderPublicNotes();
}

saveBtn.onclick = ()=>saveNote();

// ===== UPLOAD FILE =====
uploadFile.onchange = function(e){
  const file = e.target.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = function(evt){
    noteText.value = evt.target.result;
    saveNote(null, file.name);
    uploadFile.value = "";
  };
  reader.readAsText(file);
};

// ===== RENDER =====
function renderNotes(){
  noteList.innerHTML="";
  notes.forEach(note=>{
    const li=document.createElement("li");
    li.innerHTML=`<b>${note.name}</b> ${note.public?"(Public)":"(Private)"}`;
    const btnView = createBtn("View", ()=>openNoteByID(note.id));
    const btnEdit = createBtn("Edit", ()=>editNote(note.id));
    const btnDel = createBtn("Delete", ()=>deleteNote(note.id));
    const btnCopy = createBtn("Copy", ()=>navigator.clipboard.writeText(note.content));
    const btnRaw = createBtn("Raw", ()=>openRawNote(note.id));
    li.append(btnView, btnCopy, btnRaw, btnEdit, btnDel);
    noteList.appendChild(li);
  });
}

function renderPublicNotes(){
  publicList.innerHTML="";
  notes.filter(n=>n.public).forEach(note=>{
    const li=document.createElement("li");
    li.innerHTML=`<b>${note.name}</b>`;
    const btnView = createBtn("View", ()=>openNoteByID(note.id));
    const btnRaw = createBtn("Raw", ()=>openRawNote(note.id));
    li.appendChild(btnView); li.appendChild(btnRaw);
    publicList.appendChild(li);
  });
}

// ===== OPEN / EDIT / DELETE =====
function openNoteByID(id){
  const note = notes.find(n=>n.id===id);
  if(!note) return alert("Note not found.");
  const win = window.open(`${location.origin}${location.pathname}#${id}`,"_blank");
  win.focus();
}

function openRawNote(id){
  const note = notes.find(n=>n.id===id);
  if(!note) return alert("Note not found.");
  const rawWin = window.open(`${location.origin}${location.pathname}raw.html#${id}`,"_blank");
  rawWin.focus();
}

function editNote(id){
  const note = notes.find(n=>n.id===id);
  noteName.value = note.name;
  noteText.value = note.content;
  isPublic.checked = note.public;
  saveBtn.onclick = ()=>{ saveNote(id); saveBtn.onclick = ()=>saveNote(); };
}

function deleteNote(id){
  notes = notes.filter(n=>n.id!==id);
  saveAll(); renderNotes(); renderPublicNotes();
}

// ===== CHECK HASH =====
function checkHashNote(){
  const id = location.hash.substring(1);
  if(!id) return;
  const note = notes.find(n=>n.id===id);
  if(note) alert("Open note from hash! (Use raw.html for raw view)");
}

checkHashNote();
renderNotes();
renderPublicNotes();
}
