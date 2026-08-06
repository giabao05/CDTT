package com.phonestore.backend.controller;

import com.phonestore.backend.dto.ProductRequest;
import com.phonestore.backend.dto.ProductResponse;
import com.phonestore.backend.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/products")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ProductController {

    private final ProductService productService;

    @GetMapping
    public ResponseEntity<org.springframework.data.domain.Page<com.phonestore.backend.dto.ProductSummaryResponse>> getAllProducts(
            @RequestParam(name = "category", required = false) String category,
            @RequestParam(name = "brand", required = false) String brand,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "10") int size,
            @RequestParam(name = "sort", defaultValue = "createdAt,desc") String[] sort) {
        String sortBy = "createdAt";
        String sortDir = "desc";
        if (sort != null && sort.length > 0) {
            if (sort[0].contains(",")) {
                String[] parts = sort[0].split(",");
                sortBy = parts[0];
                sortDir = parts.length > 1 ? parts[1] : "desc";
            } else {
                sortBy = sort[0];
                sortDir = sort.length > 1 ? sort[1] : "desc";
            }
        }
        
        org.springframework.data.domain.Sort.Direction direction = sortDir.equalsIgnoreCase("desc") ? 
            org.springframework.data.domain.Sort.Direction.DESC : org.springframework.data.domain.Sort.Direction.ASC;
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size, org.springframework.data.domain.Sort.by(direction, sortBy));

        if (category != null) {
            return ResponseEntity.ok(productService.getProductsByCategoryPaginated(category, pageable));
        } else if (brand != null) {
            return ResponseEntity.ok(productService.getProductsByBrandPaginated(brand, pageable));
        }
        return ResponseEntity.ok(productService.getAllActiveProductsPaginated(pageable));
    }

    @PostMapping
    public ResponseEntity<ProductResponse> createProduct(@RequestBody ProductRequest request) {
        return ResponseEntity.ok(productService.createProduct(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductResponse> updateProduct(@PathVariable("id") Long id, @RequestBody ProductRequest request) {
        return ResponseEntity.ok(productService.updateProduct(id, request));
    }

    @GetMapping("/featured")
    public ResponseEntity<List<ProductResponse>> getFeaturedProducts() {
        return ResponseEntity.ok(productService.getFeaturedProducts());
    }

    @GetMapping("/{slug}")
    public ResponseEntity<ProductResponse> getProductBySlug(@PathVariable("slug") String slug) {
        return ResponseEntity.ok(productService.getProductBySlug(slug));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable("id") Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/variants/{variantId}/stock")
    public ResponseEntity<Void> updateVariantStock(@PathVariable("variantId") Long variantId, @RequestBody java.util.Map<String, Integer> request) {
        productService.updateVariantStock(variantId, request.get("stockQuantity"));
        return ResponseEntity.ok().build();
    }
}
