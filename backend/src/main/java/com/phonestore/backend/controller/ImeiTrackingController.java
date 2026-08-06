package com.phonestore.backend.controller;

import com.phonestore.backend.entity.ImeiTracking;
import com.phonestore.backend.service.ImeiTrackingService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/imeis")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ImeiTrackingController {
    private final ImeiTrackingService service;

    @GetMapping
    public List<ImeiTracking> getAll() {
        return service.getAll();
    }

    @GetMapping("/{id}")
    public ImeiTracking getById(@PathVariable Long id) {
        return service.getById(id);
    }
    
    @GetMapping("/search/{imeiCode}")
    public ImeiTracking getByImei(@PathVariable String imeiCode) {
        return service.getByImei(imeiCode);
    }
    
    @GetMapping("/advanced-search")
    public List<java.util.Map<String, Object>> advancedSearch(@RequestParam String q) {
        return service.advancedSearch(q);
    }
    
    @GetMapping("/check/{imeiCode}")
    public java.util.Map<String, Object> checkImei(@PathVariable String imeiCode) {
        return service.checkImeiDetails(imeiCode);
    }

    @PostMapping
    public ImeiTracking create(@RequestBody ImeiTracking imeiTracking) {
        return service.save(imeiTracking);
    }

    @PutMapping("/{id}")
    public ImeiTracking update(@PathVariable Long id, @RequestBody ImeiTracking imeiTracking) {
        imeiTracking.setId(id);
        return service.save(imeiTracking);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
