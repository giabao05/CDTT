package com.phonestore.backend.controller;

import com.phonestore.backend.entity.Review;
import com.phonestore.backend.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/reviews")
@RequiredArgsConstructor
public class ReviewController {
    private final ReviewService service;

    @GetMapping
    public List<Review> getAll() {
        return service.getAll();
    }

    @GetMapping("/{id}")
    public Review getById(@PathVariable Long id) {
        return service.getById(id);
    }

    @GetMapping("/product/{productId}")
    public List<Review> getByProductId(@PathVariable Long productId) {
        return service.getByProductId(productId);
    }

    @PostMapping
    public Review create(@RequestBody Review review) {
        return service.create(review);
    }

    @PutMapping("/{id}")
    public Review update(@PathVariable Long id, @RequestBody Review review) {
        return service.update(id, review);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
