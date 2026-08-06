package com.phonestore.backend.service;

import com.phonestore.backend.entity.Category;
import com.phonestore.backend.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryService {
    private final CategoryRepository repository;
    private final com.phonestore.backend.repository.ProductRepository productRepository;

    public List<Category> getAll() {
        return repository.findAll();
    }

    public Category getById(Long id) {
        return repository.findById(id).orElseThrow(() -> new RuntimeException("Category not found"));
    }

    public Category save(Category category) {
        return repository.save(category);
    }

    public void delete(Long id) {
        if (productRepository.existsByCategoryId(id)) {
            throw new RuntimeException("Không thể xóa danh mục này vì đang có sản phẩm thuộc danh mục!");
        }
        repository.deleteById(id);
    }
}
