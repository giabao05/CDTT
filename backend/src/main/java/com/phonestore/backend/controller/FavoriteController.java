package com.phonestore.backend.controller;

import com.phonestore.backend.entity.Favorite;
import com.phonestore.backend.entity.Product;
import com.phonestore.backend.repository.FavoriteRepository;
import com.phonestore.backend.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/favorites")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class FavoriteController {

    private final FavoriteRepository favoriteRepository;
    private final ProductRepository productRepository;

    @GetMapping("/{email}")
    public ResponseEntity<?> getFavoritesByUser(@PathVariable String email) {
        List<Map<String, Object>> result = favoriteRepository.findByUserEmailOrderByCreatedAtDesc(email).stream().map(fav -> {
            Product p = fav.getProduct();
            return Map.of(
                "id", fav.getId(),
                "userEmail", fav.getUserEmail(),
                "product", Map.of(
                    "id", p.getId(),
                    "name", p.getName(),
                    "thumbnail", p.getThumbnail() != null ? p.getThumbnail() : "",
                    "basePrice", p.getBasePrice() != null ? p.getBasePrice() : 0,
                    "slug", p.getSlug()
                )
            );
        }).toList();
        return ResponseEntity.ok(result);
    }

    @PostMapping
    public ResponseEntity<?> addFavorite(@RequestBody Map<String, Object> payload) {
        String email = (String) payload.get("email");
        Long productId = Long.valueOf(payload.get("productId").toString());

        if (favoriteRepository.existsByUserEmailAndProductId(email, productId)) {
            return ResponseEntity.badRequest().body("Sản phẩm đã có trong danh sách yêu thích");
        }

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm"));

        Favorite favorite = Favorite.builder()
                .userEmail(email)
                .product(product)
                .build();

        favorite = favoriteRepository.save(favorite);
        return ResponseEntity.ok(Map.of("id", favorite.getId(), "message", "Success"));
    }

    @DeleteMapping("/{email}/{productId}")
    public ResponseEntity<?> removeFavorite(@PathVariable String email, @PathVariable Long productId) {
        favoriteRepository.findByUserEmailAndProductId(email, productId)
                .ifPresent(favoriteRepository::delete);
        return ResponseEntity.ok().build();
    }
}
