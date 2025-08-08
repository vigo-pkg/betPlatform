package com.betting.controller;

import com.betting.entity.User;
import com.betting.entity.UserRole;
import com.betting.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("/test")
@RequiredArgsConstructor
@Tag(name = "Тестовые данные", description = "API для создания тестовых данных")
public class TestController {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    
    @PostMapping("/create-users")
    @Operation(summary = "Создание тестовых пользователей", description = "Создает 5 тестовых пользователей")
    public String createTestUsers() {
        List<User> testUsers = Arrays.asList(
            createTestUser("user1@test.com", "password123", "Иван", "Иванов"),
            createTestUser("user2@test.com", "password123", "Петр", "Петров"),
            createTestUser("user3@test.com", "password123", "Анна", "Сидорова"),
            createTestUser("user4@test.com", "password123", "Мария", "Козлова"),
            createTestUser("user5@test.com", "password123", "Алексей", "Смирнов")
        );
        
        for (User user : testUsers) {
            if (userRepository.findByEmail(user.getEmail()).isEmpty()) {
                userRepository.save(user);
            }
        }
        
        return "Тестовые пользователи созданы успешно!";
    }
    
    private User createTestUser(String email, String password, String firstName, String lastName) {
        User user = new User();
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setRole(UserRole.USER);
        user.setActive(true);
        return user;
    }
} 