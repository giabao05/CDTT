package com.phonestore.backend.controller;

import com.phonestore.backend.entity.Role;
import com.phonestore.backend.entity.User;
import com.phonestore.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {
    
    private final UserService service;

    @GetMapping
    public List<User> getAllUsers() {
        return service.getAllUsers();
    }

    @GetMapping("/{id}")
    public User getUserById(@PathVariable Long id) {
        return service.getUserById(id);
    }

    @PutMapping("/{id}/role")
    public User changeRole(@PathVariable Long id, @RequestParam Role role) {
        return service.changeRole(id, role);
    }

    @PutMapping("/{id}")
    public User updateUser(@PathVariable Long id, @RequestBody User updateDetails) {
        return service.updateUser(id, updateDetails);
    }

    @PutMapping("/{id}/password")
    public void changePassword(@PathVariable Long id, @RequestBody java.util.Map<String, String> request) {
        service.changePassword(id, request.get("oldPassword"), request.get("newPassword"));
    }

    @DeleteMapping("/{id}")
    public void deleteUser(@PathVariable Long id) {
        service.deleteUser(id);
    }
}
