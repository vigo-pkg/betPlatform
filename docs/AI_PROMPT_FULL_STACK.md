# Промпт для ИИ: сгенерировать полный стек (Backend + Frontend) данного проекта

Сгенерируй готовое к запуску приложение: бэкенд (Spring Boot, JWT, REST) и фронтенд (статический HTML/JS + Bootstrap 5), полностью совместимые между собой. Ниже дана спецификация требований, структуры и функционала. Код должен собираться и работать локально без ручной доработки.

## Общие требования
- Язык бэкенда: Java 17, Spring Boot 3.x, Maven
- БД: Dev — H2 in-memory; Prod — PostgreSQL (параметры через env)
- Аутентификация: JWT, заголовок `Authorization: Bearer <token>`
- Контекст приложения: `/api` (`server.servlet.context-path=/api`)
- Документация API: springdoc-openapi (Swagger UI `/api/swagger-ui.html`)
- CORS: разрешить методы GET, POST, PUT, DELETE, OPTIONS; `allowedOriginPatterns: "*"`; `allowCredentials: true`
- Разрешить `OPTIONS /**` (preflight)
- Фронтенд: статические файлы (HTML/CSS/JS), Bootstrap 5 (CDN), FontAwesome (CDN), чистый JS (без фреймворков)
- Хранение JWT на фронте: `localStorage` ключ `authToken`
- Все защищённые запросы — с заголовком `Authorization: Bearer <JWT>`

## Структура файлов
- Backend (Maven):
  - `pom.xml`
  - `src/main/java/com/betting/BettingApplication.java`
  - `src/main/java/com/betting/config/SecurityConfig.java`
  - `src/main/java/com/betting/config/JwtAuthenticationFilter.java`
  - `src/main/java/com/betting/service/JwtService.java`
  - `src/main/java/com/betting/controller/AuthController.java`
  - `src/main/java/com/betting/controller/BetController.java`
  - `src/main/java/com/betting/controller/TestController.java`
  - `src/main/java/com/betting/dto/request/{LoginRequest,RegisterRequest,CreateBetRequest,JoinBetRequest,VoteRequest,ResolveConflictRequest}.java`
  - `src/main/java/com/betting/dto/response/{AuthResponse,UserResponse,BetResponse,VoteResponse,CommentResponse}.java`
  - `src/main/java/com/betting/entity/{User,Bet,BetStatus,VoteResult}.java`
  - `src/main/resources/application.yml` и/или `application.properties`
- Frontend (static):
  - `index.html`, `app.js`
  - `bet-detail.html`, `bet-detail.js`

## Бэкенд: функционал и API
- Контекст: `/api`
- Безопасность (`SecurityConfig`):
  - `csrf.disable()`, включить CORS с `allowedOriginPatterns("*")`
  - `authorizeHttpRequests`: разрешить `OPTIONS /**`, `/auth/**`, `/test/**`, `/swagger-ui/**`, `/api-docs/**`, `/h2-console/**`; остальные — `authenticated()`
  - Stateless JWT (`SessionCreationPolicy.STATELESS`), фильтр `JwtAuthenticationFilter` до `UsernamePasswordAuthenticationFilter`
- Аутентификация (`AuthController`):
  - `POST /auth/register` — тело `{ firstName, lastName, email, password }`, ответ `{ token, user }`
  - `POST /auth/login` — тело `{ email, password }`, ответ `{ token, user }`
  - `GET /auth/validate` — заголовок `Authorization`, ответ `UserResponse` при валидном токене, иначе 401
