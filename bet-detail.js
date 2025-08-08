// Глобальные переменные
let currentUser = null;
let currentBet = null;
let authToken = localStorage.getItem('authToken');
let betId = null;

// API базовый URL
const API_BASE_URL = 'http://localhost:8080/api';

// Инициализация приложения
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Инициализация приложения
function initializeApp() {
    // Получаем ID пари из URL
    const urlParams = new URLSearchParams(window.location.search);
    betId = urlParams.get('id');
    
    if (!betId) {
        showError('ID пари не указан');
        return;
    }
    
    // Проверяем токен
    if (authToken) {
        validateToken();
    } else {
        showError('Необходима авторизация');
    }
}

// Валидация токена
async function validateToken() {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/validate`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                try {
                    const userData = await response.json();
                    currentUser = userData;
                    document.getElementById('userEmail').textContent = currentUser.email;
                    loadBetDetails();
                } catch (jsonError) {
                    console.error('Ошибка парсинга JSON при валидации токена:', jsonError);
                    showError('Ошибка авторизации');
                }
            } else {
                showError('Ошибка авторизации');
            }
        } else {
            showError('Ошибка авторизации');
        }
    } catch (error) {
        console.error('Ошибка валидации токена:', error);
        showError('Ошибка авторизации');
    }
}

// Загрузка деталей пари
async function loadBetDetails() {
    try {
        const response = await fetch(`${API_BASE_URL}/bets/${betId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                try {
                    const betData = await response.json();
                    currentBet = betData;
                    displayBetDetails();
                    loadVotes();
                    loadComments();
                } catch (jsonError) {
                    console.error('Ошибка парсинга JSON:', jsonError);
                    showError('Ошибка загрузки данных пари');
                }
            } else {
                showError('Неверный формат ответа сервера');
            }
        } else {
            showError(`Ошибка загрузки пари: HTTP ${response.status}`);
        }
    } catch (error) {
        console.error('Ошибка загрузки пари:', error);
        showError('Ошибка загрузки пари: ' + error.message);
    }
}

// Отображение деталей пари
function displayBetDetails() {
    // Основная информация
    document.getElementById('betTitle').textContent = currentBet.title;
    document.getElementById('betDescription').textContent = currentBet.description || 'Описание отсутствует';
    document.getElementById('betStartDate').textContent = formatDate(currentBet.startDate);
    document.getElementById('betDuration').textContent = `${currentBet.duration} часов`;
    
    // Статус
    const statusElement = document.getElementById('betStatus');
    statusElement.textContent = getStatusText(currentBet.status);
    statusElement.className = `badge status-badge bg-${getStatusColor(currentBet.status)}`;
    
    // Участники
    document.getElementById('betCreator').textContent = currentBet.creator ? 
        `${currentBet.creator.firstName} ${currentBet.creator.lastName}` : 'Неизвестно';
    
    document.getElementById('betParticipant').textContent = currentBet.participant ? 
        `${currentBet.participant.firstName} ${currentBet.participant.lastName}` : 'Не назначен';
    
    document.getElementById('betObserver').textContent = currentBet.observer ? 
        `${currentBet.observer.firstName} ${currentBet.observer.lastName}` : 'Не назначен';
    
    // Управление участниками
    updateParticipantSection();
    updateObserverSection();
    
    // Административные действия
    updateAdminActions();
    
    // Показываем контент
    document.getElementById('loadingSection').classList.add('d-none');
    document.getElementById('betDetailSection').classList.remove('d-none');
}

// Обновление секции участника
function updateParticipantSection() {
    const participantInfo = document.getElementById('participantInfo');
    const joinBtn = document.getElementById('joinParticipantBtn');
    
    if (currentBet.participant) {
        participantInfo.innerHTML = `
            <div class="d-flex align-items-center">
                <i class="fas fa-user-friends me-2 text-primary"></i>
                <div>
                    <strong>${currentBet.participant.firstName} ${currentBet.participant.lastName}</strong>
                    <br><small class="text-muted">${currentBet.participant.email}</small>
                </div>
            </div>
        `;
        joinBtn.style.display = 'none';
    } else {
        participantInfo.innerHTML = `
            <p class="text-muted">Участник не назначен</p>
            <button class="btn btn-primary btn-sm" onclick="joinAsParticipant()" id="joinParticipantBtn">
                <i class="fas fa-user-plus me-1"></i>Присоединиться как участник
            </button>
        `;
    }
}

