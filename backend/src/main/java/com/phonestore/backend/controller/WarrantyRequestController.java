package com.phonestore.backend.controller;

import com.phonestore.backend.entity.WarrantyRequest;
import com.phonestore.backend.service.WarrantyRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/warranty")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class WarrantyRequestController {
    private final WarrantyRequestService service;

    @GetMapping
    public List<WarrantyRequest> getAll() {
        return service.getAll();
    }

    @GetMapping("/{id}")
    public WarrantyRequest getById(@PathVariable Long id) {
        return service.getById(id);
    }

    @GetMapping("/imei/{imeiCode}")
    public List<WarrantyRequest> getByImei(@PathVariable String imeiCode) {
        return service.getByImei(imeiCode);
    }

    @GetMapping("/search")
    public List<WarrantyRequest> search(@RequestParam String q) {
        return service.search(q);
    }

    @PostMapping
    public WarrantyRequest create(@RequestBody WarrantyRequest request) {
        return service.create(request);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<WarrantyRequest> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        String status = body.get("status");
        String note = body.get("technicianNote");
        return ResponseEntity.ok(service.updateStatus(id, status, note));
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
