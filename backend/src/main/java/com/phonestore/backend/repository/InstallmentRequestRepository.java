package com.phonestore.backend.repository;

import com.phonestore.backend.entity.InstallmentRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InstallmentRequestRepository extends JpaRepository<InstallmentRequest, Long> {
}
