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
    public ResponseEntity<List<ProductResponse>> getAllProducts(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String brand) {
        if (category != null) {
            return ResponseEntity.ok(productService.getProductsByCategory(category));
        } else if (brand != null) {
            return ResponseEntity.ok(productService.getProductsByBrand(brand));
        }
        return ResponseEntity.ok(productService.getAllActiveProducts());
    }

    @PostMapping
    public ResponseEntity<ProductResponse> createProduct(@RequestBody ProductRequest request) {
        return ResponseEntity.ok(productService.createProduct(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductResponse> updateProduct(@PathVariable Long id, @RequestBody ProductRequest request) {
        return ResponseEntity.ok(productService.updateProduct(id, request));
    }

    @GetMapping("/featured")
    public ResponseEntity<List<ProductResponse>> getFeaturedProducts() {
        return ResponseEntity.ok(productService.getFeaturedProducts());
    }

    @GetMapping("/{slug}")
    public ResponseEntity<ProductResponse> getProductBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(productService.getProductBySlug(slug));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/variants/{variantId}/stock")
    public ResponseEntity<Void> updateVariantStock(@PathVariable Long variantId, @RequestBody java.util.Map<String, Integer> request) {
        productService.updateVariantStock(variantId, request.get("stockQuantity"));
        return ResponseEntity.ok().build();
    }
}
