# Фронтенд: описание функционала

## Обзор
Фронтенд реализован как статический сайт (HTML/CSS/JS, Bootstrap 5), взаимодействует с бэкендом по REST через JWT-аутентификацию. Скрипты написаны на чистом JS (без фреймворков).

Ключевые файлы:
- `index.html` — главная страница (вход, список пари, фильтры/поиск, создание пари)
- `app.js` — вся логика главной страницы (авторизация, загрузка списка, создание пари)
- `bet-detail.html` — страница деталей пари
- `bet-detail.js` — логика страницы деталей (присоединение, голосование, комментарии, админ-действия)

## Конфигурация API
Базовый URL API формируется автоматически с учётом `server.servlet.context-path=/api` на бэкенде:
- Локально: `http://localhost:8080/api`
- Иначе: `window.location.origin + '/api'`

В `app.js` и `bet-detail.js` константа:
```
const isLocalhost = ['localhost', '127.0.0.1', '::1'].includes(window.location.hostname);
const API_BASE_URL = isLocalhost ? 'http://localhost:8080/api' : (window.location.origin + '/api');
```

## Аутентификация (JWT)
- Вход: `POST /api/auth/login` с телом `{ email, password }`
- Регистрация: `POST /api/auth/register` с телом `{ firstName, lastName, email, password }`
- Валидация токена: `GET /api/auth/validate` (заголовок `Authorization: Bearer <JWT>`)
- Хранение: токен сохраняется в `localStorage` под ключом `authToken`
- Заголовки: все защищённые запросы отправляются с `Authorization: Bearer <JWT>`
- Авто-логаут: при ответах 401/403 токен очищается и показывается форма входа

## Главная страница (index.html + app.js)
Секции:
- `#authSection` — форма входа (email, пароль). Submit вызывает `handleLogin()`
- `#mainContent` — основной интерфейс после входа
  - Кнопка «Создать пари» открывает модалку `#createBetModal`
  - Фильтры/поиск:
    - `#statusFilter` — значения соответствуют enum бекенда: `OPEN`, `IN_PROGRESS`, `IMPLEMENTED`, `CONFLICT`, `RESOLVED`, `FINISHED`
    - `#searchInput` + `#searchBtn` — строка поиска по названию/описанию
  - Список пари: контейнер `#betsContainer` (карточки пари с названием, статусом, датой начала, длительностью, автором, участниками)

Запросы:
- Загрузка списка: `GET /api/bets?status&search&page&size`
  - Ожидается `Page<BetResponse>`; используется поле `content`
- Создание пари: `POST /api/bets` с телом `{ title, description, startDate, duration }`
  - Требует JWT

Поведение:
- При старте вызывается `validateToken()`; если успешно — показывается `#mainContent`, иначе `#authSection`
- При ошибке 401/403 — автоматический выход и показ формы входа
- Создание пари доступно только для авторизованных (иначе уведомление и переход к форме входа)

## Страница деталей (bet-detail.html + bet-detail.js)
Содержимое:
- Заголовок, описание, даты, статус, участники (создатель/участник/наблюдатель)
- Кнопки присоединения: «Присоединиться как участник/наблюдатель» (отсутствуют, если роли заняты)
- Голосование: прогресс-бары «За/Против», кнопки голосования
- Комментарии: список, форма добавления комментария
- Админ-действия (видны только создателю): «Разрешить конфликт» (модалка выбора победителя), «Завершить пари» (подтверждение)

Запросы:
- Детали пари: `GET /api/bets/{id}`
- Присоединение: `POST /api/bets/{id}/join` с телом `{ role: 'PARTICIPANT' | 'OBSERVER' }`
- Голоса: `GET /api/bets/{id}/votes` → `{ forVotes, againstVotes, userVote }`
- Голосовать: `POST /api/bets/{id}/vote` с телом `{ vote: boolean }`
- Комментарии: `GET /api/bets/{id}/comments`, `POST /api/bets/{id}/comments` с телом `{ text }`
- Админ:
  - Разрешение конфликта: `POST /api/bets/{id}/resolve` с телом `{ winner: 'creator' | 'participant' | 'draw' }`
  - Завершение: `POST /api/bets/{id}/finish`

Все запросы требуют JWT (`Authorization: Bearer <token>`).

## Обработка ошибок
- 401/403: токен удаляется, открывается форма входа
- 400/422: показываются сообщения в `alert` из `response.json().message` (если есть)
- Сетевые/другие ошибки логируются в консоль; пользователю показывается простое уведомление

## Запуск локально
1. Запустить бэкенд на 8080 (`mvn spring-boot:run` или `java -jar target/betting-api-1.0.0.jar`)
2. Запустить статический сервер фронтенда на 3000:
   ```bash
   python3 -m http.server 3000
   ```
3. Открыть `http://localhost:3000`

Жёсткая перезагрузка при обновлениях фронта: DevTools → Network → Disable cache → Cmd+Shift+R.

## Совместимость с бекендом
Используемые DTO/ответы:
- LoginRequest `{ email, password }` → AuthResponse `{ token, user }`
- RegisterRequest `{ firstName, lastName, email, password }` → AuthResponse
- CreateBetRequest `{ title, description, startDate, duration }`
- JoinBetRequest `{ role }`
- VoteRequest `{ vote }`
- ResolveConflictRequest `{ winner }`
- BetResponse, UserResponse, VoteResponse, CommentResponse — поля совпадают с моделью бекенда

## Возможные улучшения
- Добавить UI-пагинацию по `Page` (next/prev)
- Нотификации вместо `alert`
- Кэширование/мемоизация запросов при фильтрации
- Улучшенный UX для ошибок (inline-подсветка полей) 