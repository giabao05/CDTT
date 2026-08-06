package com.phonestore.backend.repository;

import com.phonestore.backend.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    Optional<Order> findByOrderCode(String orderCode);
    List<Order> findByUserEmailOrderByCreatedAtDesc(String email);
    
    @org.springframework.data.jpa.repository.Query("SELECT o.id FROM Order o WHERE o.shippingPhone LIKE CONCAT('%', :query, '%') OR LOWER(o.shippingName) LIKE LOWER(CONCAT('%', :query, '%')) OR o.orderCode LIKE CONCAT('%', :query, '%')")
    List<Long> findOrderIdsBySearchQuery(@org.springframework.data.repository.query.Param("query") String query);
    
    @org.springframework.data.jpa.repository.Query("SELECT SUM(o.totalAmount) FROM Order o WHERE o.status != 'Cancelled'")
    java.math.BigDecimal calculateTotalRevenue();
    
    @org.springframework.data.jpa.repository.Query("SELECT COUNT(o) FROM Order o WHERE o.status != 'Cancelled'")
    Long countTotalOrders();
    
    @org.springframework.data.jpa.repository.Query("SELECT new map(MONTH(o.createdAt) as month, SUM(o.totalAmount) as revenue) " +
           "FROM Order o " +
           "WHERE o.status != 'Cancelled' AND YEAR(o.createdAt) = YEAR(CURRENT_DATE) " +
           "GROUP BY MONTH(o.createdAt) " +
           "ORDER BY MONTH(o.createdAt)")
    List<java.util.Map<String, Object>> getRevenueByMonth();
    
    @org.springframework.data.jpa.repository.Query("SELECT new map(DATE(o.createdAt) as date, SUM(o.totalAmount) as revenue, COUNT(o) as orders) " +
           "FROM Order o " +
           "WHERE o.status != 'Cancelled' AND o.createdAt >= :startDate " +
           "GROUP BY DATE(o.createdAt) " +
           "ORDER BY DATE(o.createdAt)")
    List<java.util.Map<String, Object>> getDailyRevenueAndOrders(@org.springframework.data.repository.query.Param("startDate") java.time.LocalDateTime startDate);
    
    List<Order> findTop5ByOrderByCreatedAtDesc();
}
