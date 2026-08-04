package com.phonestore.backend.service;

import com.phonestore.backend.entity.Voucher;
import com.phonestore.backend.repository.VoucherRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class VoucherService {
    private final VoucherRepository repository;

    public List<Voucher> getAll() {
        return repository.findAll();
    }

    public Voucher getById(Long id) {
        return repository.findById(id).orElseThrow(() -> new RuntimeException("Voucher not found"));
    }

    public Voucher create(Voucher voucher) {
        return repository.save(voucher);
    }

    public Voucher update(Long id, Voucher voucher) {
        voucher.setId(id);
        return repository.save(voucher);
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }
}
