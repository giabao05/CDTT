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

    @Query("SELECT new map(p.id as id, p.name as name, c.name as category, p.thumbnail as image, " +
           "SUM(oi.quantity) as sales, SUM(oi.totalPrice) as revenue) " +
           "FROM OrderItem oi " +
           "JOIN oi.variant v " +
           "JOIN v.product p " +
           "LEFT JOIN p.category c " +
           "JOIN oi.order o " +
           "WHERE o.status != 'Cancelled' AND p.isActive = true " +
           "GROUP BY p.id, p.name, c.name, p.thumbnail " +
           "ORDER BY SUM(oi.quantity) DESC")
    java.util.List<java.util.Map<String, Object>> findTopSellingProductsData(org.springframework.data.domain.Pageable pageable);

    @Query("SELECT new map(b.name as name, SUM(oi.totalPrice) as value) " +
           "FROM OrderItem oi " +
           "JOIN oi.variant v " +
           "JOIN v.product p " +
           "JOIN p.brand b " +
           "JOIN oi.order o " +
           "WHERE o.status != 'Cancelled' " +
           "GROUP BY b.name " +
           "ORDER BY SUM(oi.totalPrice) DESC")
    java.util.List<java.util.Map<String, Object>> getBrandShareData();
}
