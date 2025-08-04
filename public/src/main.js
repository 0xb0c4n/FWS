import { io } from "https://cdn.socket.io/4.7.2/socket.io.esm.min.js";

function tailwindTransitionShow(elToShow, others = []) {
  others.forEach(el => {
    if (!el.classList.contains("hidden")) {
      el.classList.add("hidden")
    }
  });
  elToShow.classList.remove("hidden");
}

class SocketService {
  constructor(app) {
    this.app = app;
    this.socket = null;
  }

  connect() {
    this.socket = io("http://localhost:3000", { withCredentials: true });

    this.socket.on("connect", () => console.log("✅ Socket connecté"));
    this.socket.on("receiveMessage", ({ from, message, sent_at }) => {
      this.app.addMessage(from, { from: "them", text: message, sent_at });
    });
  }

  send(to, message) {
    if (this.socket) {
      this.socket.emit("sendMessage", { to, message });
    }
  }
}

class UI {
  constructor(app) {
    this.app = app;

    this.authSection = document.getElementById('auth-section');

    this.chatWrapper = document.getElementById('chat-wrapper');
    this.chatList = document.getElementById('chat-list');
    this.chatHeader = document.getElementById('chat-header');
    this.chatForm = document.getElementById('chat-form');
    this.chatInput = document.getElementById('chat-input');
    this.chatMessages = document.getElementById('chat-messages');
    this.searchInput = document.getElementById("user-search");

    this.profilePage = document.getElementById("profile-page");
    this.profileAvatar = document.getElementById("profile-avatar");
    this.profileName = document.getElementById("profile-name");
    this.profileEmail = document.getElementById("profile-email");

    this.editPage = document.getElementById("edit-profile-page");
    this.editForm = document.getElementById("edit-profile-form");
    this.cancelEditBtn = document.getElementById("cancel-edit");

    this.init();
  }

  init() {
    this.chatForm.addEventListener("submit", e => this.app.sendMessage(e));
    this.searchInput.addEventListener("input", e => this.app.searchUsers(e));

    document.querySelectorAll("a").forEach(link => {
      if (link.textContent.includes("Chat")) {
        link.addEventListener("click", e => {
          e.preventDefault();
          this.showChat();
        });
      } else if (link.textContent.includes("Profile")) {
        link.addEventListener("click", e => {
          e.preventDefault();
          this.app.showProfile();
        });
      }
    });

    document.querySelectorAll("a").forEach(link => {
      if (link.textContent.includes("Settings")) {
        link.addEventListener("click", e => {
          e.preventDefault();
          this.showEditProfile(this.app.user);
        });
      }
    });
  }

  showChat() {
    tailwindTransitionShow(this.chatWrapper, [this.profilePage, this.authSection, this.editPage])
    document.getElementById("auth-section").classList.add("hidden");
    document.getElementById("chat-wrapper").classList.remove("hidden");
    this.profilePage.classList.add("hidden");
  }

  renderProfile(user) {
    tailwindTransitionShow(this.profilePage, [this.chatWrapper, this.authSection, this.editPage])
    this.profilePage.classList.remove("hidden");
    document.getElementById("chat-wrapper").classList.add("hidden");
    document.getElementById("auth-section").classList.add("hidden");

    this.profileName.textContent = `${user.name} ${user.lastname || ""}`;
    this.profileEmail.textContent = `📧 ${user.email}`;
    this.profileAvatar.src = `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}+${user.lastname || ""}`;
  }

  renderMessages(messages) {
    this.chatMessages.innerHTML = "";
    messages.forEach(msg => {
      const div = document.createElement("div");
      div.className = `flex ${msg.from === 'me' ? 'justify-end' : 'justify-start'}`;
      div.innerHTML = `
        <div class="${msg.from === 'me' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'} max-w-xs px-4 py-2 rounded-2xl shadow-sm text-sm ${msg.from === 'me' ? 'rounded-br-none' : 'rounded-bl-none'}">
          ${msg.text}
        </div>
      `;
      this.chatMessages.appendChild(div);
    });
    this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
  }

  renderContacts(contacts) {
    this.chatList.innerHTML = "";
    contacts.forEach(user => {
      const li = document.createElement("li");
      li.textContent = `👤 ${user.name} ${user.lastname}`;
      li.dataset.userId = user.id;
      li.className = "cursor-pointer px-4 py-3 hover:bg-gray-100 border-b text-sm";
      li.addEventListener("click", () => this.app.selectContact(user));
      this.chatList.appendChild(li);
    });
  }

  showEditProfile(user) {
    tailwindTransitionShow(this.editPage, [this.chatWrapper, this.authSection, this.profilePage])

    document.getElementById("chat-wrapper").classList.add("hidden");
    document.getElementById("profile-page").classList.add("hidden");
    document.getElementById("auth-section").classList.add("hidden");
    this.editPage.classList.remove("hidden");

    document.getElementById("edit-name").value = user.name || '';
    document.getElementById("edit-lastname").value = user.lastname || '';
    document.getElementById("edit-email").value = user.email || '';
    document.getElementById("edit-password").value = '';
  }
}

