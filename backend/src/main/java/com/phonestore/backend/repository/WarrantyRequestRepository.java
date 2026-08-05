package com.phonestore.backend.repository;

import com.phonestore.backend.entity.WarrantyRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface WarrantyRequestRepository extends JpaRepository<WarrantyRequest, Long> {
    List<WarrantyRequest> findByImeiCodeContainingIgnoreCaseOrCustomerNameContainingIgnoreCaseOrCustomerPhoneContaining(
        String imei, String name, String phone);
    List<WarrantyRequest> findAllByOrderByReceivedDateDesc();
    List<WarrantyRequest> findByImeiCode(String imeiCode);
}
