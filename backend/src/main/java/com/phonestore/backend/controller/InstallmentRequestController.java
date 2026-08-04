package com.phonestore.backend.controller;

import com.phonestore.backend.entity.InstallmentRequest;
import com.phonestore.backend.service.InstallmentRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/installments")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class InstallmentRequestController {
    private final InstallmentRequestService service;

    @GetMapping
    public List<InstallmentRequest> getAll() {
        return service.getAll();
    }

    @GetMapping("/{id}")
    public InstallmentRequest getById(@PathVariable Long id) {
        return service.getById(id);
    }

    @PostMapping
    public InstallmentRequest create(@RequestBody InstallmentRequest entity) {
        return service.save(entity);
    }

    @PutMapping("/{id}")
    public InstallmentRequest update(@PathVariable Long id, @RequestBody InstallmentRequest entity) {
        entity.setId(id);
        return service.save(entity);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
