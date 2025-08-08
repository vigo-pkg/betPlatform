# Используем официальный образ OpenJDK 17
FROM openjdk:17-jdk-slim

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем Maven wrapper и pom.xml
COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .

# Делаем mvnw исполняемым
RUN chmod +x mvnw

# Скачиваем зависимости (этот слой будет кэшироваться)
RUN ./mvnw dependency:go-offline -B

# Копируем исходный код
COPY src src

# Собираем приложение
RUN ./mvnw clean package -DskipTests

# Создаем пользователя для безопасности
RUN addgroup --system javauser && adduser --system --ingroup javauser javauser

# Меняем владельца файлов
RUN chown -R javauser:javauser /app
USER javauser

# Открываем порт
EXPOSE 8080

# Запускаем приложение
CMD ["java", "-jar", "target/betting-api-1.0.0.jar"] 