// Обновление секции наблюдателя
function updateObserverSection() {
    const observerInfo = document.getElementById('observerInfo');
    const joinBtn = document.getElementById('joinObserverBtn');
    
    if (currentBet.observer) {
        observerInfo.innerHTML = `
            <div class="d-flex align-items-center">
                <i class="fas fa-eye me-2 text-secondary"></i>
                <div>
                    <strong>${currentBet.observer.firstName} ${currentBet.observer.lastName}</strong>
                    <br><small class="text-muted">${currentBet.observer.email}</small>
                </div>
            </div>
        `;
        joinBtn.style.display = 'none';
    } else {
        observerInfo.innerHTML = `
            <p class="text-muted">Наблюдатель не назначен</p>
            <button class="btn btn-secondary btn-sm" onclick="joinAsObserver()" id="joinObserverBtn">
                <i class="fas fa-eye me-1"></i>Присоединиться как наблюдатель
            </button>
        `;
    }
}

// Обновление административных действий
function updateAdminActions() {
    const resolveBtn = document.getElementById('resolveBtn');
    const finishBtn = document.getElementById('finishBtn');
    
    // Показываем кнопки только создателю пари
    if (currentUser && currentBet.creator && currentUser.id === currentBet.creator.id) {
        if (currentBet.status === 'CONFLICT') {
            resolveBtn.style.display = 'inline-block';
        }
        if (currentBet.status === 'OPEN' || currentBet.status === 'IN_PROGRESS') {
            finishBtn.style.display = 'inline-block';
        }
    }
}

// Присоединение как участник
async function joinAsParticipant() {
    try {
        const response = await fetch(`${API_BASE_URL}/bets/${betId}/join`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                role: 'PARTICIPANT'
            })
        });
        
        if (response.ok) {
            await loadBetDetails(); // Перезагружаем данные
            showSuccess('Вы успешно присоединились как участник!');
        } else {
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                try {
                    const errorData = await response.json();
                    showError('Ошибка присоединения: ' + (errorData.message || 'Неизвестная ошибка'));
                } catch (jsonError) {
                    showError('Ошибка присоединения: Неверный формат ответа сервера');
                }
            } else {
                showError(`Ошибка присоединения: HTTP ${response.status}`);
            }
        }
    } catch (error) {
        console.error('Ошибка присоединения:', error);
        showError('Ошибка присоединения: ' + error.message);
    }
}

// Присоединение как наблюдатель
async function joinAsObserver() {
    try {
        const response = await fetch(`${API_BASE_URL}/bets/${betId}/join`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                role: 'OBSERVER'
            })
        });
        
        if (response.ok) {
            await loadBetDetails(); // Перезагружаем данные
            showSuccess('Вы успешно присоединились как наблюдатель!');
        } else {
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                try {
                    const errorData = await response.json();
                    showError('Ошибка присоединения: ' + (errorData.message || 'Неизвестная ошибка'));
                } catch (jsonError) {
                    showError('Ошибка присоединения: Неверный формат ответа сервера');
                }
            } else {
                showError(`Ошибка присоединения: HTTP ${response.status}`);
            }
        }
    } catch (error) {
        console.error('Ошибка присоединения:', error);
        showError('Ошибка присоединения: ' + error.message);
    }
}

// Загрузка голосов
async function loadVotes() {
    try {
        const response = await fetch(`${API_BASE_URL}/bets/${betId}/votes`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                try {
                    const votesData = await response.json();
                    displayVotes(votesData);
                } catch (jsonError) {
                    console.error('Ошибка парсинга голосов:', jsonError);
                }
            }
        }
    } catch (error) {
        console.error('Ошибка загрузки голосов:', error);
    }
}

