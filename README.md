# 🎯 Betting Platform - Платформа для пари

Полнофункциональное веб-приложение для создания и управления пари между пользователями.

## 🚀 Возможности

### ✅ Аутентификация и авторизация
- Регистрация и вход пользователей
- JWT токены для безопасной аутентификации
- Ролевая система (USER, ADMIN, MODERATOR)

### ✅ Управление пари
- Создание новых пари
- Просмотр списка пари с фильтрацией
- Детальный просмотр пари
- Присоединение как участник или наблюдатель

### ✅ Система голосования
- Голосование за/против результата пари
- Статистика голосов в реальном времени
- Автоматическое определение конфликтов

### ✅ Комментарии и обсуждения
- Добавление комментариев к пари
- Просмотр всех комментариев
- Авторство и временные метки

### ✅ Управление статусами
- Автоматическое изменение статусов
- Разрешение конфликтов
- Завершение пари

## 🛠️ Технологии

### Backend
- **Spring Boot 3.2** - основной фреймворк
- **Spring Security** - безопасность и аутентификация
- **Spring Data JPA** - работа с базой данных
- **H2 Database** - встроенная база данных (dev)
- **PostgreSQL** - production база данных
- **JWT** - токены аутентификации
- **Maven** - управление зависимостями

### Frontend
- **HTML5/CSS3** - структура и стили
- **JavaScript (ES6+)** - интерактивность
- **Bootstrap 5** - адаптивный дизайн
- **Fetch API** - HTTP запросы

### Документация
- **Swagger/OpenAPI** - API документация
- **Postman Collection** - тестирование API

## 📁 Структура проекта

```
betPlatform/
├── src/main/java/com/betting/
│   ├── BettingApplication.java          # Главный класс приложения
│   ├── config/                         # Конфигурация
│   │   ├── SecurityConfig.java         # Настройки безопасности
│   │   └── JwtAuthenticationFilter.java # JWT фильтр
│   ├── controller/                     # REST контроллеры
│   │   ├── AuthController.java         # Аутентификация
│   │   ├── BetController.java          # Управление пари
│   │   └── TestController.java         # Тестовые данные
│   ├── dto/                           # Data Transfer Objects
│   │   ├── request/                    # Входящие DTO
│   │   └── response/                   # Исходящие DTO
│   ├── entity/                         # JPA сущности
│   │   ├── Bet.java                    # Сущность пари
│   │   ├── User.java                   # Сущность пользователя
│   │   └── VoteResult.java             # Результат голосования
│   ├── repository/                     # JPA репозитории
│   │   ├── BetRepository.java          # Репозиторий пари
│   │   └── UserRepository.java         # Репозиторий пользователей
│   └── service/                        # Бизнес-логика
│       ├── AuthService.java            # Сервис аутентификации
│       ├── BetService.java             # Сервис пари
│       ├── JwtService.java             # JWT сервис
│       └── CustomUserDetailsService.java # UserDetails сервис
├── src/main/resources/
│   ├── application.properties          # Конфигурация приложения
│   └── application.yml                 # Альтернативная конфигурация
├── frontend/                          # Frontend файлы
│   ├── index.html                     # Главная страница
│   ├── bet-detail.html                # Страница пари
│   ├── app.js                         # Основной JavaScript
│   ├── bet-detail.js                  # JavaScript для пари
│   └── firebase-config.js             # Конфигурация Firebase
├── docs/                              # Документация
│   ├── DEPLOYMENT_GUIDE.md            # Руководство по развертыванию
│   ├── QUICK_DEPLOY.md                # Быстрое развертывание
│   ├── VOTING_SYSTEM_GUIDE.md         # Система голосования
│   └── README_Postman_Collection.md   # Postman коллекция
├── postman/                           # Postman файлы
│   ├── Betting_API_Collection.json    # Основная коллекция
│   └── Postman_Examples.md            # Примеры использования
├── deployment/                        # Файлы для развертывания
│   ├── render.yaml                    # Конфигурация Render
│   ├── Procfile                       # Конфигурация Heroku
│   └── openapi.yaml                   # OpenAPI спецификация
├── pom.xml                            # Maven конфигурация
├── .gitignore                         # Git игнорирование
└── README.md                          # Этот файл
```