- Пари (`BetController`):
  - `POST /bets` — создать пари. Тело `CreateBetRequest { title, description, startDate (LocalDateTime ISO), duration (hours) }`; ответ `BetResponse`; статус `201`.
  - `GET /bets` — список пари с пагинацией. Параметры: `status` (enum: OPEN, IN_PROGRESS, IMPLEMENTED, CONFLICT, RESOLVED, FINISHED), `search` (строка), `page`, `size`. Ответ `Page<BetResponse>`.
  - `GET /bets/{id}` — детали пари `BetResponse`.
  - `POST /bets/{id}/join` — тело `JoinBetRequest { role: 'PARTICIPANT' | 'OBSERVER' }`; валидации: статус = OPEN, не создатель, роль не занята; при наличии всех ролей — статус `IN_PROGRESS`.
  - `GET /bets/{id}/votes` — `VoteResponse { forVotes, againstVotes, userVote }`.
  - `POST /bets/{id}/vote` — тело `VoteRequest { vote: boolean }` (true — за, false — против); валидации: статус `IN_PROGRESS`, голосовать могут участник/наблюдатель.
  - `GET /bets/{id}/comments` — список комментариев (можно как заглушку).
  - `POST /bets/{id}/comments` — тело `{ text }`; ответ `CommentResponse` (можно заглушку).
  - `POST /bets/{id}/resolve` — тело `ResolveConflictRequest { winner: 'creator' | 'participant' | 'draw' }`; меняет статус `RESOLVED`.
  - `POST /bets/{id}/finish` — завершает пари, статус `FINISHED`.
- Тест (`TestController`): `GET /test/health` → `{ service, version, status: "UP" }`.
- Модель `Bet`:
  - `id, title, description, startDate, duration, status, creator, participant?, observer?, winner?, createdAt, updatedAt, resolvedAt, votes: Map<User, VoteResult>`
  - Вспомогательные: `hasAllParticipants()`, `hasConflict()`.

## Фронтенд: функционал и UI
- Базовый URL API (в `app.js` и `bet-detail.js`):
  ```js
  const isLocalhost = ['localhost','127.0.0.1','::1'].includes(window.location.hostname);
  const API_BASE_URL = isLocalhost ? 'http://localhost:8080/api' : (window.location.origin + '/api');
  ```
- JWT-хелперы:
  - Сохранять токен в `localStorage` (`authToken`)
  - Хелпер заголовков: `{ Authorization: 'Bearer ' + token }`
  - При 401/403 очищать токен, показывать форму входа
- Главная (`index.html` + `app.js`):
  - Форма входа (email/пароль) → `POST /api/auth/login`
  - Модалка регистрации (имя/фамилия/email/пароль) → `POST /api/auth/register`
  - Валидация токена при старте → `GET /api/auth/validate`
  - Верхняя панель: email пользователя, кнопка «Выйти» (очистка токена)
  - Список пари: `GET /api/bets?status&search&page&size` → карточки с заголовком, статусом, датой начала, длительностью, создателем/участниками
  - Фильтры/поиск: статус (enum), строка поиска; перезагружает список
  - Создание пари (модалка) → `POST /api/bets`; при успехе — закрыть модалку, очистить форму, обновить список
- Детали (`bet-detail.html` + `bet-detail.js`):
  - Валидация токена
  - Детали пари: `GET /api/bets/{id}`
  - Присоединение: `POST /api/bets/{id}/join` с `{ role }`
  - Голоса: `GET /api/bets/{id}/votes`, `POST /api/bets/{id}/vote`
  - Комментарии: `GET/POST /api/bets/{id}/comments`
  - Админ: `POST /api/bets/{id}/resolve`, `POST /api/bets/{id}/finish`
- UI: Bootstrap 5 (CDN), FontAwesome (CDN), адаптивность, простые уведомления (alert или видимый блок)
- Инициализация обработчиков — надёжная (если `DOMContentLoaded` уже прошёл, обработчики всё равно навесятся)

## Критерии приёмки
- Backend
  - Сборка Maven `mvn -DskipTests package` успешна; JAR запускается на 8080
  - `GET /api/test/health` → `status=UP`
  - Swagger доступен на `/api/swagger-ui.html`
  - CORS и preflight (`OPTIONS`) работают
- Frontend
  - Вход/регистрация работают; email пользователя виден; «Выйти» очищает сессию
  - Список пари загружается с фильтрами/поиском
  - Создание пари с валидными данными — успешно
  - На странице деталей работают присоединение/голосование/комментарии/админ-кнопки (для создателя)
  - Все защищённые запросы несут `Authorization`, при 401/403 UI переводит на вход

## Что вернуть
- Полный исходный код бэкенда (Maven проект)
- Полный исходный код фронтенда (`index.html`, `app.js`, `bet-detail.html`, `bet-detail.js`)
- Инструкции по запуску локально (README-фрагмент) 