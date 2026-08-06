package com.phonestore.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ProductVariantResponse {
    private Long id;
    private String sku;
    private String color;
    private String storage;
    private String ram;
    private BigDecimal price;
    private Integer stockQuantity;
    private String imageUrl;
    private Boolean isActive;
}
