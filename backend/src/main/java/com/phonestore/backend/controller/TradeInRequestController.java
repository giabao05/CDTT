package com.phonestore.backend.controller;

import com.phonestore.backend.entity.TradeInRequest;
import com.phonestore.backend.service.TradeInRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/trade-ins")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class TradeInRequestController {
    private final TradeInRequestService service;

    @GetMapping
    public List<TradeInRequest> getAll() {
        return service.getAll();
    }

    @GetMapping("/{id}")
    public TradeInRequest getById(@PathVariable Long id) {
        return service.getById(id);
    }

    @PostMapping
    public TradeInRequest create(@RequestBody TradeInRequest entity) {
        return service.save(entity);
    }

    @PutMapping("/{id}")
    public TradeInRequest update(@PathVariable Long id, @RequestBody TradeInRequest entity) {
        entity.setId(id);
        return service.save(entity);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
