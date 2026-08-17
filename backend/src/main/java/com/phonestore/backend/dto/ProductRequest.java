package com.phonestore.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ProductRequest {
    private String name;
    private String description;
    private BigDecimal basePrice;
    private BigDecimal salePrice;
    private String thumbnail;
    private String category; // category name or slug
    private String brand;    // brand name or slug
    private Boolean isFeatured;
    private Boolean isActive;
    
    private ProductSpecificationRequest specification;
    private List<ProductVariantRequest> variants;
    private List<ProductImageRequest> images;
}
