package com.phonestore.backend.service;

import com.phonestore.backend.entity.ImeiTracking;
import com.phonestore.backend.repository.ImeiTrackingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ImeiTrackingService {
    private final ImeiTrackingRepository repository;

    public List<ImeiTracking> getAll() {
        return repository.findAll();
    }

    public ImeiTracking getById(Long id) {
        return repository.findById(id).orElseThrow(() -> new RuntimeException("ImeiTracking not found"));
    }
    
    public ImeiTracking getByImei(String imeiCode) {
        return repository.findByImeiCode(imeiCode);
    }

    public ImeiTracking save(ImeiTracking imeiTracking) {
        return repository.save(imeiTracking);
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }
}
