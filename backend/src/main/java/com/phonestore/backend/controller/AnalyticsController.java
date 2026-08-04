package com.phonestore.backend.controller;

import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.HashMap;
import java.util.List;
import java.util.Arrays;

@RestController
@RequestMapping("/api/v1/analytics")
@CrossOrigin(origins = "*")
public class AnalyticsController {

    @GetMapping("/summary")
    public Map<String, Object> getSummary() {
        Map<String, Object> summary = new HashMap<>();
        summary.put("totalRevenue", 1250000000);
        summary.put("totalOrders", 342);
        summary.put("totalCustomers", 156);
        summary.put("revenueGrowth", 12.5); // %
        return summary;
    }

    @GetMapping("/revenue-chart")
    public List<Map<String, Object>> getRevenueChart() {
        return Arrays.asList(
            Map.of("month", "Jan", "revenue", 50000000),
            Map.of("month", "Feb", "revenue", 70000000),
            Map.of("month", "Mar", "revenue", 65000000),
            Map.of("month", "Apr", "revenue", 90000000),
            Map.of("month", "May", "revenue", 120000000),
            Map.of("month", "Jun", "revenue", 150000000)
        );
    }
}
