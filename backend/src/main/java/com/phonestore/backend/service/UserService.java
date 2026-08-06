package com.phonestore.backend.service;

import com.phonestore.backend.entity.Role;
import com.phonestore.backend.entity.User;
import com.phonestore.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository repository;
    private final PasswordEncoder passwordEncoder;

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
    
    public User updateUser(Long id, User updateDetails) {
        User user = getUserById(id);
        if (updateDetails.getName() != null) user.setName(updateDetails.getName());
        if (updateDetails.getPhone() != null) user.setPhone(updateDetails.getPhone());
        if (updateDetails.getAddress() != null) user.setAddress(updateDetails.getAddress());
        return repository.save(user);
    }
    
    public void changePassword(Long id, String oldPassword, String newPassword) {
        User user = getUserById(id);
        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new RuntimeException("Mật khẩu hiện tại không đúng!");
        }
        user.setPassword(passwordEncoder.encode(newPassword));
        repository.save(user);
    }
    
    public void deleteUser(Long id) {
        repository.deleteById(id);
    }
}
