class AuthFormHandler {
  constructor() {
    this.loginBtn = document.getElementById('login-btn');
    this.signupBtn = document.getElementById('signup-btn');
    this.loginBlock = document.getElementById('login-block');
    this.signupBlock = document.getElementById('signup-block');
    this.signupForm = document.getElementById('signup-form');
    this.loginForm = document.getElementById('login-form');
    this.panel = document.getElementById('panel-only');

    this.initEvents();
  }

  initEvents() {
    this.loginBtn.addEventListener('click', () => this.toggleForm('login'));
    this.signupBtn.addEventListener('click', () => this.toggleForm('signup'));
    this.signupForm.addEventListener('submit', (e) => this.handleSignup(e));
    this.loginForm.addEventListener('submit', (e) => this.handleLogin(e));
    this.panel.classList.add("hidden")
  }

  toggleForm(type) {
    if (type === 'login') {
      this.loginBlock.classList.remove('hidden');
      this.signupBlock.classList.add('hidden');
    } else {
      this.signupBlock.classList.remove('hidden');
      this.loginBlock.classList.add('hidden');
    }
  }

  async handleSignup(e) {
    e.preventDefault();
    const inputs = e.target.querySelectorAll('input');
    const data = {
      name: inputs[0].value,
      lastName: inputs[1].value,
      email: inputs[2].value,
      password: inputs[3].value,
      birthdate: `${inputs[4].value}-${inputs[5].value}-${inputs[6].value}`,
    };

    try {
      const res = await fetch('http://localhost:3000/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include'
      });
      const result = await res.json();
      alert(result.message);
    } catch (error) {
      console.error('Erreur lors de l\'inscription :', error);
      alert('Une erreur est survenue.');
    }
  }

  async handleLogin(e) {
    e.preventDefault();
    const inputs = e.target.querySelectorAll('input');
    const data = {
      email: inputs[0].value,
      password: inputs[1].value,
    };

    try {
      const res = await fetch('http://localhost:3000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include'
      });
      const result = await res.json();

      if (res.ok) {
        this.checkSession();
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error('Erreur lors de la connexion :', error);
    }
  }
  async checkSession() {
    try {
      const res = await fetch('http://localhost:3000/api/me', {
        method: 'GET',
        credentials: 'include'
      });

      if (res.ok) {
        const result = await res.json();

        this.loginBtn.classList.add('hidden');
        this.signupBtn.classList.add('hidden');
        this.panel.classList.remove('hidden')
        this.panel.classList.add('visible')

        const sidebar = document.querySelector('aside');

        const userInfo = document.createElement('div');
        userInfo.className = 'px-4 py-2 text-sm text-gray-700';
        userInfo.innerHTML = `
          <p class="font-medium text-green-600">✅ Connecté</p>
          <p class="text-xs">Bonjour, <strong>${result.user.name}</strong></p>
          <button id="logout-btn" class="mt-2 w-full bg-gray-200 text-gray-800 text-sm py-1 rounded hover:bg-gray-300">Logout</button>
        `;

        sidebar.appendChild(userInfo);

        document.getElementById('logout-btn').addEventListener('click', async () => {
          await fetch('http://localhost:3000/api/logout', {
            method: 'POST',
            credentials: 'include'
          });
          window.location.reload();
        });
      }
    } catch (error) {
      console.error('Erreur lors de la vérification de session :', error);
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new AuthFormHandler();
  authHandler.checkSession();

});


// Activer l'interface de messagerie
document.querySelectorAll('a').forEach(link => {
  if (link.textContent.includes('Chat')) {
    link.addEventListener('click', e => {
      e.preventDefault();
      document.getElementById('auth-section').classList.add('hidden');
      document.getElementById('chat-wrapper').classList.remove('hidden');
    });
  }
});

// Gestion des contacts
const chatList = document.getElementById('chat-list');
const chatHeader = document.getElementById('chat-header');
const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-input');
const chatMessages = document.getElementById('chat-messages');

const conversations = {}; // Stocke les messages par contact
let activeUser = null;

chatList.querySelectorAll('li').forEach(item => {
  item.addEventListener('click', () => {
    activeUser = item.getAttribute('data-user');
    chatHeader.textContent = `👤 ${activeUser}`;
    chatForm.classList.remove('hidden');
    renderMessages();
  });
});

function renderMessages() {
  chatMessages.innerHTML = '';
  (conversations[activeUser] || []).forEach(msg => {
    const msgDiv = document.createElement('div');
    msgDiv.className = `flex ${msg.from === 'me' ? 'justify-end' : 'justify-start'}`;
    msgDiv.innerHTML = `
      <div class="${msg.from === 'me' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'} max-w-xs px-4 py-2 rounded-2xl shadow-sm text-sm ${msg.from === 'me' ? 'rounded-br-none' : 'rounded-bl-none'}">
        ${msg.text}
      </div>
    `;
    chatMessages.appendChild(msgDiv);
  });
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Envoi de message
chatForm.addEventListener('submit', e => {
  e.preventDefault();
  const text = chatInput.value.trim();
  if (!text || !activeUser) return;

  conversations[activeUser] = conversations[activeUser] || [];
  conversations[activeUser].push({ from: 'me', text });

  chatInput.value = '';
  renderMessages();

  // Simule une réponse
  setTimeout(() => {
    conversations[activeUser].push({ from: 'them', text: `Tu dis : "${text}" ? 😄` });
    renderMessages();
  }, 600);
});
