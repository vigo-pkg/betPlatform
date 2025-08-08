// Конфигурация API
const API_BASE_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:8080/api' 
    : 'https://your-backend-url.onrender.com/api';

// Глобальные переменные
let currentUser = null;
let bets = [];

// Инициализация приложения
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    checkAuthState();
});

// Инициализация приложения
function initializeApp() {
    // Проверяем состояние аутентификации
    auth.onAuthStateChanged(function(user) {
        if (user) {
            currentUser = user;
            showMainContent();
            loadBets();
        } else {
            currentUser = null;
            showAuthSection();
        }
    });
}

// Настройка обработчиков событий
function setupEventListeners() {
    // Форма входа
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    
    // Кнопки навигации
    document.getElementById('loginBtn').addEventListener('click', showAuthSection);
    document.getElementById('registerBtn').addEventListener('click', handleRegister);
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);
    
    // Создание пари
    document.getElementById('createBetBtn').addEventListener('click', showCreateBetModal);
    document.getElementById('saveBetBtn').addEventListener('click', createBet);
    
    // Фильтры и поиск
    document.getElementById('statusFilter').addEventListener('change', filterBets);
    document.getElementById('searchBtn').addEventListener('click', searchBets);
    document.getElementById('searchInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') searchBets();
    });
}

// Проверка состояния аутентификации
function checkAuthState() {
    auth.onAuthStateChanged(function(user) {
        if (user) {
            currentUser = user;
            showMainContent();
            loadBets();
        } else {
            showAuthSection();
        }
    });
}

// Обработка входа
async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    try {
        await auth.signInWithEmailAndPassword(email, password);
        showMainContent();
        loadBets();
    } catch (error) {
        alert('Ошибка входа: ' + error.message);
    }
}

// Обработка регистрации
async function handleRegister() {
    const email = prompt('Введите email:');
    const password = prompt('Введите пароль (минимум 6 символов):');
    
    if (!email || !password) return;
    
    try {
        await auth.createUserWithEmailAndPassword(email, password);
        alert('Регистрация успешна!');
    } catch (error) {
        alert('Ошибка регистрации: ' + error.message);
    }
}

// Обработка выхода
async function handleLogout() {
    try {
        await auth.signOut();
        showAuthSection();
    } catch (error) {
        alert('Ошибка выхода: ' + error.message);
    }
}

// Показать секцию аутентификации
function showAuthSection() {
    document.getElementById('authSection').classList.remove('d-none');
    document.getElementById('mainContent').classList.add('d-none');
    document.getElementById('userInfo').classList.add('d-none');
}

// Показать основной контент
function showMainContent() {
    document.getElementById('authSection').classList.add('d-none');
    document.getElementById('mainContent').classList.remove('d-none');
    document.getElementById('userInfo').classList.remove('d-none');
    document.getElementById('userEmail').textContent = currentUser.email;
}

// Загрузка пари
async function loadBets() {
    try {
        const snapshot = await db.collection('bets').orderBy('createdAt', 'desc').get();
        bets = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        displayBets(bets);
    } catch (error) {
        console.error('Ошибка загрузки пари:', error);
    }
}

