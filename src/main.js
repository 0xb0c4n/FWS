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
      const res = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
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
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();

      if (res.ok) {
        alert('Connexion réussie !');
        localStorage.setItem('token', result.token);
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error('Erreur lors de la connexion :', error);
      alert('Une erreur est survenue.');
    }
  }
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
  new AuthFormHandler();
});
