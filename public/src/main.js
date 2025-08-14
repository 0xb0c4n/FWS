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


const $ = (sel, root=document) => root.querySelector(sel);
const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

const form = $('#missionForm');
const preview = {
  title: $('#p_title'), client: $('#p_client'), meta: $('#p_meta'), desc: $('#p_desc'),
  skills: $('#p_skills'), status: $('#p_status')
};

// Dynamic lists (deliverables, requirements)
function addListItem(wrapperId, placeholder){
  const wrap = document.getElementById(wrapperId);
  const row = document.createElement('div');
  row.className = 'flex items-center gap-2';
  row.innerHTML = `
    <input type="text" class="flex-1 rounded-xl border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-gray-900" placeholder="${placeholder}" />
    <button type="button" class="px-2 py-1 text-sm rounded-lg border">Supprimer</button>
  `;
  row.querySelector('button').addEventListener('click', ()=> row.remove());
  wrap.appendChild(row);
}

$('[data-add="del"]').addEventListener('click', ()=> addListItem('delWrap', 'Ex: MVP fonctionnel, guide d\'utilisation…'));
$('[data-add="req"]').addEventListener('click', ()=> addListItem('reqWrap', 'Ex: 3+ ans React, bonne com…'));

// Skills tags
const skillsBox = $('#skillsBox');
const skillInput = $('#skillInput');
const skills = new Set();
function renderSkills(){
  $$('.chip', skillsBox).forEach(c=>c.remove());
  skills.forEach(s=>{
    const chip = document.createElement('span');
    chip.className='chip text-sm';
    chip.innerHTML = `${s} <button type="button" aria-label="retirer">✕</button>`;
    chip.querySelector('button').addEventListener('click', ()=>{ skills.delete(s); renderSkills(); updatePreview(); saveLocal(); });
    skillsBox.insertBefore(chip, skillInput);
  });
}
skillInput.addEventListener('keydown', e=>{
  if(e.key==='Enter' && skillInput.value.trim()){
    e.preventDefault();
    skills.add(skillInput.value.trim());
    skillInput.value='';
    renderSkills();
    updatePreview();
    saveLocal();
  }
});

// Preview update
function updatePreview(){
  const title = $('#title').value.trim();
  const client = $('#client').value.trim();
  const workMode = $('#workMode').value || '—';
  const engagement = $('#engagement').value || '—';
  const model = $('#budgetModel').value;
  const bMin = $('#budgetMin').value; const bMax = $('#budgetMax').value; const cur = $('#currency').value;
  const desc = $('#description').value.trim();
  const open = $('#status').checked;

  preview.title.textContent = title || 'Titre de la mission';
  preview.client.textContent = client || '';

  let budgetLabel = '—';
  if(model==='tjm') budgetLabel = `TJM ${bMin||'?'}${bMax? '–'+bMax:''} ${cur}`;
  if(model==='taux_horaire') budgetLabel = `Taux ${bMin||'?'}${bMax? '–'+bMax:''} ${cur}/h`;
  if(model==='forfait') budgetLabel = `Forfait ${bMin||'?'}${bMax? '–'+bMax:''} ${cur}`;

  preview.meta.textContent = `${workMode} • ${engagement} • ${budgetLabel}`;
  preview.desc.textContent = desc ? (desc.length>160? desc.slice(0,157)+'…':desc) : 'Brève description…';

  preview.status.textContent = open? 'Ouverte':'Fermée';
  preview.status.className = `text-xs px-2 py-1 rounded-full ${open? 'bg-green-50 text-green-700':'bg-gray-100 text-gray-600'}`;

  // skills
  preview.skills.innerHTML='';
  skills.forEach(s=>{
    const tag = document.createElement('span');
    tag.className='text-xs px-2 py-1 rounded-full bg-gray-100';
    tag.textContent=s; preview.skills.appendChild(tag);
  });
}

// Validation + submit
function setErr(id, show){
  const e = document.querySelector(`[data-err="${id}"]`); if(!e) return; e.classList.toggle('hidden', !show);
}

form.addEventListener('input', ()=>{ updatePreview(); saveLocal(); });