// Отображение голосов
function displayVotes(votesData) {
    const totalVotes = votesData.forVotes + votesData.againstVotes;
    const forPercentage = totalVotes > 0 ? (votesData.forVotes / totalVotes) * 100 : 0;
    const againstPercentage = totalVotes > 0 ? (votesData.againstVotes / totalVotes) * 100 : 0;
    
    document.getElementById('voteForProgress').style.width = `${forPercentage}%`;
    document.getElementById('voteAgainstProgress').style.width = `${againstPercentage}%`;
    document.getElementById('voteForCount').textContent = `${votesData.forVotes} голосов`;
    document.getElementById('voteAgainstCount').textContent = `${votesData.againstVotes} голосов`;
    
    // Проверяем, голосовал ли текущий пользователь
    if (votesData.userVote !== null) {
        const voteButtons = document.getElementById('voteButtons');
        voteButtons.innerHTML = `
            <span class="badge bg-info">
                <i class="fas fa-check me-1"></i>Вы уже проголосовали
            </span>
        `;
    }
}

// Голосование
async function vote(voteFor) {
    try {
        const response = await fetch(`${API_BASE_URL}/bets/${betId}/vote`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                vote: voteFor
            })
        });
        
        if (response.ok) {
            await loadVotes(); // Перезагружаем голоса
            showSuccess('Ваш голос учтен!');
        } else {
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                try {
                    const errorData = await response.json();
                    showError('Ошибка голосования: ' + (errorData.message || 'Неизвестная ошибка'));
                } catch (jsonError) {
                    showError('Ошибка голосования: Неверный формат ответа сервера');
                }
            } else {
                showError(`Ошибка голосования: HTTP ${response.status}`);
            }
        }
    } catch (error) {
        console.error('Ошибка голосования:', error);
        showError('Ошибка голосования: ' + error.message);
    }
}

// Загрузка комментариев
async function loadComments() {
    try {
        const response = await fetch(`${API_BASE_URL}/bets/${betId}/comments`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                try {
                    const commentsData = await response.json();
                    displayComments(commentsData);
                } catch (jsonError) {
                    console.error('Ошибка парсинга комментариев:', jsonError);
                }
            }
        }
    } catch (error) {
        console.error('Ошибка загрузки комментариев:', error);
    }
}

// Отображение комментариев
function displayComments(comments) {
    const commentsSection = document.getElementById('commentsSection');
    
    if (!comments || comments.length === 0) {
        commentsSection.innerHTML = '<p class="text-muted">Комментариев пока нет</p>';
        return;
    }
    
    const commentsHtml = comments.map(comment => `
        <div class="border-bottom pb-2 mb-2">
            <div class="d-flex justify-content-between">
                <strong>${comment.author.firstName} ${comment.author.lastName}</strong>
                <small class="text-muted">${formatDate(comment.createdAt)}</small>
            </div>
            <p class="mb-0">${comment.text}</p>
        </div>
    `).join('');
    
    commentsSection.innerHTML = commentsHtml;
}

