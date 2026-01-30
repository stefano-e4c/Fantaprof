package com.minegolem.fantaprof.controller;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.minegolem.fantaprof.repository.UserRepository;
import com.minegolem.fantaprof.repository.database.User;
import com.minegolem.fantaprof.utils.SecurityConstants;
import lombok.AllArgsConstructor;
import lombok.Data;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Date;

@RestController
@AllArgsConstructor
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;

    @GetMapping("/version")
    public String version() {
        return "v2-2026-01-30";
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        var userOpt = userRepository.findByUsername(request.getUsername());

        if (userOpt.isEmpty()) {
            return ResponseEntity.status(401).body(new ErrorResponse("Invalid credentials"));
        }

        User user = userOpt.get();

        if (!user.getPassword().equals(request.getPassword())) {
            return ResponseEntity.status(401).body(new ErrorResponse("Invalid credentials"));
        }

        String token = JWT.create()
                .withSubject(user.getUsername())
                .withClaim("role", user.getRole())
                .withExpiresAt(new Date(System.currentTimeMillis() + SecurityConstants.EXPIRATION_TIME))
                .sign(Algorithm.HMAC512(SecurityConstants.SECRET.getBytes()));

        return ResponseEntity.ok(new LoginResponse(token, user.getUsername(), user.getRole()));
    }

    @Data
    static class LoginRequest {
        private String username;
        private String password;
    }

    @Data
    @AllArgsConstructor
    static class LoginResponse {
        private String token;
        private String username;
        private String role;
    }

    @Data
    @AllArgsConstructor
    static class ErrorResponse {
        private String message;
    }
}
