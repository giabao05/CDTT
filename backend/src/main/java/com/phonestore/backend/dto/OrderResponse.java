package com.phonestore.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderResponse {
    private String id;
    private String customer;
    private String phone;
    private String email;
    private String address;
    private String date;
    private BigDecimal total;
    private BigDecimal shipping;
    private String payment;
    private String status;
    private List<OrderItemResponse> items;
}
