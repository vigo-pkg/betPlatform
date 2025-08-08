package com.betting.repository;

import com.betting.entity.Bet;
import com.betting.entity.BetStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface BetRepository extends JpaRepository<Bet, Long> {
    
    Page<Bet> findByStatus(BetStatus status, Pageable pageable);
    
    @Query("SELECT b FROM Bet b WHERE " +
           "(:status IS NULL OR b.status = :status) AND " +
           "(:search IS NULL OR LOWER(b.title) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(b.description) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Bet> findByStatusAndSearch(@Param("status") BetStatus status, 
                                   @Param("search") String search, 
                                   Pageable pageable);
    
    List<Bet> findByStatusAndStartDateBefore(BetStatus status, LocalDateTime date);
} 