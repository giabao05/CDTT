package com.phonestore.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "product_variants")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductVariant {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Product product;
    
    @Column(unique = true, nullable = false)
    private String sku;
    
    private String color;
    private String storage;
    private String ram;
    private BigDecimal price;
    private Integer stockQuantity;
    @Column(columnDefinition = "MEDIUMTEXT")
    private String imageUrl;
    private Boolean isActive;
    
    @PrePersist
    public void prePersist() {
        if (isActive == null) isActive = true;
        if (stockQuantity == null) stockQuantity = 0;
    }
}
