# Примеры использования Postman Collection

## 🎯 Быстрый старт

### Шаг 1: Импорт коллекции
1. Скачайте файл `Betting_API_Collection.json`
2. Откройте Postman
3. Нажмите **Import** → **Upload Files**
4. Выберите файл коллекции

### Шаг 2: Запуск серверов
```bash
# Terminal 1 - Backend
mvn spring-boot:run

# Terminal 2 - Frontend  
python3 -m http.server 3000
```

### Шаг 3: Запуск тестов
1. Откройте коллекцию в Postman
2. Нажмите **Run collection**
3. Выберите все тесты
4. Нажмите **Run**

## 📋 Примеры запросов

### 1. Аутентификация

#### Создание тестовых пользователей
```bash
curl -X POST http://localhost:8080/api/test/create-users
```

#### Регистрация нового пользователя
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@test.com",
    "password": "password123",
    "firstName": "Новый",
    "lastName": "Пользователь"
  }'
```

#### Вход пользователя
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user1@test.com",
    "password": "password123"
  }'
```

### 2. Управление пари

#### Создание пари
```bash
curl -X POST http://localhost:8080/api/bets \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Тестовое пари",
    "description": "Описание пари",
    "startDate": "2025-08-09T16:00:00",
    "duration": 24
  }'
```

#### Получение списка пари
```bash
curl -X GET http://localhost:8080/api/bets \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Получение пари по ID
```bash
curl -X GET http://localhost:8080/api/bets/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 3. Участие в пари

#### Присоединение как участник
```bash
curl -X POST http://localhost:8080/api/bets/1/join \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "role": "PARTICIPANT"
  }'
```

#### Присоединение как наблюдатель
```bash
curl -X POST http://localhost:8080/api/bets/1/join \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "role": "OBSERVER"
  }'
```

### 4. Голосование

#### Получение статистики голосов
```bash
curl -X GET http://localhost:8080/api/bets/1/votes \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Голосование за
```bash
curl -X POST http://localhost:8080/api/bets/1/vote \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "vote": true
  }'
```

#### Голосование против
```bash
curl -X POST http://localhost:8080/api/bets/1/vote \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "vote": false
  }'
```

### 5. Комментарии

#### Получение комментариев
```bash
curl -X GET http://localhost:8080/api/bets/1/comments \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Добавление комментария
```bash
curl -X POST http://localhost:8080/api/bets/1/comments \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Отличное пари!"
  }'
```

### 6. Управление статусами

#### Завершение пари
```bash
curl -X POST http://localhost:8080/api/bets/1/finish \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Разрешение конфликта
```bash
curl -X POST http://localhost:8080/api/bets/1/resolve \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "winner": "creator"
  }'
```

## 🔄 Автоматизация в Postman

### Тестовые скрипты

#### Сохранение токена после входа
```javascript
if (pm.response.code === 200) {
    const response = pm.response.json();
    pm.environment.set('auth_token', response.token);
    pm.environment.set('user_id', response.user.id);
    console.log('Токен сохранен:', response.token);
}
```

#### Сохранение ID пари после создания
```javascript
if (pm.response.code === 201) {
    const response = pm.response.json();
    pm.environment.set('bet_id', response.id);
    console.log('Пари создано с ID:', response.id);
}
```

#### Проверка статуса ответа
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Response has token", function () {
    const response = pm.response.json();
    pm.expect(response).to.have.property('token');
});
```

## 📊 Ожидаемые ответы

### Успешный вход
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": 1,
    "email": "user1@test.com",
    "firstName": "Иван",
    "lastName": "Иванов",
    "role": "USER",
    "active": true
  },
  "message": null
}
```

### Создание пари
```json
{
  "id": 1,
  "title": "Тестовое пари",
  "description": "Описание пари",
  "startDate": "2025-08-09T16:00:00",
  "duration": 24,
  "status": "OPEN",
  "creator": {
    "id": 1,
    "email": "user1@test.com",
    "firstName": "Иван",
    "lastName": "Иванов"
  },
  "participant": null,
  "observer": null,
  "winner": null,
  "createdAt": "2025-08-08T15:30:00",
  "updatedAt": "2025-08-08T15:30:00",
  "resolvedAt": null,
  "votes": {},
  "shareUrl": "/bet/1"
}
```

### Статистика голосов
```json
{
  "forVotes": 2,
  "againstVotes": 1,
  "userVote": true
}
```

### Комментарий
```json
{
  "id": 1,
  "text": "Отличное пари!",
  "author": {
    "id": 2,
    "email": "user2@test.com",
    "firstName": "Петр",
    "lastName": "Петров"
  },
  "createdAt": "2025-08-08T15:35:00"
}
```

## 🚨 Обработка ошибок

### 400 Bad Request (Валидация)
```json
{
  "message": "Пароль должен содержать минимум 6 символов"
}
```

### 401 Unauthorized (Неверный токен)
```json
{
  "message": "Unauthorized"
}
```

### 403 Forbidden (Нет прав)
```json
{
  "message": "Создатель не может присоединиться к своему пари"
}
```

### 404 Not Found (Ресурс не найден)
```json
{
  "message": "Пари не найдено"
}
```

## 🎯 Сценарии тестирования

### Сценарий 1: Полный цикл жизни пари
1. Создание тестовых пользователей
2. Вход первого пользователя
3. Создание пари
4. Вход второго пользователя
5. Присоединение как участник
6. Вход третьего пользователя
7. Присоединение как наблюдатель
8. Голосование участников
9. Добавление комментариев
10. Завершение пари

### Сценарий 2: Тестирование ошибок
1. Попытка входа с неверными данными
2. Доступ без токена
3. Создание пари с неверными данными
4. Присоединение к несуществующему пари

### Сценарий 3: Фильтрация и поиск
1. Получение пари с фильтрацией по статусу
2. Поиск пари по тексту
3. Пагинация результатов

## 📈 Метрики производительности

### Время ответа API
- **Аутентификация**: < 100ms
- **Создание пари**: < 200ms
- **Получение списка**: < 150ms
- **Голосование**: < 100ms
- **Комментарии**: < 100ms

### Нагрузочное тестирование
```bash
# Тест с 10 одновременными запросами
ab -n 100 -c 10 -H "Authorization: Bearer YOUR_TOKEN" \
   http://localhost:8080/api/bets
```

## 🔧 Настройка окружения

### Переменные окружения
```json
{
  "base_url": "http://localhost:8080/api",
  "auth_token": "",
  "auth_token_user2": "",
  "auth_token_user3": "",
  "bet_id": "",
  "user_id": "",
  "user2_id": "",
  "user3_id": "",
  "user_email": ""
}
```

### Глобальные переменные
```json
{
  "timeout": 5000,
  "retry_count": 3,
  "log_level": "INFO"
}
```

---

**Готово к использованию! 🚀** 