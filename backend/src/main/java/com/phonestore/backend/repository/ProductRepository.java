package com.phonestore.backend.repository;

import com.phonestore.backend.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    Optional<Product> findBySlug(String slug);
    List<Product> findByIsFeaturedTrueAndIsActiveTrue();
    List<Product> findByIsActiveTrue();
    List<Product> findByCategorySlugAndIsActiveTrue(String categorySlug);
    List<Product> findByBrandSlugAndIsActiveTrue(String brandSlug);
}
