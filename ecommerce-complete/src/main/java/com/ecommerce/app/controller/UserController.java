package com.ecommerce.app.controller;

import com.ecommerce.app.dto.PasswordChangeRequest;
import com.ecommerce.app.dto.ProfileUpdateRequest;
import com.ecommerce.app.model.User;
import com.ecommerce.app.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    private User getUser(UserDetails ud) {
        return userRepository.findByUsername(ud.getUsername()).orElseThrow();
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@AuthenticationPrincipal UserDetails ud,
                                            @Valid @RequestBody ProfileUpdateRequest req) {
        User user = getUser(ud);

        if (!user.getEmail().equals(req.getEmail()) && userRepository.existsByEmail(req.getEmail()))
            return ResponseEntity.badRequest().body(Map.of("message", "Email already in use"));

        user.setName(req.getName());
        user.setEmail(req.getEmail());
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "Profile updated successfully"));
    }

    @PutMapping("/password")
    public ResponseEntity<?> changePassword(@AuthenticationPrincipal UserDetails ud,
                                             @Valid @RequestBody PasswordChangeRequest req) {
        User user = getUser(ud);

        if (!passwordEncoder.matches(req.getCurrentPassword(), user.getPassword()))
            return ResponseEntity.badRequest().body(Map.of("message", "Current password is incorrect"));

        user.setPassword(passwordEncoder.encode(req.getNewPassword()));
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
    }
}
