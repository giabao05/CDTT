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
                
        order = orderRepository.save(order);

        List<OrderItem> items = new ArrayList<>();
        for (OrderItemRequest itemRequest : request.getItems()) {
            ProductVariant variant = productVariantRepository.findById(itemRequest.getVariantId())
                    .orElseThrow(() -> new RuntimeException("Variant not found"));
                    
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
        return mapToResponse(order);
    }

    public List<OrderResponse> getAllOrders() {
        return orderRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
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
                        .build()).collect(Collectors.toList()))
                .build();
    }
}
