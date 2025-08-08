package com.betting.controller;

import com.betting.dto.request.CreateBetRequest;
import com.betting.dto.request.VoteRequest;
import com.betting.dto.request.JoinBetRequest;
import com.betting.dto.request.CommentRequest;
import com.betting.dto.request.ResolveConflictRequest;
import com.betting.dto.response.BetResponse;
import com.betting.dto.response.VoteResponse;
import com.betting.dto.response.CommentResponse;
import com.betting.service.BetService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/bets")
@RequiredArgsConstructor
@Tag(name = "Bets", description = "API для управления пари")
public class BetController {
    
    private final BetService betService;
    
    @PostMapping
    @Operation(summary = "Создание пари", description = "Создает новое пари")
    public ResponseEntity<BetResponse> createBet(
            @Valid @RequestBody CreateBetRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        BetResponse response = betService.createBet(request, userDetails.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    @GetMapping
    @Operation(summary = "Получение списка пари", description = "Возвращает список всех пари с пагинацией")
    public ResponseEntity<Page<BetResponse>> getBets(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search,
            Pageable pageable) {
        Page<BetResponse> bets = betService.getBets(status, search, pageable);
        return ResponseEntity.ok(bets);
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Получение пари по ID", description = "Возвращает детальную информацию о пари")
    public ResponseEntity<BetResponse> getBet(@PathVariable Long id) {
        BetResponse bet = betService.getBet(id);
        return ResponseEntity.ok(bet);
    }
    
    @PostMapping("/{id}/join")
    @Operation(summary = "Присоединение к пари", description = "Присоединяет пользователя к пари как участника или наблюдателя")
    public ResponseEntity<BetResponse> joinBet(
            @PathVariable Long id,
            @Valid @RequestBody JoinBetRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        BetResponse bet = betService.joinBet(id, request.getRole(), userDetails.getUsername());
        return ResponseEntity.ok(bet);
    }
    
    @GetMapping("/{id}/votes")
    @Operation(summary = "Получение голосов", description = "Возвращает статистику голосования")
    public ResponseEntity<VoteResponse> getVotes(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        VoteResponse votes = betService.getVotes(id, userDetails.getUsername());
        return ResponseEntity.ok(votes);
    }
    
    @PostMapping("/{id}/vote")
    @Operation(summary = "Голосование", description = "Позволяет участникам проголосовать за результат пари")
    public ResponseEntity<BetResponse> vote(
            @PathVariable Long id,
            @Valid @RequestBody VoteRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        BetResponse bet = betService.vote(id, request, userDetails.getUsername());
        return ResponseEntity.ok(bet);
    }
    
    @GetMapping("/{id}/comments")
    @Operation(summary = "Получение комментариев", description = "Возвращает список комментариев к пари")
    public ResponseEntity<List<CommentResponse>> getComments(@PathVariable Long id) {
        List<CommentResponse> comments = betService.getComments(id);
        return ResponseEntity.ok(comments);
    }
    
    @PostMapping("/{id}/comments")
    @Operation(summary = "Добавление комментария", description = "Добавляет новый комментарий к пари")
    public ResponseEntity<CommentResponse> addComment(
            @PathVariable Long id,
            @Valid @RequestBody CommentRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        CommentResponse comment = betService.addComment(id, request.getText(), userDetails.getUsername());
        return ResponseEntity.ok(comment);
    }
    
    @PostMapping("/{id}/resolve")
    @Operation(summary = "Разрешение конфликта", description = "Позволяет наблюдателю разрешить конфликт в пари")
    public ResponseEntity<BetResponse> resolveConflict(
            @PathVariable Long id,
            @Valid @RequestBody ResolveConflictRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        BetResponse bet = betService.resolveConflict(id, request.getWinner(), userDetails.getUsername());
        return ResponseEntity.ok(bet);
    }
    
    @PostMapping("/{id}/finish")
    @Operation(summary = "Завершение пари", description = "Завершает пари")
    public ResponseEntity<BetResponse> finishBet(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        BetResponse bet = betService.finishBet(id, userDetails.getUsername());
        return ResponseEntity.ok(bet);
    }
    
    @DeleteMapping("/{id}")
    @Operation(summary = "Удаление пари", description = "Удаляет пари (только создатель может удалить)")
    public ResponseEntity<Void> deleteBet(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        betService.deleteBet(id, userDetails.getUsername());
        return ResponseEntity.noContent().build();
    }
} 