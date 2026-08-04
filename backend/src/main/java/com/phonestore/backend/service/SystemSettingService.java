package com.phonestore.backend.service;

import com.phonestore.backend.entity.SystemSetting;
import com.phonestore.backend.repository.SystemSettingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SystemSettingService {
    private final SystemSettingRepository repository;

    public List<SystemSetting> getAll() {
        return repository.findAll();
    }

    public SystemSetting getById(String id) {
        return repository.findById(id).orElseThrow(() -> new RuntimeException("SystemSetting not found"));
    }

    public SystemSetting save(SystemSetting systemsetting) {
        return repository.save(systemsetting);
    }

    public void delete(String id) {
        repository.deleteById(id);
    }
}
