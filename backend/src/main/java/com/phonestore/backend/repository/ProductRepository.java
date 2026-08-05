package com.phonestore.backend.repository;

import com.phonestore.backend.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.domain.Pageable;
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
    
    @Query("SELECT p FROM OrderItem oi JOIN oi.variant v JOIN v.product p JOIN oi.order o " +
           "WHERE o.status != 'Cancelled' " +
           "AND p.isActive = true " +
           "GROUP BY p " +
           "ORDER BY SUM(oi.quantity) DESC")
    List<Product> findTopSellingProducts(Pageable pageable);
}