// Отображение пари
function displayBets(betsToShow) {
    const betsList = document.getElementById('betsList');
    betsList.innerHTML = '';
    
    if (betsToShow.length === 0) {
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
    col.className = 'col-md-6 col-lg-4 mb-4';
    
    const statusClass = `status-${bet.status.replace('-', '-')}`;
    const statusText = getStatusText(bet.status);
    
    col.innerHTML = `
        <div class="card bet-card ${statusClass}" onclick="openBet('${bet.id}')">
            <div class="card-header d-flex justify-content-between align-items-center">
                <h6 class="mb-0">${bet.title}</h6>
                <span class="badge bg-${getStatusColor(bet.status)}">${statusText}</span>
            </div>
            <div class="card-body">
                <p class="card-text">${bet.description}</p>
                <div class="row text-muted small">
                    <div class="col-6">
                        <i class="fas fa-calendar me-1"></i>
                        ${formatDate(bet.startDate)}
                    </div>
                    <div class="col-6">
                        <i class="fas fa-clock me-1"></i>
                        ${bet.duration}ч
                    </div>
                </div>
                <div class="mt-2">
                    <small class="text-muted">
                        <i class="fas fa-user me-1"></i>
                        Создатель: ${bet.creatorEmail}
                    </small>
                </div>
                ${bet.participantEmail ? `
                <div class="mt-1">
                    <small class="text-muted">
                        <i class="fas fa-users me-1"></i>
                        Участник: ${bet.participantEmail}
                    </small>
                </div>
                ` : ''}
                ${bet.observerEmail ? `
                <div class="mt-1">
                    <small class="text-muted">
                        <i class="fas fa-eye me-1"></i>
                        Наблюдатель: ${bet.observerEmail}
                    </small>
                </div>
                ` : ''}
            </div>
            <div class="card-footer">
                <small class="text-muted">
                    Создано: ${formatDate(bet.createdAt)}
                </small>
            </div>
        </div>
    `;
    
    return col;
}

// Получить текст статуса
function getStatusText(status) {
    const statusMap = {
        'open': 'Открыто',
        'in-progress': 'В процессе',
        'implemented': 'Реализовано',
        'finished': 'Завершено',
        'conflict': 'Конфликт',
        'resolved': 'Разрешено'
    };
    return statusMap[status] || status;
}

// Получить цвет статуса
function getStatusColor(status) {
    const colorMap = {
        'open': 'primary',
        'in-progress': 'warning',
        'implemented': 'info',
        'finished': 'success',
        'conflict': 'danger',
        'resolved': 'success'
    };
    return colorMap[status] || 'secondary';
}

// Форматирование даты
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Открыть пари
function openBet(betId) {
    // Здесь будет переход на страницу пари
    window.open(`/bet.html?id=${betId}`, '_blank');
}

// Показать модальное окно создания пари
function showCreateBetModal() {
    const modal = new bootstrap.Modal(document.getElementById('createBetModal'));
    modal.show();
}

// Создать пари
async function createBet() {
    const title = document.getElementById('betTitle').value;
    const description = document.getElementById('betDescription').value;
    const startDate = document.getElementById('startDate').value;
    const duration = parseInt(document.getElementById('duration').value);
    
    if (!title || !description || !startDate || !duration) {
        alert('Пожалуйста, заполните все поля');
        return;
    }
    
    try {
        const betData = {
            title: title,
            description: description,
            startDate: new Date(startDate),
            duration: duration,
            status: 'open',
            creatorId: currentUser.uid,
            creatorEmail: currentUser.email,
            createdAt: new Date(),
            updatedAt: new Date(),
            participantId: null,
            participantEmail: null,
            observerId: null,
            observerEmail: null,
            votes: {},
            winnerId: null,
            resolvedAt: null
        };
        
        await db.collection('bets').add(betData);
        
        // Закрыть модальное окно
        const modal = bootstrap.Modal.getInstance(document.getElementById('createBetModal'));
        modal.hide();
        
        // Очистить форму
        document.getElementById('createBetForm').reset();
        
        // Перезагрузить пари
        loadBets();
        
        alert('Пари успешно создано!');
    } catch (error) {
        alert('Ошибка создания пари: ' + error.message);
    }
}

// Фильтрация пари
function filterBets() {
    const statusFilter = document.getElementById('statusFilter').value;
    let filteredBets = bets;
    
    if (statusFilter) {
        filteredBets = bets.filter(bet => bet.status === statusFilter);
    }
    
    displayBets(filteredBets);
}

// Поиск пари
function searchBets() {
    const searchQuery = document.getElementById('searchInput').value.toLowerCase();
    const statusFilter = document.getElementById('statusFilter').value;
    
    let filteredBets = bets;
    
    // Фильтр по статусу
    if (statusFilter) {
        filteredBets = filteredBets.filter(bet => bet.status === statusFilter);
    }
    
    // Поиск по названию
    if (searchQuery) {
        filteredBets = filteredBets.filter(bet => 
            bet.title.toLowerCase().includes(searchQuery) ||
            bet.description.toLowerCase().includes(searchQuery)
        );
    }
    
    displayBets(filteredBets);
}

// Создание тестовых данных
async function createTestData() {
    const testBets = [
        {
            title: "Кто выиграет матч",
            description: "Матч между командой А и командой Б состоится в субботу",
            startDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // завтра
            duration: 48,
            status: 'open',
            creatorId: 'test-user-1',
            creatorEmail: 'user1@example.com',
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            title: "Погода в выходные",
            description: "Будет ли дождь в субботу и воскресенье",
            startDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // вчера
            duration: 72,
            status: 'in-progress',
            creatorId: 'test-user-2',
            creatorEmail: 'user2@example.com',
            participantId: 'test-user-3',
            participantEmail: 'user3@example.com',
            observerId: 'test-user-4',
            observerEmail: 'user4@example.com',
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            updatedAt: new Date()
        },
        {
            title: "Курс валют",
            description: "Какой будет курс доллара к рублю через неделю",
            startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // неделю назад
            duration: 168,
            status: 'implemented',
            creatorId: 'test-user-1',
            creatorEmail: 'user1@example.com',
            participantId: 'test-user-2',
            participantEmail: 'user2@example.com',
            observerId: 'test-user-3',
            observerEmail: 'user3@example.com',
            createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
            updatedAt: new Date()
        }
    ];
    
    for (const bet of testBets) {
        await db.collection('bets').add(bet);
    }
    
    console.log('Тестовые данные созданы');
}

// Инициализация тестовых данных (выполнить один раз)
// createTestData(); 