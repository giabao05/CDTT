package com.phonestore.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ProductSpecificationRequest {
    private String screenSize;
    private String os;
    private String processor;
    private String mainCamera;
    private String selfieCamera;
    private String battery;
    private String sim;
}
