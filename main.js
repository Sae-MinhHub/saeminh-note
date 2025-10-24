window.onload = function(){

const noteName = document.getElementById("note-name");
const noteText = document.getElementById("note-text");
const isPublic = document.getElementById("is-public");
const noteList = document.getElementById("note-list");
const publicList = document.getElementById("public-list");
const saveBtn = document.getElementById("save-btn");

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
function saveNote(editID=null){
  const name = noteName.value.trim();
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
    alert(`Note saved! Raw link: ${link}`);
  }
  noteName.value=""; noteText.value=""; isPublic.checked=false;
  saveAll(); renderNotes(); renderPublicNotes();
}

saveBtn.onclick = ()=>saveNote();

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
  const win = window.open("","_blank");
  win.document.write(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>${note.name}</title>
      <style>
        body { font-family: monospace; background:#f0f8ff; color:#0f1724; padding:20px; white-space: pre-wrap; }
      </style>
    </head>
    <body>
      ${note.content}
    </body>
    </html>
  `);
  win.document.close();
}

function openRawNote(id){ openNoteByID(id); }

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
  openNoteByID(id);
}

checkHashNote();
renderNotes();
renderPublicNotes();

}