// Добавление комментария
async function addComment() {
    const commentText = document.getElementById('commentInput').value.trim();
    
    if (!commentText) {
        showError('Введите текст комментария');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/bets/${betId}/comments`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                text: commentText
            })
        });
        
        if (response.ok) {
            document.getElementById('commentInput').value = '';
            await loadComments(); // Перезагружаем комментарии
            showSuccess('Комментарий добавлен!');
        } else {
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                try {
                    const errorData = await response.json();
                    showError('Ошибка добавления комментария: ' + (errorData.message || 'Неизвестная ошибка'));
                } catch (jsonError) {
                    showError('Ошибка добавления комментария: Неверный формат ответа сервера');
                }
            } else {
                showError(`Ошибка добавления комментария: HTTP ${response.status}`);
            }
        }
    } catch (error) {
        console.error('Ошибка добавления комментария:', error);
        showError('Ошибка добавления комментария: ' + error.message);
    }
}

// Разрешение конфликта
function resolveConflict() {
    const modal = new bootstrap.Modal(document.getElementById('resolveModal'));
    modal.show();
}

// Установка победителя
async function setWinner(winner) {
    try {
        const response = await fetch(`${API_BASE_URL}/bets/${betId}/resolve`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                winner: winner
            })
        });
        
        if (response.ok) {
            await loadBetDetails(); // Перезагружаем данные
            const modal = bootstrap.Modal.getInstance(document.getElementById('resolveModal'));
            modal.hide();
            showSuccess('Конфликт разрешен!');
        } else {
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                try {
                    const errorData = await response.json();
                    showError('Ошибка разрешения конфликта: ' + (errorData.message || 'Неизвестная ошибка'));
                } catch (jsonError) {
                    showError('Ошибка разрешения конфликта: Неверный формат ответа сервера');
                }
            } else {
                showError(`Ошибка разрешения конфликта: HTTP ${response.status}`);
            }
        }
    } catch (error) {
        console.error('Ошибка разрешения конфликта:', error);
        showError('Ошибка разрешения конфликта: ' + error.message);
    }
}

// Завершение пари
function markAsFinished() {
    const modal = new bootstrap.Modal(document.getElementById('finishModal'));
    modal.show();
}

// Подтверждение завершения
async function confirmFinish() {
    try {
        const response = await fetch(`${API_BASE_URL}/bets/${betId}/finish`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            await loadBetDetails(); // Перезагружаем данные
            const modal = bootstrap.Modal.getInstance(document.getElementById('finishModal'));
            modal.hide();
            showSuccess('Пари завершено!');
        } else {
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                try {
                    const errorData = await response.json();
                    showError('Ошибка завершения пари: ' + (errorData.message || 'Неизвестная ошибка'));
                } catch (jsonError) {
                    showError('Ошибка завершения пари: Неверный формат ответа сервера');
                }
            } else {
                showError(`Ошибка завершения пари: HTTP ${response.status}`);
            }
        }
    } catch (error) {
        console.error('Ошибка завершения пари:', error);
        showError('Ошибка завершения пари: ' + error.message);
    }
}

// Поделиться пари
function shareBet() {
    const shareUrl = `${window.location.origin}/bet-detail.html?id=${betId}`;
    
    if (navigator.share) {
        navigator.share({
            title: currentBet.title,
            text: currentBet.description,
            url: shareUrl
        });
    } else {
        // Fallback для браузеров без поддержки Web Share API
        navigator.clipboard.writeText(shareUrl).then(() => {
            showSuccess('Ссылка скопирована в буфер обмена!');
        }).catch(() => {
            showError('Не удалось скопировать ссылку');
        });
    }
}

// Возврат назад
function goBack() {
    window.history.back();
}

// Показать ошибку
function showError(message) {
    document.getElementById('loadingSection').classList.add('d-none');
    document.getElementById('betDetailSection').classList.add('d-none');
    document.getElementById('errorSection').classList.remove('d-none');
    document.getElementById('errorMessage').textContent = message;
}

// Показать успех
function showSuccess(message) {
    // Создаем временное уведомление
    const notification = document.createElement('div');
    notification.className = 'alert alert-success alert-dismissible fade show position-fixed';
    notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(notification);
    
    // Удаляем уведомление через 3 секунды
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 3000);
}

// Вспомогательные функции
function getStatusText(status) {
    const statusMap = {
        'OPEN': 'Открыто',
        'IN_PROGRESS': 'В процессе',
        'IMPLEMENTED': 'Реализовано',
        'CONFLICT': 'Конфликт',
        'RESOLVED': 'Разрешено',
        'FINISHED': 'Завершено'
    };
    return statusMap[status] || status;
}

function getStatusColor(status) {
    const colorMap = {
        'OPEN': 'primary',
        'IN_PROGRESS': 'warning',
        'IMPLEMENTED': 'info',
        'CONFLICT': 'danger',
        'RESOLVED': 'success',
        'FINISHED': 'secondary'
    };
    return colorMap[status] || 'secondary';
}

function formatDate(dateString) {
    if (!dateString) return 'Дата не указана';
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU') + ' ' + date.toLocaleTimeString('ru-RU', {hour: '2-digit', minute:'2-digit'});
} 