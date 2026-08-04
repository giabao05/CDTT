package com.phonestore.backend.controller;

import com.phonestore.backend.entity.SystemSetting;
import com.phonestore.backend.service.SystemSettingService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/systemsettings")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SystemSettingController {
    private final SystemSettingService service;

    @GetMapping
    public List<SystemSetting> getAll() {
        return service.getAll();
    }

    @GetMapping("/{id}")
    public SystemSetting getById(@PathVariable String id) {
        return service.getById(id);
    }

    @PostMapping
    public SystemSetting create(@RequestBody SystemSetting systemsetting) {
        return service.save(systemsetting);
    }

    @PutMapping("/{id}")
    public SystemSetting update(@PathVariable String id, @RequestBody SystemSetting systemsetting) {
        // For SystemSetting, ID is string. For others, it's Long. 
        // We just save it assuming the ID in the body is correct or we should set it.
        return service.save(systemsetting);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable String id) {
        service.delete(id);
    }
}
