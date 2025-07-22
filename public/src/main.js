class AuthFormHandler {
  constructor() {
    this.loginBtn = document.getElementById('login-btn');
    this.signupBtn = document.getElementById('signup-btn');
    this.loginBlock = document.getElementById('login-block');
    this.signupBlock = document.getElementById('signup-block');
    this.signupForm = document.getElementById('signup-form');
    this.loginForm = document.getElementById('login-form');

    this.initEvents();
  }

  initEvents() {
    this.loginBtn.addEventListener('click', () => this.toggleForm('login'));
    this.signupBtn.addEventListener('click', () => this.toggleForm('signup'));
    this.signupForm.addEventListener('submit', (e) => this.handleSignup(e));
    this.loginForm.addEventListener('submit', (e) => this.handleLogin(e));
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
        alert('Connexion réussie !');
        this.checkSession();
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error('Erreur lors de la connexion :', error);
      alert('Une erreur est survenue.');
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
