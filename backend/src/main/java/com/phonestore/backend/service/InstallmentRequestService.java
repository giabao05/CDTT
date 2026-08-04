package com.phonestore.backend.service;

import com.phonestore.backend.entity.InstallmentRequest;
import com.phonestore.backend.repository.InstallmentRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class InstallmentRequestService {
    private final InstallmentRequestRepository repository;

    public List<InstallmentRequest> getAll() {
        return repository.findAll();
    }

    public InstallmentRequest getById(Long id) {
        return repository.findById(id).orElseThrow(() -> new RuntimeException("Not found"));
    }

    public InstallmentRequest save(InstallmentRequest entity) {
        return repository.save(entity);
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }
}
