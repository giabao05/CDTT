package com.phonestore.backend.service;

import com.phonestore.backend.entity.TradeInRequest;
import com.phonestore.backend.repository.TradeInRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TradeInRequestService {
    private final TradeInRequestRepository repository;

    public List<TradeInRequest> getAll() {
        return repository.findAll();
    }

    public TradeInRequest getById(Long id) {
        return repository.findById(id).orElseThrow(() -> new RuntimeException("Not found"));
    }

    public TradeInRequest save(TradeInRequest entity) {
        return repository.save(entity);
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }
}
