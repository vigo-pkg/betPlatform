# Руководство по развертыванию Betting App

## 🚀 Бесплатные платформы для размещения

### 1. **Render** (Рекомендуется)
- ✅ **Бесплатный план**: 750 часов/месяц
- ✅ **Автоматический деплой** из GitHub
- ✅ **Поддержка Spring Boot** и статических файлов
- ✅ **SSL сертификат** включен

### 2. **Railway**
- ✅ **Бесплатный план**: $5 кредитов/месяц
- ✅ **Автоматический деплой**
- ✅ **Поддержка Java/Spring Boot**

### 3. **Heroku**
- ⚠️ **Бесплатный план**: только для тестирования
- ✅ **Отличная поддержка Spring Boot**

## 📋 Пошаговое развертывание на Render

### Шаг 1: Подготовка репозитория

1. **Создайте GitHub репозиторий**
2. **Загрузите код** в репозиторий
3. **Убедитесь, что все файлы на месте**:
   - `render.yaml`
   - `Procfile`
   - `pom.xml`
   - `src/main/resources/application.properties`

### Шаг 2: Настройка Render

1. **Зарегистрируйтесь** на [render.com](https://render.com)
2. **Подключите GitHub** аккаунт
3. **Создайте новый Web Service**:
   - Выберите ваш репозиторий
   - Название: `betting-api`
   - Environment: `Java`
   - Build Command: `mvn clean package -DskipTests`
   - Start Command: `java -jar target/betting-api-1.0.0.jar`

### Шаг 3: Настройка переменных окружения

В Render Dashboard добавьте переменные:

```bash
SPRING_PROFILES_ACTIVE=production
SPRING_DATASOURCE_URL=postgresql://postgres:5432/bettingdb
SPRING_DATASOURCE_USERNAME=postgres
SPRING_DATASOURCE_PASSWORD=postgres
JWT_SECRET=your-secret-key-here
SERVER_PORT=8080
```

### Шаг 4: Создание базы данных

1. **Создайте PostgreSQL** в Render
2. **Скопируйте URL** базы данных
3. **Обновите переменную** `SPRING_DATASOURCE_URL`

### Шаг 5: Развертывание Frontend

1. **Создайте Static Site** в Render
2. **Выберите репозиторий** с frontend файлами
3. **Настройте роутинг** для API

## 🔧 Альтернативные платформы

### Railway

```bash
# Установите Railway CLI
npm install -g @railway/cli

# Войдите в аккаунт
railway login

# Инициализируйте проект
railway init

# Разверните
railway up
```

### Heroku

```bash
# Установите Heroku CLI
# Создайте приложение
heroku create betting-app

# Добавьте PostgreSQL
heroku addons:create heroku-postgresql:mini

# Разверните
git push heroku main
```

## 📊 Мониторинг и логи

### Render
- **Логи**: Доступны в Dashboard
- **Метрики**: CPU, Memory, Network
- **Алерты**: Настройте уведомления

### Railway
- **Логи**: `railway logs`
- **Метрики**: Dashboard
- **Мониторинг**: Встроенный

## 🔒 Безопасность

### SSL сертификаты
- ✅ **Render**: Автоматически
- ✅ **Railway**: Автоматически
- ✅ **Heroku**: Автоматически

### Переменные окружения
```bash
# Никогда не коммитьте секреты в Git
JWT_SECRET=your-super-secret-key
DATABASE_URL=postgresql://...
API_KEYS=...
```

## 🚨 Устранение неполадок

### Проблема: "Build failed"
**Решение:**
1. Проверьте `pom.xml`
2. Убедитесь, что все зависимости указаны
3. Проверьте логи сборки

### Проблема: "Database connection failed"
**Решение:**
1. Проверьте переменные окружения
2. Убедитесь, что база данных создана
3. Проверьте права доступа

### Проблема: "Port already in use"
**Решение:**
1. Проверьте `application.properties`
2. Убедитесь, что порт не занят
3. Используйте переменную `SERVER_PORT`

## 📈 Оптимизация производительности

### Backend
```properties
# Оптимизация JVM
JAVA_OPTS=-Xmx512m -Xms256m

# Кэширование
spring.jpa.properties.hibernate.cache.use_second_level_cache=true
spring.jpa.properties.hibernate.cache.region.factory_class=org.hibernate.cache.jcache.JCacheRegionFactory
```

### Frontend
```javascript
// Минификация и сжатие
// Используйте CDN для статических ресурсов
// Оптимизируйте изображения
```

## 🔄 CI/CD

### GitHub Actions
```yaml
name: Deploy to Render
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Render
        run: |
          # Автоматический деплой через Render API
```

## 📞 Поддержка

### Render
- **Документация**: [render.com/docs](https://render.com/docs)
- **Поддержка**: Email, Discord
- **Сообщество**: GitHub Discussions

### Railway
- **Документация**: [railway.app/docs](https://railway.app/docs)
- **Поддержка**: Discord
- **Сообщество**: GitHub

---

**Готово к развертыванию! 🚀** 