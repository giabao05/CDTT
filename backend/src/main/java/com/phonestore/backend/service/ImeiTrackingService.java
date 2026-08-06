package com.phonestore.backend.service;

import com.phonestore.backend.entity.ImeiTracking;
import com.phonestore.backend.repository.ImeiTrackingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ImeiTrackingService {
    private final ImeiTrackingRepository repository;
    private final com.phonestore.backend.repository.OrderRepository orderRepository;
    private final com.phonestore.backend.repository.ProductVariantRepository productVariantRepository;

    public List<ImeiTracking> getAll() {
        return repository.findAll();
    }

    public ImeiTracking getById(Long id) {
        return repository.findById(id).orElseThrow(() -> new RuntimeException("ImeiTracking not found"));
    }
    
    public ImeiTracking getByImei(String imeiCode) {
        return repository.findByImeiCode(imeiCode);
    }

    public ImeiTracking save(ImeiTracking imeiTracking) {
        return repository.save(imeiTracking);
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }
    
    public java.util.Map<String, Object> checkImeiDetails(String imeiCode) {
        ImeiTracking imei = repository.findByImeiCode(imeiCode);
        if (imei == null) {
            throw new RuntimeException("IMEI not found");
        }
        return mapImeiToDetails(imei);
    }
    
    public List<java.util.Map<String, Object>> advancedSearch(String query) {
        List<ImeiTracking> imeis = new java.util.ArrayList<>();
        
        // 1. Search by IMEI
        ImeiTracking byImei = repository.findByImeiCode(query);
        if (byImei != null) imeis.add(byImei);
        
        // 2. Search orders by phone, name, code
        List<Long> orderIds = orderRepository.findOrderIdsBySearchQuery(query);
        if (orderIds != null && !orderIds.isEmpty()) {
            List<ImeiTracking> byOrders = repository.findByOrderIdIn(orderIds);
            for (ImeiTracking i : byOrders) {
                if (byImei == null || !byImei.getId().equals(i.getId())) {
                    imeis.add(i);
                }
            }
        }
        
        return imeis.stream().map(this::mapImeiToDetails).collect(java.util.stream.Collectors.toList());
    }
    
    private java.util.Map<String, Object> mapImeiToDetails(ImeiTracking imei) {
        java.util.Map<String, Object> result = new java.util.HashMap<>();
        result.put("id", imei.getId());
        result.put("imeiCode", imei.getImeiCode());
        result.put("imei", imei.getImeiCode()); // for backward compatibility in checkImeiDetails
        result.put("status", imei.getStatus());
        result.put("importDate", imei.getImportDate());
        if (imei.getWarrantyEndDate() != null) {
            result.put("warrantyEndDate", imei.getWarrantyEndDate().toLocalDate().toString());
        }
        
        if (imei.getProductVariantId() != null) {
            result.put("productVariantId", imei.getProductVariantId());
            productVariantRepository.findById(imei.getProductVariantId()).ifPresent(v -> {
                result.put("productName", v.getProduct().getName());
            });
        }
        
        if (imei.getOrderId() != null) {
            result.put("orderId", imei.getOrderId());
            orderRepository.findById(imei.getOrderId()).ifPresent(o -> {
                result.put("orderCode", o.getOrderCode());
                result.put("customerName", o.getShippingName());
                result.put("customerPhone", o.getShippingPhone());
                if (o.getUser() != null) {
                    result.put("customerEmail", o.getUser().getEmail());
                }
            });
        }
        return result;
    }
}
