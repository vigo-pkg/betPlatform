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

# Устанавливаем переменные окружения по умолчанию для production
ENV SPRING_PROFILES_ACTIVE=production
ENV SERVER_PORT=8080
ENV SPRING_JPA_HIBERNATE_DDL_AUTO=update
ENV SPRING_JPA_SHOW_SQL=false
ENV SERVER_SERVLET_CONTEXT_PATH=/api

# Запускаем приложение с production профилем
CMD ["java", "-Dspring.profiles.active=production", "-jar", "target/betting-api-1.0.0.jar"] 