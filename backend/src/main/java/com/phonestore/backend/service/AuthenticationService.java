package com.phonestore.backend.service;

import com.phonestore.backend.dto.AuthRequest;
import com.phonestore.backend.dto.AuthResponse;
import com.phonestore.backend.dto.RegisterRequest;
import com.phonestore.backend.entity.Role;
import com.phonestore.backend.entity.User;
import com.phonestore.backend.repository.UserRepository;
import com.phonestore.backend.repository.NotificationRepository;
import com.phonestore.backend.entity.Notification;
import com.phonestore.backend.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import com.phonestore.backend.dto.ForgotPasswordRequest;
import com.phonestore.backend.dto.VerifyOtpRequest;
import com.phonestore.backend.dto.ResetPasswordRequest;

import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthenticationService {
    
    private final UserRepository repository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final OtpService otpService;
    private final EmailService emailService;
    private final NotificationRepository notificationRepository;

    public AuthResponse register(RegisterRequest request) {
        if (repository.findByEmail(request.getEmail()).isPresent()) {
            throw new org.springframework.web.server.ResponseStatusException(
                org.springframework.http.HttpStatus.BAD_REQUEST, "Email đã được sử dụng");
        }
        var user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .role(Role.USER)
                .build();
        repository.save(user);

        // Tạo thông báo cho ADMIN
        Notification adminNotif = Notification.builder()
                .recipientEmail("ADMIN")
                .title("Khách hàng mới")
                .message("Có khách hàng mới đăng ký tài khoản: " + request.getName() + " (" + request.getEmail() + ").")
                .build();
        notificationRepository.save(adminNotif);

        var jwtToken = jwtService.generateToken(user);
        return AuthResponse.builder()
                .token(jwtToken)
                .user(user)
                .build();
    }

    public AuthResponse login(AuthRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );
        var user = repository.findByEmail(request.getEmail())
                .orElseThrow();
                
        var jwtToken = jwtService.generateToken(user);
        return AuthResponse.builder()
                .token(jwtToken)
                .user(user)
                .build();
    }

    public AuthResponse loginWithGoogle(com.phonestore.backend.dto.GoogleLoginRequest request) {
        String token = request.getToken();
        String url = "https://oauth2.googleapis.com/tokeninfo?access_token=" + token;
        
        try {
            RestTemplate restTemplate = new RestTemplate();
            Map<String, Object> response = restTemplate.getForObject(url, Map.class);
            
            if (response == null || !response.containsKey("email")) {
                throw new RuntimeException("Invalid Google token");
            }
            
            String email = (String) response.get("email");
            String name = (String) response.get("name");
            
            var user = repository.findByEmail(email).orElseGet(() -> {
                User newUser = User.builder()
                        .name(name != null ? name : "Google User")
                        .email(email)
                        .password(passwordEncoder.encode(UUID.randomUUID().toString()))
                        .role(Role.USER)
                        .build();
                User savedUser = repository.save(newUser);

                // Tạo thông báo cho ADMIN
                Notification adminNotif = Notification.builder()
                        .recipientEmail("ADMIN")
                        .title("Khách hàng mới")
                        .message("Có khách hàng mới đăng ký qua Google: " + savedUser.getName() + " (" + savedUser.getEmail() + ").")
                        .build();
                notificationRepository.save(adminNotif);

                return savedUser;
            });
            
            var jwtToken = jwtService.generateToken(user);
            return AuthResponse.builder()
                    .token(jwtToken)
                    .user(user)
                    .build();
        } catch (Exception e) {
            throw new org.springframework.web.server.ResponseStatusException(
                org.springframework.http.HttpStatus.UNAUTHORIZED, "Xác thực Google thất bại");
        }
    }

    public void forgotPassword(ForgotPasswordRequest request) {
        // Cho phép gửi OTP cho bất kỳ email nào (đã đăng ký hoặc chưa)
        String email = request.getEmail();
        String otp = otpService.generateAndStoreOtp(email);
        emailService.sendOtpEmail(email, otp);
    }

    public boolean verifyOtp(VerifyOtpRequest request) {
        boolean isValid = otpService.verifyOtp(request.getEmail(), request.getOtp());
        if (!isValid) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mã OTP không hợp lệ hoặc đã hết hạn");
        }
        return true; // We don't clear OTP here yet, we wait for reset password
    }

    public void resetPassword(ResetPasswordRequest request) {
        boolean isValid = otpService.verifyOtp(request.getEmail(), request.getOtp());
        if (!isValid) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mã OTP không hợp lệ hoặc đã hết hạn");
        }

        // Tìm người dùng, nếu chưa có thì tự động tạo mới
        User user = repository.findByEmail(request.getEmail())
                .orElseGet(() -> {
                    return User.builder()
                            .name(request.getEmail().split("@")[0]) // Lấy phần trước @ làm tên mặc định
                            .email(request.getEmail())
                            .role(Role.USER)
                            .build();
                });

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        repository.save(user);

        // Clear OTP after successful reset
        otpService.clearOtp(request.getEmail());
    }
}
