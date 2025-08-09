# Бэкенд: описание функционала

## Обзор
Бэкенд — Spring Boot (Java 17), REST API, JWT-аутентификация, JPA/Hibernate. Профиль по умолчанию dev (H2 in-memory); в production — PostgreSQL. Контекст приложения: `/api` (см. `server.servlet.context-path`).

Ключевые компоненты:
- Главный класс: `com.betting.BettingApplication`
- Безопасность: `com.betting.config.SecurityConfig`, `JwtAuthenticationFilter`, `JwtService`
- Контроллеры: `AuthController`, `BetController`, `TestController`
- Сущности/DTO: `User`, `Bet`, `BetStatus`, `VoteResult` и соответствующие DTO запросов/ответов

## Контекст пути (Context Path)
Все маршруты начинаются с `/api` (см. `application.yml`/`application.properties`):
```yaml
server:
  servlet:
    context-path: /api
```

## Безопасность
- Stateless JWT: `Authorization: Bearer <token>`
- Разрешённые без авторизации: `/auth/**`, `/test/**`, `/swagger-ui/**`, `/api-docs/**`, `/h2-console/**`, а также `OPTIONS /**` (для CORS preflight)
- Все остальные запросы требуют аутентификацию
- CORS включён: методы `GET, POST, PUT, DELETE, OPTIONS`, заголовки `*`, `allowedOriginPatterns: "*"`, `allowCredentials: true`

## Аутентификация
- `POST /api/auth/register`
  - Тело: `RegisterRequest { firstName, lastName, email, password }`
  - Ответ: `AuthResponse { token, user }`
- `POST /api/auth/login`
  - Тело: `LoginRequest { email, password }`
  - Ответ: `AuthResponse { token, user }`
- `GET /api/auth/validate`
  - Заголовок: `Authorization: Bearer <token>`
  - Ответ: `UserResponse` при валидном токене, иначе 401

## Пари (Bets)
Контроллер: `BetController` (`/bets`)

- `POST /api/bets` — создать пари
  - Тело: `CreateBetRequest { title, description, startDate (LocalDateTime), duration (hours) }`
  - Требует аутентификацию; создателем становится текущий пользователь; статус = `OPEN`
- `GET /api/bets` — список пари с пагинацией
  - Параметры: `status` (enum `BetStatus`), `search` (строка), `page`, `size`
  - Ответ: `Page<BetResponse>`
- `GET /api/bets/{id}` — детали пари
  - Ответ: `BetResponse`
- `POST /api/bets/{id}/join` — присоединиться как участник или наблюдатель
  - Тело: `JoinBetRequest { role: 'PARTICIPANT' | 'OBSERVER' }`
  - Валидации: нельзя присоединяться, если статус не `OPEN`, если вы — создатель, если роль занята; при наличии всех ролей статус меняется на `IN_PROGRESS`
- `GET /api/bets/{id}/votes` — статистика голосов
  - Ответ: `VoteResponse { forVotes, againstVotes, userVote }`
- `POST /api/bets/{id}/vote` — голосовать
  - Тело: `VoteRequest { vote: boolean }` (`true` — за, `false` — против)
  - Валидации: голосовать можно только в статусе `IN_PROGRESS`, и только участнику/наблюдателю
- `GET /api/bets/{id}/comments` — получить комментарии (пока заглушка: пустой список)
- `POST /api/bets/{id}/comments` — добавить комментарий (пока заглушка: отдаёт сгенерированный CommentResponse)
- `POST /api/bets/{id}/resolve` — разрешить конфликт
  - Тело: `ResolveConflictRequest { winner: 'creator' | 'participant' | 'draw' }`
  - Только создатель/или по бизнес-правилам; меняет статус на `RESOLVED`
- `POST /api/bets/{id}/finish` — завершить пари
  - Только создатель/или по бизнес-правилам; статус `FINISHED`

## Модель данных (упрощённо)
Сущность `Bet`:
- `id: Long`
- `title: String`
- `description: String`
- `startDate: LocalDateTime`
- `duration: Integer` (часы)
- `status: BetStatus (OPEN, IN_PROGRESS, IMPLEMENTED, CONFLICT, RESOLVED, FINISHED)`
- `creator: User`
- `participant: User?`
- `observer: User?`
- `winner: User?`
- `createdAt, updatedAt, resolvedAt: LocalDateTime`
- `votes: Map<User, VoteResult>`

Вспомогательные методы:
- `isTimeExpired()`: истёк ли срок пари
- `hasAllParticipants()`: заданы ли участник и наблюдатель
- `hasConflict()`: есть ли конфликт голосов (и `WIN`, и `LOSE`)

## Документация API
`springdoc-openapi`:
- Swagger UI: `/api/swagger-ui.html`
- OpenAPI docs: `/api/api-docs`

## Профили и БД
- Dev (по умолчанию): H2 in-memory, `ddl-auto=create-drop`
- Production: PostgreSQL, `ddl-auto=update`, параметры подключений через env

## Логи и отладка
- Уровни логов настраиваются в `application.properties`/`application.yml`
- Для H2-консоли разрешены frameOptions и доступ `/h2-console/**`

## CORS / preflight
- Разрешён `OPTIONS /**` (важно для браузерных preflight-запросов)
- CORS: любые источники (паттерны), методы и заголовки; `allowCredentials: true`

## Примечания по безопасности
- Все защищённые эндпоинты требуют корректного заголовка `Authorization` с JWT
- При работе за прокси/ингрессом учитывайте корректную передачу заголовков Forwarded/X-Forwarded-* (при необходимости — добавьте `ForwardedHeaderFilter`) 