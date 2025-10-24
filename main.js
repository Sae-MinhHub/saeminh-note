body {
  font-family: "Inter", sans-serif;
  background: #0f1724;
  color: #e6eef8;
  display: flex;
  justify-content: center;
  padding: 30px;
}

.container {
  width: 90%;
  max-width: 800px;
  text-align: center;
}

h1 {
  color: #60a5fa;
  margin-bottom: 20px;
}

input, textarea, button {
  display: block;
  width: 100%;
  margin-bottom: 10px;
  border-radius: 8px;
  border: 2px solid #3b82f6;
  padding: 10px;
  font-size: 16px;
  outline: none;
  transition: 0.2s;
}

textarea {
  height: 200px;
  resize: vertical;
  background: #1e293b;
  color: #e2e8f0;
}

button.clickable {
  background: #3b82f6;
  color: white;
  font-weight: bold;
  cursor: pointer;
}

button.clickable:hover {
  background: #2563eb;
  transform: translateY(-2px);
}

button.clickable:active {
  transform: translateY(1px);
}

.note-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

ul {
  list-style: none;
  padding: 0;
  text-align: left;
}

li {
  background: #1e293b;
  margin-bottom: 5px;
  padding: 8px;
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.note-btn {
  margin-left: 5px;
  padding: 4px 8px;
  font-size: 14px;
  cursor: pointer;
  border-radius: 6px;
  border: 1px solid #3b82f6;
  background: #3b82f6;
  color: white;
  transition: 0.2s;
}

.note-btn:hover {
  background: #2563eb;
  transform: translateY(-1px);
}

.note-btn:active {
  transform: translateY(1px);
}
