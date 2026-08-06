package com.phonestore.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ProductSummaryResponse {
    private Long id;
    private String name;
    private String slug;
    private BigDecimal basePrice;
    private String thumbnail;
    
    private CategoryResponse category;
    private BrandResponse brand;
    
    private Boolean isFeatured;
    private Boolean isActive;
    
    private LocalDateTime createdAt;
    
    private List<ProductVariantResponse> variants;
}
