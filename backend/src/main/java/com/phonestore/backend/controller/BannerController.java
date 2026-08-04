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
    public Banner getById(@PathVariable Long id) {
        return service.getById(id);
    }

    @PostMapping
    public Banner create(@RequestBody Banner banner) {
        return service.create(banner);
    }

    @PutMapping("/{id}")
    public Banner update(@PathVariable Long id, @RequestBody Banner banner) {
        return service.update(id, banner);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
