package com.betting.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VoteResponse {
    private int forVotes;
    private int againstVotes;
    private Boolean userVote; // null если пользователь не голосовал, true/false если голосовал
} 