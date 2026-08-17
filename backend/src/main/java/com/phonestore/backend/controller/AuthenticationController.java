package com.phonestore.backend.controller;

import com.phonestore.backend.dto.AuthRequest;
import com.phonestore.backend.dto.AuthResponse;
import com.phonestore.backend.dto.RegisterRequest;
import com.phonestore.backend.dto.ForgotPasswordRequest;
import com.phonestore.backend.dto.VerifyOtpRequest;
import com.phonestore.backend.dto.ResetPasswordRequest;
import com.phonestore.backend.service.AuthenticationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // Allows frontend to call this API
public class AuthenticationController {

    private final AuthenticationService service;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(
            @RequestBody RegisterRequest request
    ) {
        return ResponseEntity.ok(service.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @RequestBody AuthRequest request
    ) {
        return ResponseEntity.ok(service.login(request));
    }

    @PostMapping("/google")
    public ResponseEntity<AuthResponse> loginWithGoogle(
            @RequestBody com.phonestore.backend.dto.GoogleLoginRequest request
    ) {
        return ResponseEntity.ok(service.loginWithGoogle(request));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        service.forgotPassword(request);
        return ResponseEntity.ok().body(Map.of("message", "OTP đã được gửi tới email của bạn"));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody VerifyOtpRequest request) {
        service.verifyOtp(request);
        return ResponseEntity.ok().body(Map.of("message", "Mã OTP hợp lệ"));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest request) {
        service.resetPassword(request);
        return ResponseEntity.ok().body(Map.of("message", "Đổi mật khẩu thành công"));
    }
}
