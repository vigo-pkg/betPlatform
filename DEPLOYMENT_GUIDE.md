# Руководство по деплою на Render.com

## Подготовка к деплою

### 1. Требования
- Аккаунт на [Render.com](https://render.com)
- Git репозиторий с кодом (GitHub, GitLab, Bitbucket)

### 2. Структура проекта
```
deals/
├── src/main/java/com/betting/     # Spring Boot код
├── src/main/resources/            # Конфигурация
├── pom.xml                       # Maven конфигурация
├── render.yaml                   # Render конфигурация
├── Procfile                      # Heroku/Render Procfile
├── index.html                    # Фронтенд
├── app.js                        # JavaScript
└── .env.example                  # Пример переменных окружения
```

## Деплой на Render.com

### Шаг 1: Подготовка репозитория

1. Убедитесь, что все файлы закоммичены в Git:
```bash
git add .
git commit -m "Prepare for deployment"
git push origin main
```

### Шаг 2: Создание сервисов на Render

1. **Создание базы данных PostgreSQL:**
   - Перейдите на [Render Dashboard](https://dashboard.render.com)
   - Нажмите "New +" → "PostgreSQL"
   - Название: `betting-postgres`
   - План: Free
   - Нажмите "Create Database"

2. **Создание Web Service для Backend:**
   - Нажмите "New +" → "Web Service"
   - Подключите ваш Git репозиторий
   - Название: `betting-api`
   - Environment: Java
   - Build Command: `mvn clean package -DskipTests`
   - Start Command: `java -jar target/betting-api-1.0.0.jar`

3. **Настройка переменных окружения для Backend:**
   ```
   SPRING_PROFILES_ACTIVE=production
   SPRING_DATASOURCE_URL=<connection_string_from_postgres>
   SPRING_DATASOURCE_USERNAME=<username_from_postgres>
   SPRING_DATASOURCE_PASSWORD=<password_from_postgres>
   JWT_SECRET=<generate_random_secret>
   SERVER_PORT=8080
   SPRING_JPA_HIBERNATE_DDL_AUTO=update
   SPRING_JPA_SHOW_SQL=false
   ```

4. **Создание Static Site для Frontend:**
   - Нажмите "New +" → "Static Site"
   - Подключите тот же Git репозиторий
   - Название: `betting-frontend`
   - Build Command: `echo "Static site - no build needed"`
   - Publish Directory: `.`

### Шаг 3: Автоматический деплой с render.yaml

Альтернативно, вы можете использовать файл `render.yaml` для автоматического создания всех сервисов:

1. Убедитесь, что `render.yaml` находится в корне репозитория
2. На Render Dashboard нажмите "New +" → "Blueprint"
3. Подключите ваш репозиторий
4. Render автоматически создаст все сервисы согласно конфигурации

## Проверка деплоя

### Backend API
- URL: `https://betting-api.onrender.com/api`
- Swagger UI: `https://betting-api.onrender.com/api/swagger-ui.html`
- Health Check: `https://betting-api.onrender.com/api/health`

### Frontend
- URL: `https://betting-frontend.onrender.com`

### База данных
- Доступна через Render Dashboard
- Connection string предоставляется автоматически

## Переменные окружения

### Production (Render)
```bash
SPRING_PROFILES_ACTIVE=production
SPRING_DATASOURCE_URL=jdbc:postgresql://host:port/database
SPRING_DATASOURCE_USERNAME=username
SPRING_DATASOURCE_PASSWORD=password
JWT_SECRET=your-secret-key
SERVER_PORT=8080
SPRING_JPA_HIBERNATE_DDL_AUTO=update
SPRING_JPA_SHOW_SQL=false
```

### Development (Local)
```bash
SPRING_PROFILES_ACTIVE=dev
SPRING_DATASOURCE_URL=jdbc:h2:mem:bettingdb
JWT_SECRET=dev-secret-key
SERVER_PORT=8080
```

## Мониторинг и логи

### Просмотр логов
1. Перейдите в Dashboard вашего Web Service
2. Вкладка "Logs" показывает логи приложения
3. Вкладка "Events" показывает события деплоя

### Health Checks
- Render автоматически проверяет доступность сервиса
- Если сервис недоступен, он будет перезапущен

## Troubleshooting

### Частые проблемы

1. **Ошибка компиляции:**
   - Проверьте логи в Render Dashboard
   - Убедитесь, что все зависимости указаны в `pom.xml`

2. **Ошибка подключения к базе данных:**
   - Проверьте переменные окружения
   - Убедитесь, что база данных создана и доступна

3. **Ошибка порта:**
   - Убедитесь, что `SERVER_PORT=8080`
   - Render автоматически предоставляет `PORT` переменную

4. **CORS ошибки:**
   - Проверьте настройки CORS в `SecurityConfig.java`
   - Убедитесь, что фронтенд и бэкенд на правильных доменах

### Полезные команды

```bash
# Локальное тестирование
mvn clean package -DskipTests
java -jar target/betting-api-1.0.0.jar

# Проверка переменных окружения
echo $SPRING_PROFILES_ACTIVE
echo $SPRING_DATASOURCE_URL

# Тестирование API
curl -X GET https://betting-api.onrender.com/api/bets
```

## Обновление приложения

1. Внесите изменения в код
2. Закоммитьте и запушьте в Git
3. Render автоматически пересоберет и перезапустит сервис
4. Проверьте логи для подтверждения успешного деплоя

## Безопасность

### Production рекомендации
- Используйте сильный JWT_SECRET
- Настройте HTTPS (автоматически на Render)
- Ограничьте CORS настройки
- Используйте переменные окружения для секретов
- Регулярно обновляйте зависимости

### Мониторинг
- Настройте алерты в Render Dashboard
- Мониторьте использование ресурсов
- Проверяйте логи на наличие ошибок 