package com.phonestore.backend.repository;

import com.phonestore.backend.entity.ImeiTracking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ImeiTrackingRepository extends JpaRepository<ImeiTracking, Long> {
    ImeiTracking findByImeiCode(String imeiCode);
    List<ImeiTracking> findByProductVariantId(Long variantId);
    List<ImeiTracking> findByOrderId(Long orderId);
}
