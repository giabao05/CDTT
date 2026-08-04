package com.phonestore.backend.service;

import com.phonestore.backend.entity.Role;
import com.phonestore.backend.entity.User;
import com.phonestore.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository repository;

    public List<User> getAllUsers() {
        return repository.findAll();
    }

    public User getUserById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public User changeRole(Long id, Role newRole) {
        User user = getUserById(id);
        user.setRole(newRole);
        return repository.save(user);
    }
    
    public void deleteUser(Long id) {
        repository.deleteById(id);
    }
}
