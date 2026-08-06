package com.phonestore.backend.controller;

import com.phonestore.backend.entity.Product;
import com.phonestore.backend.repository.OrderRepository;
import com.phonestore.backend.repository.UserRepository;
import com.phonestore.backend.repository.ProductRepository;
import com.phonestore.backend.repository.OrderItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.HashMap;
import java.util.List;
import java.util.ArrayList;
import java.util.Arrays;
import java.math.BigDecimal;

@RestController
@RequestMapping("/api/v1/analytics")
@CrossOrigin(origins = "*")
public class AnalyticsController {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private ProductRepository productRepository;
    
    @Autowired
    private OrderItemRepository orderItemRepository;

    @GetMapping("/summary")
    public Map<String, Object> getSummary() {
        Map<String, Object> summary = new HashMap<>();
        
        BigDecimal totalRevenue = orderRepository.calculateTotalRevenue();
        summary.put("totalRevenue", totalRevenue != null ? totalRevenue : BigDecimal.ZERO);
        
        summary.put("totalOrders", orderRepository.countTotalOrders());
        summary.put("totalCustomers", userRepository.count());
        summary.put("revenueGrowth", 12.5); // Hardcoded growth for now as it requires complex historical queries
        
        return summary;
    }

    @GetMapping("/revenue-chart")
    public List<Map<String, Object>> getRevenueChart() {
        List<Map<String, Object>> rawData = orderRepository.getRevenueByMonth();
        List<Map<String, Object>> formattedData = new ArrayList<>();
        
        String[] monthNames = {"Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"};
        
        // If DB has no data, return empty or dummy structure, but let's parse rawData
        for (Map<String, Object> row : rawData) {
            Map<String, Object> formattedRow = new HashMap<>();
            Integer monthIndex = (Integer) row.get("month");
            formattedRow.put("month", monthIndex != null && monthIndex >= 1 && monthIndex <= 12 ? monthNames[monthIndex - 1] : "Unknown");
            formattedRow.put("revenue", row.get("revenue"));
            formattedData.add(formattedRow);
        }
        
        if (formattedData.isEmpty()) {
            return Arrays.asList(
                Map.of("month", "Jan", "revenue", 0),
                Map.of("month", "Feb", "revenue", 0)
            );
        }
        
        return formattedData;
    }
    
    @GetMapping("/top-products")
    public List<Map<String, Object>> getTopProducts() {
        return orderItemRepository.findTopSellingProductsData(PageRequest.of(0, 5));
    }

    @Autowired
    private com.phonestore.backend.repository.ProductVariantRepository productVariantRepository;

    @GetMapping("/dashboard")
    public Map<String, Object> getDashboardData() {
        Map<String, Object> response = new HashMap<>();

        // 1. KPIs
        Map<String, Object> kpis = new HashMap<>();
        BigDecimal totalRevenue = orderRepository.calculateTotalRevenue();
        kpis.put("totalRevenue", totalRevenue != null ? totalRevenue : BigDecimal.ZERO);
        kpis.put("totalOrders", orderRepository.countTotalOrders());
        kpis.put("totalCustomers", userRepository.count());
        kpis.put("lowStock", productVariantRepository.countByStockQuantityLessThanEqual(5)); // threshold = 5
        response.put("kpis", kpis);

        // 2. Revenue Chart Data (Last 14 Days)
        java.time.LocalDateTime startDate = java.time.LocalDateTime.now().minusDays(14);
        List<Map<String, Object>> rawDailyData = orderRepository.getDailyRevenueAndOrders(startDate);
        
        // Format daily data (fill missing days with 0 could be done here or frontend, let's just send what we have for now, 
        // ideally we would fill it, but for simplicity let's just format the date string)
        List<Map<String, Object>> revenueData = new ArrayList<>();
        for (Map<String, Object> row : rawDailyData) {
            Map<String, Object> formattedRow = new HashMap<>(row);
            java.sql.Date date = (java.sql.Date) row.get("date");
            if (date != null) {
                formattedRow.put("date", date.toLocalDate().format(java.time.format.DateTimeFormatter.ofPattern("dd/MM")));
            }
            revenueData.add(formattedRow);
        }
        response.put("revenueData", revenueData);

        // 3. Brand Share Data
        response.put("brandShareData", orderItemRepository.getBrandShareData());

        // 4. Recent Orders
        List<com.phonestore.backend.entity.Order> recentOrdersList = orderRepository.findTop5ByOrderByCreatedAtDesc();
        List<Map<String, Object>> recentOrders = new ArrayList<>();
        for (com.phonestore.backend.entity.Order o : recentOrdersList) {
            Map<String, Object> orderMap = new HashMap<>();
            orderMap.put("id", o.getOrderCode() != null ? o.getOrderCode() : "ORD" + o.getId());
            
            String customer = "Guest";
            if (o.getShippingName() != null && !o.getShippingName().isEmpty()) {
                customer = o.getShippingName();
            } else if (o.getUser() != null && o.getUser().getEmail() != null) {
                customer = o.getUser().getEmail();
            }
            orderMap.put("customer", customer);
            
            orderMap.put("date", o.getCreatedAt().format(java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")));
            orderMap.put("total", o.getTotalAmount());
            orderMap.put("status", o.getStatus());
            recentOrders.add(orderMap);
        }
        response.put("recentOrders", recentOrders);

        return response;
    }
}
