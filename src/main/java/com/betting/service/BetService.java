package com.betting.service;

import com.betting.dto.request.CreateBetRequest;
import com.betting.dto.request.VoteRequest;
import com.betting.dto.request.JoinBetRequest;
import com.betting.dto.request.CommentRequest;
import com.betting.dto.request.ResolveConflictRequest;
import com.betting.dto.response.BetResponse;
import com.betting.dto.response.VoteResponse;
import com.betting.dto.response.CommentResponse;
import com.betting.entity.Bet;
import com.betting.entity.BetStatus;
import com.betting.entity.User;
import com.betting.entity.VoteResult;
import com.betting.repository.BetRepository;
import com.betting.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class BetService {
    
    private final BetRepository betRepository;
    private final UserRepository userRepository;
    
    public BetResponse createBet(CreateBetRequest request, String userEmail) {
        User creator = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Пользователь не найден"));
        
        Bet bet = new Bet();
        bet.setTitle(request.getTitle());
        bet.setDescription(request.getDescription());
        bet.setStartDate(request.getStartDate());
        bet.setDuration(request.getDuration());
        bet.setStatus(BetStatus.OPEN);
        bet.setCreator(creator);
        
        Bet savedBet = betRepository.save(bet);
        return BetResponse.fromBet(savedBet);
    }
    
    public Page<BetResponse> getBets(String status, String search, Pageable pageable) {
        Page<Bet> bets;
        
        if (status != null && !status.isEmpty()) {
            BetStatus betStatus = BetStatus.valueOf(status.toUpperCase());
            if (search != null && !search.isEmpty()) {
                bets = betRepository.findByStatusAndSearch(betStatus, search, pageable);
            } else {
                bets = betRepository.findByStatus(betStatus, pageable);
            }
        } else {
            if (search != null && !search.isEmpty()) {
                bets = betRepository.findByStatusAndSearch(null, search, pageable);
            } else {
                bets = betRepository.findAll(pageable);
            }
        }
        
        return bets.map(BetResponse::fromBet);
    }
    
    public BetResponse getBet(Long id) {
        Bet bet = betRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Пари не найдено"));
        return BetResponse.fromBet(bet);
    }
    
    public BetResponse joinBet(Long betId, String role, String userEmail) {
        Bet bet = betRepository.findById(betId)
                .orElseThrow(() -> new RuntimeException("Пари не найдено"));
        
        if (bet.getStatus() != BetStatus.OPEN) {
            throw new RuntimeException("Нельзя присоединиться к пари в статусе " + bet.getStatus());
        }
        
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Пользователь не найден"));
        
        if (bet.getCreator().getId().equals(user.getId())) {
            throw new RuntimeException("Создатель не может присоединиться к своему пари");
        }
        
        if ("PARTICIPANT".equals(role)) {
            if (bet.getParticipant() != null) {
                throw new RuntimeException("Участник уже присоединился к пари");
            }
            bet.setParticipant(user);
        } else if ("OBSERVER".equals(role)) {
            if (bet.getObserver() != null) {
                throw new RuntimeException("Наблюдатель уже присоединился к пари");
            }
            bet.setObserver(user);
        } else {
            throw new RuntimeException("Неверная роль: " + role);
        }
        
        // Проверяем, нужно ли изменить статус
        if (bet.hasAllParticipants()) {
            bet.setStatus(BetStatus.IN_PROGRESS);
        }
        
        Bet savedBet = betRepository.save(bet);
        return BetResponse.fromBet(savedBet);
    }
    
    public VoteResponse getVotes(Long betId) {
        Bet bet = betRepository.findById(betId)
                .orElseThrow(() -> new RuntimeException("Пари не найдено"));
        
        // Подсчитываем голоса
        long forVotes = bet.getVotes().values().stream()
                .filter(vote -> vote == VoteResult.WIN)
                .count();
        
        long againstVotes = bet.getVotes().values().stream()
                .filter(vote -> vote == VoteResult.LOSE)
                .count();
        
        return VoteResponse.builder()
                .forVotes((int) forVotes)
                .againstVotes((int) againstVotes)
                .userVote(null) // TODO: добавить проверку голоса текущего пользователя
                .build();
    }
    
    public VoteResponse getVotes(Long betId, String userEmail) {
        Bet bet = betRepository.findById(betId)
                .orElseThrow(() -> new RuntimeException("Пари не найдено"));
        
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Пользователь не найден"));
        
        // Подсчитываем голоса
        long forVotes = bet.getVotes().values().stream()
                .filter(vote -> vote == VoteResult.WIN)
                .count();
        
        long againstVotes = bet.getVotes().values().stream()
                .filter(vote -> vote == VoteResult.LOSE)
                .count();
        
        // Проверяем голос текущего пользователя
        VoteResult userVote = bet.getVotes().get(user);
        Boolean userVoteBoolean = null;
        if (userVote != null) {
            userVoteBoolean = (userVote == VoteResult.WIN);
        }
        
        return VoteResponse.builder()
                .forVotes((int) forVotes)
                .againstVotes((int) againstVotes)
                .userVote(userVoteBoolean)
                .build();
    }
    
    public BetResponse vote(Long betId, VoteRequest request, String userEmail) {
        Bet bet = betRepository.findById(betId)
                .orElseThrow(() -> new RuntimeException("Пари не найдено"));
        
        if (bet.getStatus() != BetStatus.IN_PROGRESS) {
            throw new RuntimeException("Голосовать можно только в процессе пари");
        }
        
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Пользователь не найден"));
        
        // Проверяем, что пользователь является участником или наблюдателем
        if ((bet.getParticipant() == null || !bet.getParticipant().getId().equals(user.getId())) && 
            (bet.getObserver() == null || !bet.getObserver().getId().equals(user.getId()))) {
            throw new RuntimeException("Голосовать могут только участники и наблюдатели");
        }
        
        // Сохраняем голос
        VoteResult voteResult = request.isVote() ? VoteResult.WIN : VoteResult.LOSE;
        bet.getVotes().put(user, voteResult);
        
        // Проверяем, не возник ли конфликт
        if (bet.hasConflict()) {
            bet.setStatus(BetStatus.CONFLICT);
        }
        
        Bet savedBet = betRepository.save(bet);
        return BetResponse.fromBet(savedBet);
    }
    
    public List<CommentResponse> getComments(Long betId) {
        Bet bet = betRepository.findById(betId)
                .orElseThrow(() -> new RuntimeException("Пари не найдено"));
        
        // Здесь должна быть логика получения комментариев
        // Пока возвращаем пустой список
        return List.of();
    }
    
    public CommentResponse addComment(Long betId, String text, String userEmail) {
        Bet bet = betRepository.findById(betId)
                .orElseThrow(() -> new RuntimeException("Пари не найдено"));
        
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Пользователь не найден"));
        
        // Здесь должна быть логика сохранения комментария
        // Пока возвращаем заглушку
        return CommentResponse.builder()
                .id(1L)
                .text(text)
                .author(com.betting.dto.response.UserResponse.fromUser(user))
                .createdAt(LocalDateTime.now())
                .build();
    }
    
    public BetResponse resolveConflict(Long betId, String winner, String userEmail) {
        Bet bet = betRepository.findById(betId)
                .orElseThrow(() -> new RuntimeException("Пари не найдено"));
        
        if (bet.getStatus() != BetStatus.CONFLICT) {
            throw new RuntimeException("Конфликт можно разрешить только в статусе CONFLICT");
        }
        
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Пользователь не найден"));
        
        // Проверяем, что пользователь является создателем или наблюдателем
        if (!bet.getCreator().getId().equals(user.getId()) && 
            (bet.getObserver() == null || !bet.getObserver().getId().equals(user.getId()))) {
            throw new RuntimeException("Разрешать конфликт могут только создатель или наблюдатель");
        }
        
        if ("creator".equals(winner)) {
            bet.setWinner(bet.getCreator());
        } else if ("participant".equals(winner)) {
            bet.setWinner(bet.getParticipant());
        } else if ("draw".equals(winner)) {
            bet.setWinner(null); // Ничья
        } else {
            throw new RuntimeException("Неверный победитель: " + winner);
        }
        
        bet.setStatus(BetStatus.RESOLVED);
        bet.setResolvedAt(LocalDateTime.now());
        
        Bet savedBet = betRepository.save(bet);
        return BetResponse.fromBet(savedBet);
    }
    
    public BetResponse finishBet(Long betId, String userEmail) {
        Bet bet = betRepository.findById(betId)
                .orElseThrow(() -> new RuntimeException("Пари не найдено"));
        
        if (bet.getStatus() != BetStatus.OPEN && bet.getStatus() != BetStatus.IN_PROGRESS) {
            throw new RuntimeException("Завершить можно только открытое или активное пари");
        }
        
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Пользователь не найден"));
        
        // Проверяем, что пользователь является создателем
        if (!bet.getCreator().getId().equals(user.getId())) {
            throw new RuntimeException("Завершить пари может только создатель");
        }
        
        bet.setStatus(BetStatus.FINISHED);
        
        Bet savedBet = betRepository.save(bet);
        return BetResponse.fromBet(savedBet);
    }
    
    public void deleteBet(Long betId, String userEmail) {
        Bet bet = betRepository.findById(betId)
                .orElseThrow(() -> new RuntimeException("Пари не найдено"));
        
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Пользователь не найден"));
        
        if (!bet.getCreator().getId().equals(user.getId())) {
            throw new RuntimeException("Удалить пари может только создатель");
        }
        
        betRepository.delete(bet);
    }
    
    public void updateExpiredBets() {
        LocalDateTime now = LocalDateTime.now();
        // Используем существующий метод для поиска пари с истекшей датой
        betRepository.findByStatusAndStartDateBefore(BetStatus.OPEN, now).forEach(bet -> {
            bet.setStatus(BetStatus.IMPLEMENTED);
            betRepository.save(bet);
        });
    }
} 