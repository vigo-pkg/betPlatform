#!/bin/bash

# Скрипт для деплоя на Render.com
echo "🚀 Подготовка к деплою на Render.com..."

# Проверка наличия Git
if ! command -v git &> /dev/null; then
    echo "❌ Git не установлен. Установите Git и попробуйте снова."
    exit 1
fi

# Проверка статуса Git
if [ -z "$(git status --porcelain)" ]; then
    echo "✅ Рабочая директория чистая"
else
    echo "⚠️  Есть незакоммиченные изменения. Коммитите их перед деплоем."
    echo "Выполните: git add . && git commit -m 'Your commit message'"
    exit 1
fi

# Проверка наличия необходимых файлов
echo "📋 Проверка файлов конфигурации..."

required_files=("render.yaml" "Procfile" "pom.xml" "src/main/resources/application.properties")
for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        echo "❌ Файл $file не найден"
        exit 1
    fi
done

echo "✅ Все необходимые файлы найдены"

# Проверка сборки проекта
echo "🔨 Тестирование сборки проекта..."
if ! mvn clean package -DskipTests &> /dev/null; then
    echo "❌ Ошибка сборки проекта. Исправьте ошибки и попробуйте снова."
    exit 1
fi

echo "✅ Сборка прошла успешно"

# Инструкции для деплоя
echo ""
echo "📝 Инструкции для деплоя на Render.com:"
echo ""
echo "1. Перейдите на https://dashboard.render.com"
echo "2. Нажмите 'New +' → 'Blueprint'"
echo "3. Подключите ваш Git репозиторий"
echo "4. Render автоматически создаст все сервисы"
echo ""
echo "Или создайте сервисы вручную:"
echo ""
echo "🔧 Backend (Web Service):"
echo "   - Environment: Java"
echo "   - Build Command: mvn clean package -DskipTests"
echo "   - Start Command: java -jar target/betting-api-1.0.0.jar"
echo ""
echo "🗄️  Database (PostgreSQL):"
echo "   - Name: betting-postgres"
echo "   - Plan: Free"
echo ""
echo "🌐 Frontend (Static Site):"
echo "   - Build Command: echo 'Static site - no build needed'"
echo "   - Publish Directory: ."
echo ""
echo "🔑 Переменные окружения для Backend:"
echo "   SPRING_PROFILES_ACTIVE=production"
echo "   SPRING_DATASOURCE_URL=<from_database>"
echo "   SPRING_DATASOURCE_USERNAME=<from_database>"
echo "   SPRING_DATASOURCE_PASSWORD=<from_database>"
echo "   JWT_SECRET=<generate_random_secret>"
echo "   SERVER_PORT=8080"
echo "   SPRING_JPA_HIBERNATE_DDL_AUTO=update"
echo "   SPRING_JPA_SHOW_SQL=false"
echo ""
echo "✅ Готово к деплою!"
echo ""
echo "🔗 После деплоя проверьте:"
echo "   - Backend: https://your-app.onrender.com/api/test/health"
echo "   - Swagger: https://your-app.onrender.com/api/swagger-ui.html"
echo "   - Frontend: https://your-frontend.onrender.com" 