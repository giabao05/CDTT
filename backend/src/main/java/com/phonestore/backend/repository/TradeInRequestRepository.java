package com.phonestore.backend.repository;

import com.phonestore.backend.entity.TradeInRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TradeInRequestRepository extends JpaRepository<TradeInRequest, Long> {
}
