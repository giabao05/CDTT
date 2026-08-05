package com.phonestore.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "warranty_requests")
public class WarrantyRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "imei_code", nullable = false)
    private String imeiCode;

    @Column(name = "customer_name", nullable = false)
    private String customerName;

    @Column(name = "customer_phone", nullable = false)
    private String customerPhone;

    @Column(name = "customer_email")
    private String customerEmail;

    @Column(name = "order_id")
    private Long orderId;

    @Column(name = "product_name")
    private String productName;

    @Column(name = "issue_description", columnDefinition = "TEXT")
    private String issueDescription;

    // Status: RECEIVED, IN_PROGRESS, DONE, REJECTED
    @Column(name = "status")
    private String status;

    @Column(name = "technician_note", columnDefinition = "TEXT")
    private String technicianNote;

    @Column(name = "received_date")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime receivedDate;

    @Column(name = "completed_date")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime completedDate;

    // Use LocalDate to accept "yyyy-MM-dd" format from frontend
    @Column(name = "warranty_end_date")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate warrantyEndDate;

    @PrePersist
    protected void onCreate() {
        receivedDate = LocalDateTime.now();
        if (status == null) status = "RECEIVED";
    }
}
