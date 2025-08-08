package com.betting.dto.response;

import com.betting.entity.Bet;
import com.betting.entity.BetStatus;
import com.betting.entity.VoteResult;
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
public class BetResponse {
    
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
    private Map<String, VoteResult> votes;
    private String shareUrl;
    
    public static BetResponse fromBet(Bet bet) {
        Map<String, VoteResult> votesMap = bet.getVotes().entrySet().stream()
                .collect(java.util.stream.Collectors.toMap(
                        entry -> entry.getKey().getEmail(),
                        Map.Entry::getValue
                ));
        
        return BetResponse.builder()
                .id(bet.getId())
                .title(bet.getTitle())
                .description(bet.getDescription())
                .startDate(bet.getStartDate())
                .duration(bet.getDuration())
                .status(bet.getStatus())
                .creator(UserResponse.fromUser(bet.getCreator()))
                .participant(bet.getParticipant() != null ? UserResponse.fromUser(bet.getParticipant()) : null)
                .observer(bet.getObserver() != null ? UserResponse.fromUser(bet.getObserver()) : null)
                .winner(bet.getWinner() != null ? UserResponse.fromUser(bet.getWinner()) : null)
                .createdAt(bet.getCreatedAt())
                .updatedAt(bet.getUpdatedAt())
                .resolvedAt(bet.getResolvedAt())
                .votes(votesMap)
                .shareUrl("/bet/" + bet.getId())
                .build();
    }
} 