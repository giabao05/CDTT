package com.phonestore.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ProductImageRequest {
    private String imageUrl;
    private Boolean isThumbnail;
    private Integer sortOrder;
}
