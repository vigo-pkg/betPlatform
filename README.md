# 🎲 Система Заключения Пари (Betting System)

Полнофункциональное веб-приложение для создания и управления пари между пользователями.

## 🚀 Быстрый старт

### Локальный запуск
```bash
# Backend
mvn spring-boot:run

# Frontend (в новом терминале)
python3 -m http.server 3000
```

### Деплой на Render.com
```bash
# Подготовка к деплою
./deploy.sh

# Следуйте инструкциям в QUICK_DEPLOY.md
```

## 📋 Возможности

### ✅ Реализовано
- **Аутентификация и авторизация** (JWT)
- **Создание и управление пари**
- **Система голосования**
- **REST API** с документацией (Swagger)
- **PostgreSQL** база данных
- **Frontend** с современным UI
- **Деплой на Render.com**

### 🔄 В разработке
- Комментарии к пари
- Уведомления
- Мобильное приложение

## 🏗️ Архитектура

```
Frontend (HTML/CSS/JS)
    ↓
Backend (Spring Boot)
    ↓
Database (PostgreSQL/H2)
```

## 🔧 Технологии

### Backend
- **Spring Boot 3.2.0**
- **Spring Security** (JWT)
- **Spring Data JPA**
- **PostgreSQL** / **H2**
- **Maven**

### Frontend
- **HTML5** / **CSS3** / **JavaScript**
- **Bootstrap 5**
- **Font Awesome**

### DevOps
- **Render.com** (деплой)
- **Git** (версионирование)

## 📁 Структура проекта

```
deals/
├── src/main/java/com/betting/
│   ├── controller/     # REST контроллеры
│   ├── service/        # Бизнес-логика
│   ├── repository/     # Доступ к данным
│   ├── entity/         # JPA сущности
│   ├── dto/           # Data Transfer Objects
│   └── config/        # Конфигурация
├── src/main/resources/
│   └── application.properties
├── frontend/          # HTML/CSS/JS файлы
├── render.yaml        # Render конфигурация
├── Procfile          # Heroku/Render Procfile
└── pom.xml           # Maven конфигурация
```

## 🚀 Деплой

### Render.com (Рекомендуется)
- ✅ **Бесплатный план**: 750 часов/месяц
- ✅ **Автоматический деплой** из Git
- ✅ **PostgreSQL** база данных
- ✅ **SSL сертификат** включен

### Быстрый деплой
1. Запустите `./deploy.sh`
2. Следуйте инструкциям в `QUICK_DEPLOY.md`
3. Готово! 🎉

## 📚 API Документация

### Swagger UI
- **Локально**: http://localhost:8080/api/swagger-ui.html
- **Production**: https://your-app.onrender.com/api/swagger-ui.html

### Основные endpoints
```
POST /api/auth/register    # Регистрация
POST /api/auth/login       # Вход
GET  /api/bets            # Список пари
POST /api/bets            # Создание пари
GET  /api/bets/{id}       # Детали пари
POST /api/bets/{id}/vote  # Голосование
```

## 🧪 Тестирование

### Создание тестовых данных
```bash
# Локально
curl -X POST http://localhost:8080/api/test/create-users

# Production
curl -X POST https://your-app.onrender.com/api/test/create-users
```

### Health Check
```bash
curl -X GET https://your-app.onrender.com/api/test/health
```

## 🔒 Безопасность

- **JWT токены** для аутентификации
- **BCrypt** хеширование паролей
- **CORS** настройки
- **Валидация** входных данных
- **HTTPS** в production

## 📊 Мониторинг

### Render Dashboard
- **Логи** приложения
- **Метрики** производительности
- **Events** деплоя
- **Health checks**

### Локальное логирование
```bash
# Просмотр логов
tail -f logs/application.log
```

## 🤝 Разработка

### Требования
- **Java 17+**
- **Maven 3.6+**
- **Git**

### Установка зависимостей
```bash
mvn clean install
```

### Запуск тестов
```bash
mvn test
```

### Сборка
```bash
mvn clean package
```

## 📝 Лицензия

MIT License - см. файл [LICENSE](LICENSE)

## 🤝 Вклад в проект

1. Fork репозитория
2. Создайте feature branch (`git checkout -b feature/amazing-feature`)
3. Commit изменения (`git commit -m 'Add amazing feature'`)
4. Push в branch (`git push origin feature/amazing-feature`)
5. Откройте Pull Request

## 📞 Поддержка

- **Issues**: [GitHub Issues](https://github.com/your-username/betting-app/issues)
- **Email**: your-email@example.com
- **Discord**: [Сервер поддержки](https://discord.gg/your-server)

---

**Сделано с ❤️ для сообщества разработчиков** 