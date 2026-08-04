package com.phonestore.backend.service;

import com.phonestore.backend.entity.Brand;
import com.phonestore.backend.repository.BrandRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BrandService {
    private final BrandRepository repository;

    public List<Brand> getAll() {
        return repository.findAll();
    }

    public Brand getById(Long id) {
        return repository.findById(id).orElseThrow(() -> new RuntimeException("Brand not found"));
    }

    public Brand save(Brand brand) {
        return repository.save(brand);
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }
}