form.addEventListener('submit', e=>{
  e.preventDefault();
  // required: title, workMode, engagement, description, budgetModel
  const required = ['title','workMode','engagement','description','budgetModel'];
  let ok = true;
  required.forEach(id=>{
    const el = document.getElementById(id);
    const valid = !!(el && (el.value || (el.type==='checkbox' && el.checked)));
    setErr(id, !valid); if(!valid) ok=false;
  });
  if(!ok){ window.scrollTo({top:0,behavior:'smooth'}); return; }

  const data = gatherData();
  localStorage.setItem('missionDraft', JSON.stringify(data));
  showToast('Mission publiée (brouillon local)');
});

// JSON export
$('#saveJsonBtn').addEventListener('click', ()=>{
  const data = gatherData();
  const blob = new Blob([JSON.stringify(data, null, 2)], {type:'application/json'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `mission-freelance.json`;
  a.click();
});

// Reset
$('#resetBtn').addEventListener('click', ()=>{
  localStorage.removeItem('missionDraft');
  form.reset(); skills.clear(); renderSkills(); updatePreview();
});

// Preview button
$('#previewBtn').addEventListener('click', ()=> updatePreview());

// Persist to localStorage
function saveLocal(){ localStorage.setItem('missionDraft', JSON.stringify(gatherData())); }
function loadLocal(){
  const raw = localStorage.getItem('missionDraft');
  if(!raw) return; try{
    const d = JSON.parse(raw);
    $('#title').value = d.title||''; $('#client').value=d.client||''; $('#location').value=d.location||'';
    $('#workMode').value=d.workMode||''; $('#timezone').value=d.timezone||''; $('#engagement').value=d.engagement||'';
    $('#startDate').value=d.startDate||''; $('#duration').value=d.duration||''; $('#freelancersCount').value=d.freelancersCount||1;
    $('#budgetModel').value=d.budgetModel||''; $('#budgetMin').value=d.budgetMin||''; $('#budgetMax').value=d.budgetMax||''; $('#currency').value=d.currency||'EUR';
    $('#description').value=d.description||''; $('#applicationDeadline').value=d.applicationDeadline||''; $('#nda').value=d.nda||'Non';
    $('#language').value=d.language||''; $('#billing').value=d.billing||'Mensuelle'; $('#paymentTerms').value=d.paymentTerms||''; $('#contact').value=d.contact||''; $('#applyUrl').value=d.applyUrl||'';
    $('#acceptPortfolio').checked=!!d.acceptPortfolio; $('#status').checked=!!d.status;
    (d.skills||[]).forEach(s=>skills.add(s)); renderSkills(); updatePreview();
  }catch(e){}
}

function gatherData(){
  return {
    title: $('#title').value.trim(), client: $('#client').value.trim(), location: $('#location').value.trim(),
    workMode: $('#workMode').value, timezone: $('#timezone').value.trim(), engagement: $('#engagement').value,
    startDate: $('#startDate').value, duration: $('#duration').value.trim(), freelancersCount: +($('#freelancersCount').value||1),
    budgetModel: $('#budgetModel').value, budgetMin: $('#budgetMin').value, budgetMax: $('#budgetMax').value, currency: $('#currency').value,
    description: $('#description').value.trim(),
    deliverables: $$('#delWrap input').map(i=>i.value).filter(Boolean),
    requirements: $$('#reqWrap input').map(i=>i.value).filter(Boolean),
    skills: Array.from(skills),
    applicationDeadline: $('#applicationDeadline').value,
    nda: $('#nda').value, language: $('#language').value.trim(),
    billing: $('#billing').value, paymentTerms: $('#paymentTerms').value.trim(),
    contact: $('#contact').value.trim(), applyUrl: $('#applyUrl').value.trim(),
    acceptPortfolio: $('#acceptPortfolio').checked,
    status: $('#status').checked
  };
}

function showToast(msg){
  const wrap = $('#toast');
  wrap.firstElementChild.textContent = msg;
  wrap.classList.remove('hidden');
  setTimeout(()=>wrap.classList.add('hidden'), 1800);
}

// Init
loadLocal();
updatePreview();
