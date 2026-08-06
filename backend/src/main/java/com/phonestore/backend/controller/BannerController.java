package com.phonestore.backend.controller;

import com.phonestore.backend.entity.Banner;
import com.phonestore.backend.service.BannerService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/banners")
@RequiredArgsConstructor
public class BannerController {
    private final BannerService service;

    @GetMapping
    public List<Banner> getAll() {
        return service.getAll();
    }

    @GetMapping("/{id}")
    public Banner getById(@PathVariable("id") Long id) {
        return service.getById(id);
    }

    @PostMapping
    public org.springframework.http.ResponseEntity<?> create(@RequestBody Banner banner) {
        try {
            return org.springframework.http.ResponseEntity.ok(service.create(banner));
        } catch (IllegalArgumentException e) {
            return org.springframework.http.ResponseEntity.badRequest().body(java.util.Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public org.springframework.http.ResponseEntity<?> update(@PathVariable("id") Long id, @RequestBody Banner banner) {
        try {
            return org.springframework.http.ResponseEntity.ok(service.update(id, banner));
        } catch (IllegalArgumentException e) {
            return org.springframework.http.ResponseEntity.badRequest().body(java.util.Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable("id") Long id) {
        service.delete(id);
    }
}
