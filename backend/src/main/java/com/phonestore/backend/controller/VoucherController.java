package com.phonestore.backend.controller;

import com.phonestore.backend.entity.Voucher;
import com.phonestore.backend.service.VoucherService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/vouchers")
@RequiredArgsConstructor
public class VoucherController {
    private final VoucherService service;

    @GetMapping
    public List<Voucher> getAll() {
        return service.getAll();
    }

    @GetMapping("/{id}")
    public Voucher getById(@PathVariable Long id) {
        return service.getById(id);
    }

    @PostMapping
    public Voucher create(@RequestBody Voucher voucher) {
        return service.create(voucher);
    }

    @PutMapping("/{id}")
    public Voucher update(@PathVariable Long id, @RequestBody Voucher voucher) {
        return service.update(id, voucher);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
