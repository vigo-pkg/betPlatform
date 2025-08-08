# 🚀 Быстрое развертывание на Render

## ⚡ 5 минут до запуска

### 1. Подготовка (2 минуты)

```bash
# Создайте GitHub репозиторий
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/your-username/betting-app.git
git push -u origin main
```

### 2. Настройка Render (2 минуты)

1. **Зарегистрируйтесь** на [render.com](https://render.com)
2. **Подключите GitHub** аккаунт
3. **Нажмите "New Web Service"**
4. **Выберите ваш репозиторий**

### 3. Настройка переменных (1 минута)

В Render Dashboard добавьте:

```bash
SPRING_PROFILES_ACTIVE=production
JWT_SECRET=your-super-secret-key-here
SERVER_PORT=8080
```

### 4. Создание базы данных

1. **Нажмите "New PostgreSQL"**
2. **Скопируйте URL** базы данных
3. **Добавьте переменные**:

```bash
SPRING_DATASOURCE_URL=postgresql://postgres:5432/bettingdb
SPRING_DATASOURCE_USERNAME=postgres
SPRING_DATASOURCE_PASSWORD=postgres
```

### 5. Развертывание

**Нажмите "Create Web Service"** - готово! 🎉

## 🔗 Ваши URL

- **Backend API**: `https://your-app.onrender.com/api`
- **Swagger UI**: `https://your-app.onrender.com/api/swagger-ui.html`
- **H2 Console**: `https://your-app.onrender.com/api/h2-console`

## 🧪 Тестирование

```bash
# Создание тестовых пользователей
curl -X POST https://your-app.onrender.com/api/test/create-users

# Вход пользователя
curl -X POST https://your-app.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user1@test.com","password":"password123"}'
```

## 📱 Frontend (опционально)

1. **Создайте Static Site** в Render
2. **Выберите папку** с HTML файлами
3. **Настройте роутинг** для API

---

**Ваше приложение готово к использованию! 🚀** 