const noteKey = "saeminh-note";

document.getElementById("saveBtn").addEventListener("click", () => {
  const content = document.getElementById("noteArea").value;
  localStorage.setItem(noteKey, content);
  alert("Đã lưu!");
});

document.getElementById("loadBtn").addEventListener("click", () => {
  const saved = localStorage.getItem(noteKey);
  if (saved) {
    document.getElementById("noteArea").value = saved;
  }
});

// Tự động load khi mở
window.onload = () => {
  const saved = localStorage.getItem(noteKey);
  if (saved) {
    document.getElementById("noteArea").value = saved;
  }
};
