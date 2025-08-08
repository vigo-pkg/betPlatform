package com.betting.dto.response;

import com.betting.entity.BetStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BetDetailResponse {
    private Long id;
    private String title;
    private String description;
    private LocalDateTime startDate;
    private Integer duration;
    private BetStatus status;
    private UserResponse creator;
    private UserResponse participant;
    private UserResponse observer;
    private UserResponse winner;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime resolvedAt;
    private Map<String, Object> votes;
    private String shareUrl;
} 