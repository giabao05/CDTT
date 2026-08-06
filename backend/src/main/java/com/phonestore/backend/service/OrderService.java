package com.phonestore.backend.service;

import com.phonestore.backend.dto.OrderItemRequest;
import com.phonestore.backend.dto.OrderItemResponse;
import com.phonestore.backend.dto.OrderRequest;
import com.phonestore.backend.dto.OrderResponse;
import com.phonestore.backend.entity.Order;
import com.phonestore.backend.entity.OrderItem;
import com.phonestore.backend.entity.ProductVariant;
import com.phonestore.backend.repository.OrderItemRepository;
import com.phonestore.backend.repository.OrderRepository;
import com.phonestore.backend.repository.ProductVariantRepository;
import com.phonestore.backend.repository.UserRepository;
import com.phonestore.backend.repository.NotificationRepository;
import com.phonestore.backend.entity.User;
import com.phonestore.backend.entity.Notification;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final ProductVariantRepository productVariantRepository;
    private final UserRepository userRepository;
    private final NotificationRepository notificationRepository;
    private final com.phonestore.backend.repository.ImeiTrackingRepository imeiTrackingRepository;

    @Transactional
    public OrderResponse createOrder(OrderRequest request) {
        String orderCode = "ORD-" + System.currentTimeMillis() % 100000000;
        
        Order order = Order.builder()
                .orderCode(orderCode)
                .shippingName(request.getFullName())
                .shippingPhone(request.getPhone())
                .shippingAddress(request.getAddress() + ", " + request.getWard() + ", " + request.getDistrict() + ", " + request.getProvince())
                .paymentMethod(request.getPaymentMethod())
                .status("Pending")
                .paymentStatus("Pending")
                .totalAmount(request.getTotalAmount())
                .discountAmount(request.getDiscountAmount() != null ? request.getDiscountAmount() : BigDecimal.ZERO)
                .build();
                
        if (request.getEmail() != null && !request.getEmail().isEmpty()) {
            User user = userRepository.findByEmail(request.getEmail()).orElse(null);
            order.setUser(user);
        }
                
        order = orderRepository.save(order);

        List<OrderItem> items = new ArrayList<>();
        for (OrderItemRequest itemRequest : request.getItems()) {
            ProductVariant variant = productVariantRepository.findById(itemRequest.getVariantId())
                    .orElseThrow(() -> new RuntimeException("Variant not found for ID: " + itemRequest.getVariantId()));
                    
            OrderItem item = OrderItem.builder()
                    .order(order)
                    .variant(variant)
                    .productName(variant.getProduct().getName())
                    .quantity(itemRequest.getQuantity())
                    .unitPrice(itemRequest.getUnitPrice())
                    .totalPrice(itemRequest.getUnitPrice().multiply(BigDecimal.valueOf(itemRequest.getQuantity())))
                    .build();
            items.add(orderItemRepository.save(item));
        }
        
        order.setItems(items);
        
        // Tạo thông báo cho người dùng
        if (request.getEmail() != null && !request.getEmail().isEmpty()) {
            Notification userNotif = Notification.builder()
                    .recipientEmail(request.getEmail())
                    .title("Đặt hàng thành công")
                    .message("Đơn hàng " + orderCode + " của bạn đã được đặt thành công. Chúng tôi sẽ sớm liên hệ để xác nhận.")
                    .build();
            notificationRepository.save(userNotif);
        }
        
        // Tạo thông báo cho ADMIN
        Notification adminNotif = Notification.builder()
                .recipientEmail("ADMIN")
                .title("Đơn hàng mới")
                .message("Có đơn hàng mới " + orderCode + " trị giá " + request.getTotalAmount() + "đ từ khách hàng " + request.getFullName() + ".")
                .build();
        notificationRepository.save(adminNotif);

        return mapToResponse(order);
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getAllOrders() {
        return orderRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getOrdersByUserEmail(String email) {
        return orderRepository.findByUserEmailOrderByCreatedAtDesc(email).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public OrderResponse updateOrderStatus(String orderCode, String status) {
        Order order = orderRepository.findByOrderCode(orderCode)
                .orElseThrow(() -> new RuntimeException("Order not found: " + orderCode));
        order.setStatus(status);
        if ("Đã giao".equals(status) || "Delivered".equals(status) || "Thành công".equals(status)) {
             order.setPaymentStatus("Paid");
             
             // Assign IMEIs from stock
             for (OrderItem item : order.getItems()) {
                 if (item.getVariant() != null) {
                     List<com.phonestore.backend.entity.ImeiTracking> availableImeis = 
                             imeiTrackingRepository.findByProductVariantIdAndStatus(item.getVariant().getId(), "IN_STOCK");
                     int assignedCount = 0;
                     for (com.phonestore.backend.entity.ImeiTracking imei : availableImeis) {
                         if (assignedCount >= item.getQuantity()) break;
                         imei.setStatus("SOLD");
                         imei.setOrderId(order.getId());
                         imei.setExportDate(java.time.LocalDateTime.now());
                         imei.setWarrantyEndDate(java.time.LocalDateTime.now().plusMonths(12));
                         imeiTrackingRepository.save(imei);
                         assignedCount++;
                     }
                     // Auto-generate for the remaining quantity
                     while (assignedCount < item.getQuantity()) {
                         String generatedImei = "35" + String.format("%06d", (int)(Math.random() * 1000000)) + String.format("%07d", (int)(Math.random() * 10000000));
                         com.phonestore.backend.entity.ImeiTracking newImei = new com.phonestore.backend.entity.ImeiTracking();
                         newImei.setImeiCode(generatedImei);
                         newImei.setProductVariantId(item.getVariant().getId());
                         newImei.setStatus("SOLD");
                         newImei.setOrderId(order.getId());
                         newImei.setImportDate(java.time.LocalDateTime.now());
                         newImei.setExportDate(java.time.LocalDateTime.now());
                         newImei.setWarrantyEndDate(java.time.LocalDateTime.now().plusMonths(12));
                         imeiTrackingRepository.save(newImei);
                         assignedCount++;
                     }
                 }
             }
        }
        order = orderRepository.save(order);
        
        if (order.getUser() != null && order.getUser().getEmail() != null) {
            Notification userNotif = Notification.builder()
                    .recipientEmail(order.getUser().getEmail())
                    .title("Cập nhật đơn hàng")
                    .message("Đơn hàng " + orderCode + " của bạn đã được cập nhật sang trạng thái: " + status)
                    .build();
            notificationRepository.save(userNotif);
        }
        
        return mapToResponse(order);
    }

    private OrderResponse mapToResponse(Order order) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
        String date = order.getCreatedAt() != null ? order.getCreatedAt().format(formatter) : "";
        
        // Mock shipping calculation based on the request (since backend doesn't store shipping fee directly yet, we can calculate total - items_total or just return 0)
        BigDecimal itemsTotal = order.getItems().stream()
                .map(OrderItem::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal shipping = order.getTotalAmount() != null ? order.getTotalAmount().subtract(itemsTotal).add(order.getDiscountAmount() != null ? order.getDiscountAmount() : BigDecimal.ZERO) : BigDecimal.ZERO;
        if (shipping.compareTo(BigDecimal.ZERO) < 0) shipping = BigDecimal.ZERO;

        return OrderResponse.builder()
                .id(order.getOrderCode())
                .customer(order.getShippingName())
                .phone(order.getShippingPhone())
                .email("") // Currently email is not stored in orders table
                .address(order.getShippingAddress())
                .date(date)
                .total(order.getTotalAmount() != null ? order.getTotalAmount() : BigDecimal.ZERO)
                .shipping(shipping)
                .payment(order.getPaymentMethod())
                .status(order.getStatus())
                .items(order.getItems().stream().map(item -> OrderItemResponse.builder()
                        .name(item.getProductName())
                        .qty(item.getQuantity())
                        .price(item.getUnitPrice())
                        .slug(item.getVariant() != null && item.getVariant().getProduct() != null ? item.getVariant().getProduct().getSlug() : null)
                        .productId(item.getVariant() != null && item.getVariant().getProduct() != null ? item.getVariant().getProduct().getId() : null)
                        .build()).collect(Collectors.toList()))
                .build();
    }
}
