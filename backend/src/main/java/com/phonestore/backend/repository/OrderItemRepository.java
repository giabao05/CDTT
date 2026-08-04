package com.phonestore.backend.repository;

import com.phonestore.backend.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

    @Modifying
    @Query("UPDATE OrderItem oi SET oi.variant = null WHERE oi.variant.id IN " +
           "(SELECT v.id FROM ProductVariant v WHERE v.product.id = :productId)")
    void nullifyVariantsByProductId(@Param("productId") Long productId);
}