## 🚀 Быстрый старт

### Локальная разработка

1. **Клонируйте репозиторий**
```bash
git clone https://github.com/vigo-pkg/betPlatform.git
cd betPlatform
```

2. **Запустите backend**
```bash
mvn spring-boot:run
```

3. **Запустите frontend**
```bash
python3 -m http.server 3000
```

4. **Откройте приложение**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8080/api
- Swagger UI: http://localhost:8080/api/swagger-ui.html
- H2 Console: http://localhost:8080/api/h2-console

### Создание тестовых данных

```bash
curl -X POST http://localhost:8080/api/test/create-users
```

## 📊 API Endpoints

### Аутентификация
- `POST /api/auth/register` - Регистрация
- `POST /api/auth/login` - Вход
- `GET /api/auth/validate` - Валидация токена

### Пари
- `GET /api/bets` - Список пари
- `POST /api/bets` - Создание пари
- `GET /api/bets/{id}` - Детали пари
- `POST /api/bets/{id}/join` - Присоединение к пари
- `DELETE /api/bets/{id}` - Удаление пари

### Голосование
- `GET /api/bets/{id}/votes` - Статистика голосов
- `POST /api/bets/{id}/vote` - Голосование

### Комментарии
- `GET /api/bets/{id}/comments` - Список комментариев
- `POST /api/bets/{id}/comments` - Добавление комментария

### Управление
- `POST /api/bets/{id}/resolve` - Разрешение конфликта
- `POST /api/bets/{id}/finish` - Завершение пари

## 🌐 Развертывание

### Render (Рекомендуется)
1. Подключите GitHub репозиторий к Render
2. Создайте Web Service для backend
3. Создайте Static Site для frontend
4. Настройте PostgreSQL базу данных

Подробные инструкции: [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)

### Альтернативные платформы
- **Railway** - $5 кредитов бесплатно
- **Heroku** - ограниченный бесплатный план
- **Vercel** - для frontend

## 🧪 Тестирование

### Postman Collection
Импортируйте `Betting_API_Collection.json` в Postman для полного тестирования API.

### Автоматические тесты
```bash
mvn test
```

## 🔧 Конфигурация

### Переменные окружения
```bash
# База данных
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/bettingdb
SPRING_DATASOURCE_USERNAME=postgres
SPRING_DATASOURCE_PASSWORD=password

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRATION=86400000

# Сервер
SERVER_PORT=8080
```

### Профили
- `dev` - H2 база данных (по умолчанию)
- `production` - PostgreSQL база данных

## 📈 Мониторинг

### Логи
- Backend логи в консоли
- H2 Console для просмотра базы данных
- Swagger UI для тестирования API

### Метрики
- Время ответа API
- Количество активных пользователей
- Статистика голосов

## 🤝 Вклад в проект

1. Fork репозитория
2. Создайте feature branch (`git checkout -b feature/amazing-feature`)
3. Commit изменения (`git commit -m 'Add amazing feature'`)
4. Push в branch (`git push origin feature/amazing-feature`)
5. Откройте Pull Request

## 📄 Лицензия

Этот проект распространяется под лицензией MIT. См. файл `LICENSE` для подробностей.

## 📞 Поддержка

- **Issues**: [GitHub Issues](https://github.com/vigo-pkg/betPlatform/issues)
- **Discussions**: [GitHub Discussions](https://github.com/vigo-pkg/betPlatform/discussions)
- **Email**: vigo@example.com

## 🎉 Благодарности

- Spring Boot Team за отличный фреймворк
- Bootstrap Team за адаптивный CSS фреймворк
- Сообщество разработчиков за вдохновение

---

**Создано с ❤️ для сообщества разработчиков** 