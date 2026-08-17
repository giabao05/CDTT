package com.phonestore.backend.controller;

import com.phonestore.backend.repository.NotificationRepository;
import com.phonestore.backend.entity.Notification;
import com.phonestore.backend.service.EmailService;
import com.phonestore.backend.service.ContactService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/contact")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ContactController {

    private final ContactService contactService;
    private final NotificationRepository notificationRepository;
    private final EmailService emailService;

    @PostMapping
    public ResponseEntity<?> submitContactForm(@RequestBody ContactRequest request) {
        try {
            contactService.saveContact(request.getName(), request.getEmail(), request.getContent());
            emailService.sendContactEmail(request.getName(), request.getEmail(), request.getContent());
            
            // Tạo thông báo cho ADMIN
            Notification adminNotif = Notification.builder()
                    .recipientEmail("ADMIN")
                    .title("Liên hệ mới")
                    .message("Có tin nhắn liên hệ mới từ " + request.getName() + " (" + request.getEmail() + ").")
                    .build();
            notificationRepository.save(adminNotif);

            return ResponseEntity.ok().body("{\"message\": \"Gửi liên hệ thành công!\"}");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("{\"message\": \"Có lỗi xảy ra, không thể gửi liên hệ.\"}");
        }
    }

    @GetMapping
    public ResponseEntity<?> getAllContacts() {
        return ResponseEntity.ok(contactService.getAllContacts());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getContactById(@PathVariable Long id) {
        return ResponseEntity.ok(contactService.getContactById(id));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(@PathVariable Long id) {
        return ResponseEntity.ok(contactService.markAsRead(id));
    }

    @PostMapping("/{id}/reply")
    public ResponseEntity<?> replyContact(@PathVariable Long id, @RequestBody ReplyRequest request) {
        try {
            return ResponseEntity.ok(contactService.replyContact(id, request.getReplyContent()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("{\"message\": \"Lỗi khi gửi phản hồi.\"}");
        }
    }

    @Data
    public static class ContactRequest {
        private String name;
        private String email;
        private String content;
    }

    @Data
    public static class ReplyRequest {
        private String replyContent;
    }
}

