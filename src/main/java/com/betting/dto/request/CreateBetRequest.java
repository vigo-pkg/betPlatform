package com.betting.dto.request;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class CreateBetRequest {
    
    @NotBlank(message = "Название пари обязательно")
    @Size(max = 200, message = "Название не должно превышать 200 символов")
    private String title;
    
    @NotBlank(message = "Описание пари обязательно")
    @Size(max = 1000, message = "Описание не должно превышать 1000 символов")
    private String description;
    
    @NotNull(message = "Дата начала обязательна")
    @Future(message = "Дата начала должна быть в будущем")
    private LocalDateTime startDate;
    
    @NotNull(message = "Длительность обязательна")
    @Min(value = 1, message = "Длительность должна быть минимум 1 час")
    @Max(value = 720, message = "Длительность не должна превышать 720 часов (30 дней)")
    private Integer duration;
} 