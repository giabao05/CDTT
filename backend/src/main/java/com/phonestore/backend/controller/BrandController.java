package com.phonestore.backend.controller;

import com.phonestore.backend.entity.Brand;
import com.phonestore.backend.service.BrandService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/brands")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class BrandController {
    private final BrandService service;

    @GetMapping
    public List<Brand> getAll() {
        return service.getAll();
    }

    @GetMapping("/{id}")
    public Brand getById(@PathVariable Long id) {
        return service.getById(id);
    }

    @PostMapping
    public Brand create(@RequestBody Brand brand) {
        return service.save(brand);
    }

    @PutMapping("/{id}")
    public Brand update(@PathVariable Long id, @RequestBody Brand brand) {
        // For SystemSetting, ID is string. For others, it's Long. 
        // We just save it assuming the ID in the body is correct or we should set it.
        return service.save(brand);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
