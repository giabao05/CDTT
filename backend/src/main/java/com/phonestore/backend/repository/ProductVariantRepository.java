package com.phonestore.backend.repository;

import com.phonestore.backend.entity.ProductVariant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductVariantRepository extends JpaRepository<ProductVariant, Long> {
    
    @org.springframework.data.jpa.repository.Query("SELECT COUNT(v) FROM ProductVariant v WHERE v.stockQuantity <= :threshold")
    Long countByStockQuantityLessThanEqual(@org.springframework.data.repository.query.Param("threshold") Integer threshold);
}
