package com.phonestore.backend.service;

import com.phonestore.backend.entity.Banner;
import com.phonestore.backend.repository.BannerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BannerService {
    private final BannerRepository repository;

    public List<Banner> getAll() {
        return repository.findAll();
    }

    public Banner getById(Long id) {
        return repository.findById(id).orElseThrow(() -> new RuntimeException("Banner not found"));
    }

    public Banner create(Banner banner) {
        return repository.save(banner);
    }

    public Banner update(Long id, Banner banner) {
        banner.setId(id);
        return repository.save(banner);
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }
}
