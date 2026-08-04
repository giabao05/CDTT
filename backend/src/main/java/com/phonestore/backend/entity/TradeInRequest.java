package com.phonestore.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "trade_in_requests")
public class TradeInRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String customerName;
    private String phone;
    
    private String oldDeviceName;
    private String deviceCondition; // A (Like new), B (Good), C (Scratched)
    
    private BigDecimal estimatedPrice;
    private BigDecimal finalPrice; // Admin sets this after inspection
    
    private Long newProductVariantId;
    
    // Status: PENDING, INSPECTING, ACCEPTED, REJECTED
    private String status;
    
    @Column(name = "request_date")
    private LocalDateTime requestDate;
    
    @PrePersist
    protected void onCreate() {
        requestDate = LocalDateTime.now();
        if (status == null) status = "PENDING";
    }
}
