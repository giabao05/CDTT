package com.phonestore.backend.service;

import com.phonestore.backend.entity.Banner;
import com.phonestore.backend.repository.BannerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BannerService {
    private final BannerRepository repository;

    public List<Banner> getAll() {
        return repository.findAll();
    }

    public Banner getById(Long id) {
        return repository.findById(id).orElseThrow(() -> new RuntimeException("Banner not found"));
    }

    public Banner create(Banner banner) {
        if (banner.getSortOrder() != null && banner.getSortOrder() < 1) {
            throw new IllegalArgumentException("Thứ tự xuất hiện phải bắt đầu từ số 1.");
        }
        if (banner.getSortOrder() != null && repository.existsBySortOrder(banner.getSortOrder())) {
            throw new IllegalArgumentException("Thứ tự xuất hiện " + banner.getSortOrder() + " đã tồn tại. Không được phép trùng.");
        }
        return repository.save(banner);
    }

    public Banner update(Long id, Banner banner) {
        if (banner.getSortOrder() != null && banner.getSortOrder() < 1) {
            throw new IllegalArgumentException("Thứ tự xuất hiện phải bắt đầu từ số 1.");
        }
        if (banner.getSortOrder() != null && repository.existsBySortOrderAndIdNot(banner.getSortOrder(), id)) {
            throw new IllegalArgumentException("Thứ tự xuất hiện " + banner.getSortOrder() + " đã tồn tại. Không được phép trùng.");
        }
        banner.setId(id);
        return repository.save(banner);
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }
}
