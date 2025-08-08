package com.betting.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Entity
@Table(name = "bets")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Bet {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String title;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(name = "start_date", nullable = false)
    private LocalDateTime startDate;
    
    @Column(nullable = false)
    private Integer duration; // в часах
    
    @Enumerated(EnumType.STRING)
    private BetStatus status = BetStatus.OPEN;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "creator_id", nullable = false)
    private User creator;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "participant_id")
    private User participant;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "observer_id")
    private User observer;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "winner_id")
    private User winner;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;
    
    @ElementCollection
    @CollectionTable(name = "bet_votes", joinColumns = @JoinColumn(name = "bet_id"))
    @MapKeyJoinColumn(name = "user_id")
    @MapKeyEnumerated(EnumType.STRING)
    @Column(name = "vote_result")
    private Map<User, VoteResult> votes = new HashMap<>();
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    public boolean isTimeExpired() {
        return LocalDateTime.now().isAfter(startDate.plusHours(duration));
    }
    
    public boolean hasAllParticipants() {
        return participant != null && observer != null;
    }
    
    public boolean hasConflict() {
        if (votes.size() < 2) return false;
        
        boolean hasWin = votes.values().stream().anyMatch(vote -> vote == VoteResult.WIN);
        boolean hasLose = votes.values().stream().anyMatch(vote -> vote == VoteResult.LOSE);
        
        return hasWin && hasLose;
    }
    
    public boolean isResolved() {
        return status == BetStatus.RESOLVED || status == BetStatus.FINISHED;
    }
} 