package com.phonestore.backend.service;

import com.phonestore.backend.entity.WarrantyRequest;
import com.phonestore.backend.entity.ImeiTracking;
import com.phonestore.backend.repository.WarrantyRequestRepository;
import com.phonestore.backend.repository.ImeiTrackingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class WarrantyRequestService {
    private final WarrantyRequestRepository warrantyRepository;
    private final ImeiTrackingRepository imeiRepository;

    public List<WarrantyRequest> getAll() {
        return warrantyRepository.findAllByOrderByReceivedDateDesc();
    }

    public WarrantyRequest getById(Long id) {
        return warrantyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Warranty request not found"));
    }

    public List<WarrantyRequest> getByImei(String imeiCode) {
        return warrantyRepository.findByImeiCode(imeiCode);
    }

    public WarrantyRequest create(WarrantyRequest request) {
        // Update IMEI status to WARRANTY
        ImeiTracking imei = imeiRepository.findByImeiCode(request.getImeiCode());
        if (imei != null) {
            imei.setStatus("WARRANTY");
            imeiRepository.save(imei);
        }
        return warrantyRepository.save(request);
    }

    public WarrantyRequest updateStatus(Long id, String status, String technicianNote) {
        WarrantyRequest wr = getById(id);
        wr.setStatus(status);
        if (technicianNote != null && !technicianNote.isEmpty()) {
            wr.setTechnicianNote(technicianNote);
        }
        if ("DONE".equals(status) || "REJECTED".equals(status)) {
            wr.setCompletedDate(LocalDateTime.now());
            // Restore IMEI status
            ImeiTracking imei = imeiRepository.findByImeiCode(wr.getImeiCode());
            if (imei != null) {
                imei.setStatus("SOLD");
                imeiRepository.save(imei);
            }
        }
        return warrantyRepository.save(wr);
    }

    public void delete(Long id) {
        warrantyRepository.deleteById(id);
    }

    public List<WarrantyRequest> search(String query) {
        return warrantyRepository
            .findByImeiCodeContainingIgnoreCaseOrCustomerNameContainingIgnoreCaseOrCustomerPhoneContaining(
                query, query, query);
    }
}
