package com.phonestore.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "product_images")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductImage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Product product;
    
    @Column(nullable = false, columnDefinition = "MEDIUMTEXT")
    private String imageUrl;
    
    private Boolean isThumbnail;
    
    private Integer sortOrder;
    
    @PrePersist
    public void prePersist() {
        if (isThumbnail == null) isThumbnail = false;
        if (sortOrder == null) sortOrder = 0;
    }
}
