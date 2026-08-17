package com.phonestore.backend.service;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class OtpService {

    // Store OTP in memory: Email -> OtpData
    private final Map<String, OtpData> otpStorage = new ConcurrentHashMap<>();
    private final Random random = new Random();

    public String generateAndStoreOtp(String email) {
        // Generate 6 digit OTP
        String otp = String.format("%06d", random.nextInt(1000000));
        
        // Expires in 5 minutes
        OtpData otpData = new OtpData(otp, LocalDateTime.now().plusMinutes(5));
        otpStorage.put(email, otpData);
        
        return otp;
    }

    public boolean verifyOtp(String email, String otp) {
        OtpData otpData = otpStorage.get(email);
        
        if (otpData == null) {
            return false;
        }
        
        if (otpData.getExpiryTime().isBefore(LocalDateTime.now())) {
            otpStorage.remove(email); // Expired
            return false;
        }
        
        return otpData.getOtp().equals(otp);
    }
    
    public void clearOtp(String email) {
        otpStorage.remove(email);
    }

    private static class OtpData {
        private final String otp;
        private final LocalDateTime expiryTime;

        public OtpData(String otp, LocalDateTime expiryTime) {
            this.otp = otp;
            this.expiryTime = expiryTime;
        }

        public String getOtp() {
            return otp;
        }

        public LocalDateTime getExpiryTime() {
            return expiryTime;
        }
    }
}
