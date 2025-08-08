package com.betting.entity;

public enum BetStatus {
    OPEN,           // Открыто для присоединения
    IN_PROGRESS,    // В процессе выполнения
    IMPLEMENTED,    // Время истекло, доступно голосование
    CONFLICT,       // Конфликт в голосовании
    RESOLVED,       // Разрешено судьей
    FINISHED        // Завершено
} 