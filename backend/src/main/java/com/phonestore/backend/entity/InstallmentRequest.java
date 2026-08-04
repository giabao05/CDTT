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
@Table(name = "installment_requests")
public class InstallmentRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String customerName;
    private String phone;
    private String identityCard;
    
    private Long productVariantId;
    
    private BigDecimal upfrontPayment;
    private Integer months;
    private Double interestRate;
    
    // Status: PENDING, APPROVED, REJECTED, COMPLETED
    private String status;
    
    @Column(name = "request_date")
    private LocalDateTime requestDate;
    
    @PrePersist
    protected void onCreate() {
        requestDate = LocalDateTime.now();
        if (status == null) status = "PENDING";
    }
}
