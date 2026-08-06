package com.phonestore.backend.controller;

import com.phonestore.backend.entity.Category;
import com.phonestore.backend.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/categories")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CategoryController {
    private final CategoryService service;

    @GetMapping
    public List<Category> getAll() {
        return service.getAll();
    }

    @GetMapping("/{id}")
    public Category getById(@PathVariable Long id) {
        return service.getById(id);
    }

    @PostMapping
    public Category create(@RequestBody Category category) {
        return service.save(category);
    }

    @PutMapping("/{id}")
    public Category update(@PathVariable Long id, @RequestBody Category category) {
        // For SystemSetting, ID is string. For others, it's Long. 
        // We just save it assuming the ID in the body is correct or we should set it.
        return service.save(category);
    }

    @DeleteMapping("/{id}")
    public org.springframework.http.ResponseEntity<?> delete(@PathVariable Long id) {
        try {
            service.delete(id);
            return org.springframework.http.ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return org.springframework.http.ResponseEntity
                    .badRequest()
                    .body(java.util.Map.of("message", e.getMessage()));
        }
    }
}
