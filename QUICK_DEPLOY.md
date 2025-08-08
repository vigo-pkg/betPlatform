# 🚀 Быстрый деплой на Render.com

## Шаг 1: Подготовка
```bash
# Убедитесь, что код закоммичен в Git
git add .
git commit -m "Prepare for deployment"
git push origin main
```

## Шаг 2: Создание Blueprint на Render

1. **Перейдите на [Render Dashboard](https://dashboard.render.com)**
2. **Нажмите "New +" → "Blueprint"**
3. **Подключите ваш Git репозиторий**
4. **Render автоматически создаст:**
   - ✅ PostgreSQL база данных
   - ✅ Spring Boot Web Service
   - ✅ Static Site для фронтенда

## Шаг 3: Проверка деплоя

### Backend API
- **Health Check**: `https://your-app.onrender.com/api/test/health`
- **Swagger UI**: `https://your-app.onrender.com/api/swagger-ui.html`
- **API Base**: `https://your-app.onrender.com/api`

### Frontend
- **URL**: `https://your-frontend.onrender.com`

## 🔧 Ручная настройка (если нужно)

### Backend Web Service
```
Environment: Java
Build Command: mvn clean package -DskipTests
Start Command: java -jar target/betting-api-1.0.0.jar
```

### Переменные окружения
```
SPRING_PROFILES_ACTIVE=production
SPRING_DATASOURCE_URL=<from_database>
SPRING_DATASOURCE_USERNAME=<from_database>
SPRING_DATASOURCE_PASSWORD=<from_database>
JWT_SECRET=<generate_random_secret>
SERVER_PORT=8080
SPRING_JPA_HIBERNATE_DDL_AUTO=update
SPRING_JPA_SHOW_SQL=false
```

## 🧪 Тестирование

### Создание тестовых пользователей
```bash
curl -X POST https://your-app.onrender.com/api/test/create-users
```

### Проверка API
```bash
curl -X GET https://your-app.onrender.com/api/test/health
```

## 📊 Мониторинг

- **Логи**: Render Dashboard → Your Service → Logs
- **Метрики**: Render Dashboard → Your Service → Metrics
- **Events**: Render Dashboard → Your Service → Events

## 🔗 Полезные ссылки

- [Render Documentation](https://render.com/docs)
- [Spring Boot Deployment](https://spring.io/guides/gs/spring-boot/)
- [PostgreSQL on Render](https://render.com/docs/databases)

---

**Готово! 🎉 Ваше приложение развернуто на Render.com** 