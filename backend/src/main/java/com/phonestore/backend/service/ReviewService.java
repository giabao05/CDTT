package com.phonestore.backend.service;

import com.phonestore.backend.entity.Review;
import com.phonestore.backend.repository.ReviewRepository;
import com.phonestore.backend.repository.NotificationRepository;
import com.phonestore.backend.repository.UserRepository;
import com.phonestore.backend.entity.Notification;
import com.phonestore.backend.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReviewService {
    private final ReviewRepository repository;
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public List<Review> getAll() {
        return repository.findAll();
    }

    public Review getById(Long id) {
        return repository.findById(id).orElseThrow(() -> new RuntimeException("Review not found"));
    }

    public List<Review> getByProductId(Long productId) {
        List<Review> reviews = repository.findByProductId(productId);
        reviews.forEach(review -> {
            if (review.getUserId() != null) {
                userRepository.findById(review.getUserId()).ifPresent(user -> {
                    review.setAuthorName(user.getName() != null && !user.getName().isEmpty() ? user.getName() : user.getEmail());
                    review.setAuthorAvatar(user.getAvatar());
                });
            }
        });
        return reviews;
    }

    public Review create(Review review) {
        Review saved = repository.save(review);
        Notification adminNotif = Notification.builder()
                .recipientEmail("ADMIN")
                .title("Đánh giá mới")
                .message("Có đánh giá mới " + saved.getRating() + " sao từ khách hàng cho sản phẩm ID " + saved.getProductId() + ".")
                .build();
        notificationRepository.save(adminNotif);
        return saved;
    }

    public Review update(Long id, Review review) {
        review.setId(id);
        return repository.save(review);
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }
}
