package com.phonestore.backend.repository;

import com.phonestore.backend.entity.Banner;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BannerRepository extends JpaRepository<Banner, Long> {
    java.util.List<Banner> findByLinkUrl(String linkUrl);
    boolean existsBySortOrder(Integer sortOrder);
    boolean existsBySortOrderAndIdNot(Integer sortOrder, Long id);
}
