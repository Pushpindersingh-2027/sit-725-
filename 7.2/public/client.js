const socket = io();

const nameInput = document.getElementById("nameInput");
const roomInput = document.getElementById("roomInput");
const joinBtn = document.getElementById("joinBtn");

const roomName = document.getElementById("roomName");
const onlineCount = document.getElementById("onlineCount");
const usersList = document.getElementById("usersList");

const messages = document.getElementById("messages");
const typingLine = document.getElementById("typingLine");

const chatForm = document.getElementById("chatForm");
const chatInput = document.getElementById("chatInput");
const sendBtn = document.getElementById("sendBtn");

let joined = false;
let typingTimer = null;
let currentlyTypingUsers = new Set();

function fmtTime(ts) {
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function addMessage({ type, from, text, ts }) {
  const div = document.createElement("div");
  div.className = "msg" + (type ? ` ${type}` : "");

  if (type === "system") {
    div.innerHTML = `
      <div class="meta"><span>System</span><span>${fmtTime(ts)}</span></div>
      <div class="text">${escapeHtml(text)}</div>
    `;
  } else if (type === "reaction") {
    div.innerHTML = `
      <div class="meta"><span>${escapeHtml(from)}</span><span>${fmtTime(ts)}</span></div>
      <div class="text">reacted: <strong>${escapeHtml(text)}</strong></div>
    `;
  } else {
    div.innerHTML = `
      <div class="meta"><span>${escapeHtml(from)}</span><span>${fmtTime(ts)}</span></div>
      <div class="text">${escapeHtml(text)}</div>
    `;
  }

  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}

function escapeHtml(str) {
  return (str || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function setChatEnabled(on) {
  chatInput.disabled = !on;
  sendBtn.disabled = !on;
}

function renderUsers(list) {
  usersList.innerHTML = "";
  list.forEach((u) => {
    const li = document.createElement("li");
    li.innerHTML = `<span>${escapeHtml(u.name)}</span><span class="badge">online</span>`;
    usersList.appendChild(li);
  });
}

// Join room
joinBtn.addEventListener("click", () => {
  const name = nameInput.value.trim() || "Guest";
  const room = roomInput.value.trim() || "General";

  socket.emit("joinRoom", { name, room });
  joined = true;
  setChatEnabled(true);

  addMessage({
    type: "system",
    text: `You joined room: ${room}`,
    ts: Date.now()
  });
});

// Send chat
chatForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!joined) return;

  const text = chatInput.value.trim();
  if (!text) return;

  socket.emit("sendChat", { text });
  chatInput.value = "";

  socket.emit("typing", { isTyping: false });
});

// Typing indicator
chatInput.addEventListener("input", () => {
  if (!joined) return;

  socket.emit("typing", { isTyping: true });

  clearTimeout(typingTimer);
  typingTimer = setTimeout(() => {
    socket.emit("typing", { isTyping: false });
  }, 700);
});

// Reactions
document.querySelectorAll(".emoji").forEach((btn) => {
  btn.addEventListener("click", () => {
    if (!joined) return;
    socket.emit("sendReaction", { emoji: btn.dataset.emoji });
  });
});

// Server events
socket.on("systemNotice", ({ message, ts }) => {
  addMessage({ type: "system", text: message, ts });
});

socket.on("chatBroadcast", ({ from, text, ts }) => {
  addMessage({ type: "", from, text, ts });
});

socket.on("reactionBroadcast", ({ from, emoji, ts }) => {
  addMessage({ type: "reaction", from, text: emoji, ts });
});

socket.on("typingIndicator", ({ user, isTyping }) => {
  if (isTyping) currentlyTypingUsers.add(user);
  else currentlyTypingUsers.delete(user);

  if (currentlyTypingUsers.size === 0) {
    typingLine.textContent = "";
  } else if (currentlyTypingUsers.size === 1) {
    typingLine.textContent = `${[...currentlyTypingUsers][0]} is typing...`;
  } else {
    typingLine.textContent = `Multiple users are typing...`;
  }
});

socket.on("roomState", ({ room, onlineCount: count, users }) => {
  roomName.textContent = `Room: ${room}`;
  onlineCount.textContent = `Online: ${count}`;
  renderUsers(users);
});

// Initially disabled until join
setChatEnabled(false);
