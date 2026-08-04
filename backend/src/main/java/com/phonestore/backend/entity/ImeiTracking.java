package com.phonestore.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "imei_tracking")
public class ImeiTracking {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "imei_code", unique = true, nullable = false)
    private String imeiCode;
    
    @Column(name = "product_variant_id")
    private Long productVariantId;
    
    // Status: IN_STOCK, SOLD, WARRANTY
    @Column(name = "status")
    private String status;
    
    @Column(name = "order_id")
    private Long orderId;
    
    @Column(name = "import_date")
    private LocalDateTime importDate;
    
    @Column(name = "export_date")
    private LocalDateTime exportDate;
    
    @Column(name = "warranty_end_date")
    private LocalDateTime warrantyEndDate;
    
    @PrePersist
    protected void onCreate() {
        importDate = LocalDateTime.now();
        if (status == null) status = "IN_STOCK";
    }
}
