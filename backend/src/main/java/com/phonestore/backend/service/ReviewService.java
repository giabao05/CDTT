package com.phonestore.backend.service;

import com.phonestore.backend.entity.Review;
import com.phonestore.backend.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReviewService {
    private final ReviewRepository repository;

    public List<Review> getAll() {
        return repository.findAll();
    }

    public Review getById(Long id) {
        return repository.findById(id).orElseThrow(() -> new RuntimeException("Review not found"));
    }

    public List<Review> getByProductId(Long productId) {
        return repository.findByProductId(productId);
    }

    public Review create(Review review) {
        return repository.save(review);
    }

    public Review update(Long id, Review review) {
        review.setId(id);
        return repository.save(review);
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }
}
