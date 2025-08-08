package com.betting.controller;

import com.betting.dto.request.LoginRequest;
import com.betting.dto.request.RegisterRequest;
import com.betting.dto.response.AuthResponse;
import com.betting.dto.response.UserResponse;
import com.betting.entity.User;
import com.betting.service.AuthService;
import com.betting.service.JwtService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Tag(name = "Аутентификация", description = "API для регистрации и входа пользователей")
public class AuthController {
    
    private final AuthService authService;
    private final JwtService jwtService;
    
    @PostMapping("/register")
    @Operation(summary = "Регистрация пользователя", description = "Создает нового пользователя и возвращает JWT токен")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        try {
            User user = authService.register(request);
            String token = jwtService.generateToken(user);
            
            AuthResponse response = AuthResponse.builder()
                    .token(token)
                    .user(UserResponse.fromUser(user))
                    .build();
            
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(AuthResponse.builder()
                    .message(e.getMessage())
                    .build());
        }
    }
    
    @PostMapping("/login")
    @Operation(summary = "Вход пользователя", description = "Аутентифицирует пользователя и возвращает JWT токен")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        try {
            User user = authService.login(request);
            String token = jwtService.generateToken(user);
            
            AuthResponse response = AuthResponse.builder()
                    .token(token)
                    .user(UserResponse.fromUser(user))
                    .build();
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(AuthResponse.builder()
                    .message(e.getMessage())
                    .build());
        }
    }
    
    @GetMapping("/validate")
    @Operation(summary = "Валидация токена", description = "Проверяет валидность JWT токена и возвращает информацию о пользователе")
    public ResponseEntity<UserResponse> validateToken(@RequestHeader("Authorization") String authHeader) {
        try {
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7);
                String email = jwtService.extractUsername(token);
                
                if (email != null) {
                    User user = authService.findByEmail(email);
                    if (jwtService.isTokenValid(token, user)) {
                        return ResponseEntity.ok(UserResponse.fromUser(user));
                    }
                }
            }
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }
} 