class App {
  constructor() {
    this.socketService = new SocketService(this);
    this.ui = new UI(this);
    this.messages = {};
    this.activeUser = null;
    this.user = null;

    this.auth = new AuthFormHandler(this);

    this.loadContacts();
  }

  async checkSession() {
    const res = await fetch("http://localhost:3000/api/me", { credentials: "include" });
    if (res.ok) {
      const data = await res.json();
      this.user = data.user;
      this.socketService.connect();
      this.auth.onLoginSuccess(data.user);
      this.showProfile();

    }
  }

  async logout() {
    await fetch("http://localhost:3000/api/logout", {
      method: "POST",
      credentials: "include"
    });
    window.location.reload();
  }

  async loadContacts() {
    const res = await fetch("http://localhost:3000/api/contacts", { credentials: "include" });
    const contacts = await res.json();
    this.ui.renderContacts(contacts);
  }

  async selectContact(user) {
    this.activeUser = user.id;
    this.ui.chatHeader.textContent = `👤 ${user.name} ${user.lastname}`;
    this.ui.chatForm.classList.remove("hidden");
    const res = await fetch(`http://localhost:3000/api/conversation?withUserId=${user.id}`, { credentials: "include" });
    const msgs = await res.json();
    this.messages[user.id] = msgs.map(m => ({
      from: m.id_sender === this.user.id ? 'me' : 'them',
      text: m.message,
      sent_at: m.sent_at
    }));
    this.ui.renderMessages(this.messages[user.id]);
  }

  addMessage(userId, message) {
    this.messages[userId] = this.messages[userId] || [];
    this.messages[userId].push(message);
    if (this.activeUser == userId) {
      this.ui.renderMessages(this.messages[userId]);
    }
  }

  async sendMessage(e) {
    e.preventDefault();
    const text = this.ui.chatInput.value.trim();
    if (!text || !this.activeUser) return;

    this.addMessage(this.activeUser, { from: "me", text, sent_at: new Date().toISOString() });

    await fetch("http://localhost:3000/api/send-message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ receiverId: this.activeUser, message: text })
    });

    this.socketService.send(this.activeUser, text);

    this.ui.chatInput.value = '';
    this.ui.renderMessages(this.messages[this.activeUser]);
  }

  async searchUsers(e) {
    const query = e.target.value.trim();
    if (!query) return;
    const res = await fetch("http://localhost:3000/api/search-users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ query })
    });
    const users = await res.json();
    this.ui.renderContacts(users);
  }

  showProfile() {
    this.ui.renderProfile(this.user);
  }
}

class AuthFormHandler {
  constructor(app) {
    this.app = app;
    this.loginBtn = document.getElementById('login-btn');
    this.signupBtn = document.getElementById('signup-btn');
    this.loginForm = document.getElementById('login-form');
    this.signupForm = document.getElementById('signup-form');
    this.panel = document.getElementById('panel-only');
    this.initEvents();
    this.panel.classList.add("hidden");
    this.app.checkSession();
  }

  initEvents() {
    this.loginBtn.addEventListener('click', () => this.toggleForm('login'));
    this.signupBtn.addEventListener('click', () => this.toggleForm('signup'));
    this.signupForm.addEventListener('submit', e => this.signup(e));
    this.loginForm.addEventListener('submit', e => this.login(e));
  }

  toggleForm(type) {
    document.getElementById('login-block').classList.toggle('hidden', type !== 'login');
    document.getElementById('signup-block').classList.toggle('hidden', type !== 'signup');
  }

  async signup(e) {
    e.preventDefault();
    const inputs = this.signupForm.querySelectorAll('input');
    const data = {
      name: inputs[0].value,
      lastName: inputs[1].value,
      email: inputs[2].value,
      password: inputs[3].value,
      birthdate: `${inputs[4].value}-${inputs[5].value}-${inputs[6].value}`
    };
    const res = await fetch('http://localhost:3000/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      credentials: 'include'
    });
    const result = await res.json();
    alert(result.message);
  }

  async login(e) {
    e.preventDefault();
    const inputs = this.loginForm.querySelectorAll('input');
    const data = { email: inputs[0].value, password: inputs[1].value };
    const res = await fetch('http://localhost:3000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      credentials: 'include'
    });
    const result = await res.json();
    if (res.ok) {
      this.app.checkSession();
    } else {
      alert(result.message);
    }
  }

  onLoginSuccess(user) {
    this.loginBtn.classList.add('hidden');
    this.signupBtn.classList.add('hidden');
    this.panel.classList.remove('hidden');
    const sidebar = document.querySelector('aside');
    const div = document.createElement("div");
    div.className = 'px-4 py-2 text-sm text-gray-700'
    div.innerHTML = `
      <p class="font-medium text-green-600">✅ Logged in</p>
      <p class="text-xs">Hey, <strong>${user.name} !</strong></p>
      <button id="logout-btn" class="mt-2 w-full bg-gray-200 text-gray-800 text-sm py-1 rounded hover:bg-gray-300">Logout</button>
    `;
    sidebar.appendChild(div);
    document.getElementById("logout-btn").addEventListener("click", () => this.app.logout());
  }
}

document.addEventListener("DOMContentLoaded", () => new App());
