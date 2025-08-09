// Конфигурация API
const isLocalhost = ['localhost', '127.0.0.1', '::1'].includes(window.location.hostname);
const API_BASE_URL = isLocalhost ? 'http://localhost:8080/api' : (window.location.origin + '/api');

// Глобальные переменные
let currentUser = null;
let bets = [];
let authToken = localStorage.getItem('authToken');
let currentPage = 0;
let pageSize = 12;

function initApp() {
  setupEventListeners();
  if (authToken) {
    validateToken()
      .then((ok) => {
        if (ok) {
          showMainContent();
          loadBets();
        } else {
          showAuthSection();
        }
      })
      .catch(() => showAuthSection());
  } else {
    showAuthSection();
  }
}

// Инициализация приложения (надежный запуск независимо от момента загрузки скрипта)
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

// Валидация токена против backend
async function validateToken() {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/validate`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    if (!res.ok) return false;
    const user = await res.json();
    currentUser = user;
    return true;
  } catch (_) {
    return false;
  }
}

// Настройка обработчиков событий
function setupEventListeners() {
  // Форма входа
  const loginForm = document.getElementById('loginForm');
  if (loginForm && !loginForm._bound) {
    loginForm.addEventListener('submit', handleLogin);
    loginForm._bound = true;
  }

  // Кнопки навигации
  const loginBtn = document.getElementById('loginBtn');
  if (loginBtn && !loginBtn._bound) {
    loginBtn.addEventListener('click', showAuthSection);
    loginBtn._bound = true;
  }
  const registerBtn = document.getElementById('registerBtn');
  if (registerBtn && !registerBtn._bound) {
    // Открывается через data-bs-атрибут
    registerBtn._bound = true;
  }
  const confirmRegisterBtn = document.getElementById('confirmRegisterBtn');
  if (confirmRegisterBtn && !confirmRegisterBtn._bound) {
    confirmRegisterBtn.addEventListener('click', handleRegister);
    confirmRegisterBtn._bound = true;
  }
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn && !logoutBtn._bound) {
    logoutBtn.addEventListener('click', handleLogout);
    logoutBtn._bound = true;
  }

  // Создание пари
  const createBetBtn = document.getElementById('createBetBtn');
  if (createBetBtn && !createBetBtn._bound) {
    createBetBtn.addEventListener('click', showCreateBetModal);
    createBetBtn._bound = true;
  }
  const saveBetBtn = document.getElementById('saveBetBtn');
  if (saveBetBtn && !saveBetBtn._bound) {
    saveBetBtn.addEventListener('click', createBet);
    saveBetBtn._bound = true;
  }

  // Фильтры и поиск (серверная фильтрация)
  const statusFilter = document.getElementById('statusFilter');
  if (statusFilter && !statusFilter._bound) {
    statusFilter.addEventListener('change', () => { currentPage = 0; loadBets(); });
    statusFilter._bound = true;
  }
  const searchBtn = document.getElementById('searchBtn');
  if (searchBtn && !searchBtn._bound) {
    searchBtn.addEventListener('click', (e) => { e.preventDefault(); currentPage = 0; loadBets(); });
    searchBtn._bound = true;
  }
  const searchInput = document.getElementById('searchInput');
  if (searchInput && !searchInput._bound) {
    searchInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') { e.preventDefault(); currentPage = 0; loadBets(); }
    });
    searchInput._bound = true;
  }
}

// Обработка входа (REST, JWT)
async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  try {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) {
      let msg = `HTTP ${res.status}`;
      try { const data = await res.json(); if (data.message) msg = data.message; } catch(_) {}
      alert('Ошибка входа: ' + msg);
      return;
    }
    const data = await res.json();
    authToken = data.token;
    localStorage.setItem('authToken', authToken);
    currentUser = data.user || { email };
    document.getElementById('email').value = '';
    document.getElementById('password').value = '';
    showMainContent();
    loadBets();
  } catch (error) {
    alert('Ошибка входа: ' + error.message);
  }
}

// Обработка регистрации через REST
async function handleRegister() {
  const firstName = document.getElementById('regFirstName').value.trim();
  const lastName = document.getElementById('regLastName').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const password = document.getElementById('regPassword').value;
  if (!firstName || !lastName || !email || !password) { alert('Заполните все поля'); return; }
  try {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ firstName, lastName, email, password })
    });
    if (!res.ok) {
      let msg = `HTTP ${res.status}`;
      try { const data = await res.json(); if (data.message) msg = data.message; } catch(_) {}
      alert('Ошибка регистрации: ' + msg);
      return;
    }
    const data = await res.json();
    authToken = data.token;
    localStorage.setItem('authToken', authToken);
    currentUser = data.user || { email };
    const modal = bootstrap.Modal.getInstance(document.getElementById('registerModal'));
    if (modal) modal.hide();
    showMainContent();
    loadBets();
  } catch (error) {
    alert('Ошибка регистрации: ' + error.message);
  }
}

// Обработка выхода
async function handleLogout() {
  localStorage.removeItem('authToken');
  authToken = null;
  currentUser = null;
  showAuthSection();
}

// Показать секцию аутентификации
function showAuthSection() {
  document.getElementById('authSection').classList.remove('d-none');
  document.getElementById('mainContent').classList.add('d-none');
  document.getElementById('userInfo').classList.add('d-none');
  document.getElementById('logoutBtn').classList.add('d-none');
}

// Показать основной контент
function showMainContent() {
  document.getElementById('authSection').classList.add('d-none');
  document.getElementById('mainContent').classList.remove('d-none');
  document.getElementById('userInfo').classList.remove('d-none');
  document.getElementById('logoutBtn').classList.remove('d-none');
  if (currentUser && currentUser.email) {
    document.getElementById('userEmail').textContent = currentUser.email;
  }
}

// Загрузка пари через REST (Page<BetResponse>)
async function loadBets() {
  try {
    const params = new URLSearchParams();
    const statusVal = document.getElementById('statusFilter')?.value || '';
    const searchVal = document.getElementById('searchInput')?.value.trim() || '';
    if (statusVal) params.set('status', statusVal);
    if (searchVal) params.set('search', searchVal);
    params.set('page', String(currentPage));
    params.set('size', String(pageSize));

    const res = await fetch(`${API_BASE_URL}/bets?${params.toString()}`, {
      headers: authToken ? { 'Authorization': `Bearer ${authToken}` } : {}
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const page = await res.json();
    bets = Array.isArray(page) ? page : (page.content || []);
    displayBets(bets);
  } catch (error) {
    console.error('Ошибка загрузки пари:', error);
    const container = document.getElementById('betsContainer');
    if (container) container.innerHTML = '<div class="col-12"><div class="alert alert-danger">Не удалось загрузить пари</div></div>';
  }
}

// Отображение пари
function displayBets(betsToShow) {
  const betsList = document.getElementById('betsContainer');
  betsList.innerHTML = '';
  if (!betsToShow || betsToShow.length === 0) {
    betsList.innerHTML = '<div class="col-12"><div class="alert alert-info">Пари не найдены</div></div>';
    return;
  }
  betsToShow.forEach(bet => {
    const betCard = createBetCard(bet);
    betsList.appendChild(betCard);
  });
}

// Создание карточки пари
function createBetCard(bet) {
  const col = document.createElement('div');
  col.className = 'col-md-6 col-lg-4';
  const normalizedStatus = normalizeStatus(bet.status);
  const statusClass = `status-${normalizedStatus}`;
  const statusText = getStatusText(normalizedStatus);
  col.innerHTML = `
    <div class="card bet-card ${statusClass}" onclick="openBet('${bet.id}')">
      <div class="card-header d-flex justify-content-between align-items-center">
        <h6 class="mb-0">${bet.title}</h6>
        <span class="badge bg-${getStatusColor(normalizedStatus)}">${statusText}</span>
      </div>
      <div class="card-body">
        <p class="card-text">${bet.description || ''}</p>
        <div class="row text-muted small">
          <div class="col-6"><i class="fa-regular fa-calendar-days me-1"></i>${formatDate(bet.startDate)}</div>
          <div class="col-6"><i class="fa-regular fa-clock me-1"></i>${bet.duration}ч</div>
        </div>
        <div class="mt-2"><small class="text-muted"><i class="fa-solid fa-user me-1"></i>Создатель: ${bet.creator?.email || ''}</small></div>
        ${bet.participant ? `<div class="mt-1"><small class="text-muted"><i class="fa-solid fa-users me-1"></i>Участник: ${bet.participant.email}</small></div>` : ''}
        ${bet.observer ? `<div class="mt-1"><small class="text-muted"><i class="fa-solid fa-eye me-1"></i>Наблюдатель: ${bet.observer.email}</small></div>` : ''}
      </div>
      <div class="card-footer"><small class="text-muted">Создано: ${formatDate(bet.createdAt)}</small></div>
    </div>`;
  return col;
}

function normalizeStatus(status) {
  if (!status) return 'open';
  const s = typeof status === 'string' ? status : String(status);
  switch (s.toUpperCase()) {
    case 'OPEN': return 'open';
    case 'IN_PROGRESS': return 'in-progress';
    case 'IMPLEMENTED': return 'implemented';
    case 'CONFLICT': return 'conflict';
    case 'RESOLVED': return 'resolved';
    case 'FINISHED': return 'finished';
    default: return 'open';
  }
}

function getStatusText(status) {
  const map = { 'open':'Открыто', 'in-progress':'В процессе', 'implemented':'Реализовано', 'conflict':'Конфликт', 'resolved':'Разрешено', 'finished':'Завершено' };
  return map[status] || status;
}
function getStatusColor(status) {
  const map = { 'open':'primary', 'in-progress':'warning', 'implemented':'info', 'conflict':'danger', 'resolved':'success', 'finished':'success' };
  return map[status] || 'secondary';
}
function formatDate(val) {
  if (!val) return '';
  const d = new Date(val); if (isNaN(d)) return '';
  return d.toLocaleDateString('ru-RU', { year:'numeric', month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' });
}

function openBet(betId) { window.open(`bet-detail.html?id=${betId}`, '_self'); }

function showCreateBetModal() { new bootstrap.Modal(document.getElementById('createBetModal')).show(); }

// Создать пари через REST
async function createBet() {
  const title = document.getElementById('betTitle').value;
  const description = document.getElementById('betDescription').value;
  const startDate = document.getElementById('startDate').value;
  const duration = parseInt(document.getElementById('duration').value, 10);
  if (!title || !description || !startDate || !duration) { alert('Пожалуйста, заполните все поля'); return; }
  try {
    const res = await fetch(`${API_BASE_URL}/bets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {}) },
      body: JSON.stringify({ title, description, startDate, duration })
    });
    if (!res.ok) {
      let msg = `HTTP ${res.status}`; try { const d = await res.json(); if (d.message) msg = d.message; } catch(_) {}
      alert('Ошибка создания пари: ' + msg);
      return;
    }
    const modal = bootstrap.Modal.getInstance(document.getElementById('createBetModal')); if (modal) modal.hide();
    document.getElementById('createBetForm').reset();
    loadBets();
    alert('Пари успешно создано!');
  } catch (e) { alert('Ошибка создания пари: ' + e.message); }
} 