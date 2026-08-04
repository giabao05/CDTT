package com.phonestore.backend.service;

import com.phonestore.backend.dto.*;
import com.phonestore.backend.entity.*;
import com.phonestore.backend.repository.BrandRepository;
import com.phonestore.backend.repository.CategoryRepository;
import com.phonestore.backend.repository.OrderItemRepository;
import com.phonestore.backend.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService {
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final BrandRepository brandRepository;
    private final OrderItemRepository orderItemRepository;

    @Transactional(readOnly = true)
    public List<ProductResponse> getAllActiveProducts() {
        return productRepository.findByIsActiveTrue().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> getFeaturedProducts() {
        return productRepository.findByIsFeaturedTrueAndIsActiveTrue().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> getProductsByCategory(String categorySlug) {
        return productRepository.findByCategorySlugAndIsActiveTrue(categorySlug).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> getProductsByBrand(String brandSlug) {
        return productRepository.findByBrandSlugAndIsActiveTrue(brandSlug).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ProductResponse getProductBySlug(String slug) {
        Product product = productRepository.findBySlug(slug)
                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.NOT_FOUND, "Product not found"));
        return mapToResponse(product);
    }

    @Transactional
    public ProductResponse createProduct(ProductRequest request) {
        // Create Product
        Product product = new Product();
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setBasePrice(request.getBasePrice());
        product.setThumbnail(request.getThumbnail());
        product.setIsFeatured(request.getIsFeatured() != null ? request.getIsFeatured() : false);
        product.setIsActive(request.getIsActive() != null ? request.getIsActive() : true);
        
        // Generate slug from name
        String slug = request.getName().toLowerCase().replaceAll("[^a-z0-9]+", "-");
        product.setSlug(slug);

        // Map Category (Create if not exists by name for simplicity)
        if (request.getCategory() != null && !request.getCategory().trim().isEmpty()) {
            Category category = categoryRepository.findByName(request.getCategory())
                    .orElseGet(() -> {
                        Category newCat = new Category();
                        newCat.setName(request.getCategory());
                        newCat.setSlug(request.getCategory().toLowerCase().replaceAll("[^a-z0-9]+", "-"));
                        newCat.setIsActive(true);
                        return categoryRepository.save(newCat);
                    });
            product.setCategory(category);
        }

        // Map Brand (Create if not exists by name)
        if (request.getBrand() != null && !request.getBrand().trim().isEmpty()) {
            Brand brand = brandRepository.findByName(request.getBrand())
                    .orElseGet(() -> {
                        Brand newBrand = new Brand();
                        newBrand.setName(request.getBrand());
                        newBrand.setSlug(request.getBrand().toLowerCase().replaceAll("[^a-z0-9]+", "-"));
                        return brandRepository.save(newBrand);
                    });
            product.setBrand(brand);
        }

        // Map Specification
        if (request.getSpecification() != null) {
            ProductSpecification spec = new ProductSpecification();
            spec.setProduct(product);
            spec.setScreenSize(request.getSpecification().getScreenSize());
            spec.setOs(request.getSpecification().getOs());
            spec.setProcessor(request.getSpecification().getProcessor());
            spec.setMainCamera(request.getSpecification().getMainCamera());
            spec.setSelfieCamera(request.getSpecification().getSelfieCamera());
            spec.setBattery(request.getSpecification().getBattery());
            spec.setSim(request.getSpecification().getSim());
            product.setSpecification(spec);
        }

        // Map Images
        if (request.getImages() != null) {
            List<ProductImage> images = request.getImages().stream().map(iReq -> {
                ProductImage img = new ProductImage();
                img.setProduct(product);
                img.setImageUrl(iReq.getImageUrl());
                img.setIsThumbnail(iReq.getIsThumbnail() != null ? iReq.getIsThumbnail() : false);
                img.setSortOrder(iReq.getSortOrder() != null ? iReq.getSortOrder() : 0);
                return img;
            }).collect(Collectors.toList());
            product.setImages(images);
        }

        // Map Variants
        if (request.getVariants() != null) {
            List<ProductVariant> variants = request.getVariants().stream().map(vReq -> {
                ProductVariant var = new ProductVariant();
                var.setProduct(product);
                var.setSku(vReq.getSku());
                var.setColor(vReq.getColor());
                var.setStorage(vReq.getStorage());
                var.setPrice(vReq.getPrice());
                var.setStockQuantity(vReq.getStockQuantity());
                var.setImageUrl(vReq.getImageUrl());
                var.setIsActive(vReq.getIsActive() != null ? vReq.getIsActive() : true);
                return var;
            }).collect(Collectors.toList());
            product.setVariants(variants);
        }

    Product savedProduct = productRepository.save(product);
        return mapToResponse(savedProduct);
    }

    @Transactional
    public ProductResponse updateProduct(Long id, ProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.NOT_FOUND, "Product not found"));

        if (request.getName() != null) {
            product.setName(request.getName());
            String slug = request.getName().toLowerCase().replaceAll("[^a-z0-9]+", "-");
            product.setSlug(slug);
        }
        product.setDescription(request.getDescription());
        product.setBasePrice(request.getBasePrice());
        product.setThumbnail(request.getThumbnail());
        product.setIsFeatured(request.getIsFeatured() != null ? request.getIsFeatured() : false);
        product.setIsActive(request.getIsActive() != null ? request.getIsActive() : true);

        if (request.getCategory() != null && !request.getCategory().trim().isEmpty()) {
            Category category = categoryRepository.findByName(request.getCategory())
                    .orElseGet(() -> {
                        Category newCat = new Category();
                        newCat.setName(request.getCategory());
                        newCat.setSlug(request.getCategory().toLowerCase().replaceAll("[^a-z0-9]+", "-"));
                        newCat.setIsActive(true);
                        return categoryRepository.save(newCat);
                    });
            product.setCategory(category);
        }

        if (request.getBrand() != null && !request.getBrand().trim().isEmpty()) {
            Brand brand = brandRepository.findByName(request.getBrand())
                    .orElseGet(() -> {
                        Brand newBrand = new Brand();
                        newBrand.setName(request.getBrand());
                        newBrand.setSlug(request.getBrand().toLowerCase().replaceAll("[^a-z0-9]+", "-"));
                        return brandRepository.save(newBrand);
                    });
            product.setBrand(brand);
        }

        if (request.getSpecification() != null) {
            ProductSpecification spec = product.getSpecification();
            if (spec == null) {
                spec = new ProductSpecification();
                spec.setProduct(product);
                product.setSpecification(spec);
            }
            spec.setScreenSize(request.getSpecification().getScreenSize());
            spec.setOs(request.getSpecification().getOs());
            spec.setProcessor(request.getSpecification().getProcessor());
            spec.setMainCamera(request.getSpecification().getMainCamera());
            spec.setSelfieCamera(request.getSpecification().getSelfieCamera());
            spec.setBattery(request.getSpecification().getBattery());
            spec.setSim(request.getSpecification().getSim());
        }

        // Handle images: clear old and add new ones
        if (request.getImages() != null) {
            if (product.getImages() == null) {
                product.setImages(new ArrayList<>());
            }
            product.getImages().clear();
            for (var iReq : request.getImages()) {
                ProductImage img = new ProductImage();
                img.setProduct(product);
                img.setImageUrl(iReq.getImageUrl());
                img.setIsThumbnail(iReq.getIsThumbnail() != null ? iReq.getIsThumbnail() : false);
                img.setSortOrder(iReq.getSortOrder() != null ? iReq.getSortOrder() : 0);
                product.getImages().add(img);
            }
        }

        // Handle variants: sync with request
        if (request.getVariants() != null) {
            if (product.getVariants() == null) {
                product.setVariants(new ArrayList<>());
            }

            // Build a map of existing variants by SKU (handle potential duplicates safely)
            Map<String, ProductVariant> existingVariants = new java.util.HashMap<>();
            for (ProductVariant v : product.getVariants()) {
                if (v.getSku() != null) {
                    existingVariants.putIfAbsent(v.getSku(), v);
                }
            }

            // Collect new SKUs from the request
            java.util.Set<String> requestedSkus = new java.util.HashSet<>();
            for (ProductVariantRequest vReq : request.getVariants()) {
                if (vReq.getSku() != null) {
                    requestedSkus.add(vReq.getSku());
                }
            }

            // Remove variants that are not in the new request
            product.getVariants().removeIf(existingVar ->
                existingVar.getSku() == null || !requestedSkus.contains(existingVar.getSku())
            );

            // Update existing or add new variants
            for (ProductVariantRequest vReq : request.getVariants()) {
                ProductVariant variant = existingVariants.get(vReq.getSku());
                if (variant == null) {
                    variant = new ProductVariant();
                    variant.setProduct(product);
                    variant.setSku(vReq.getSku());
                    product.getVariants().add(variant);
                }
                variant.setColor(vReq.getColor());
                variant.setStorage(vReq.getStorage());
                variant.setPrice(vReq.getPrice());
                variant.setStockQuantity(vReq.getStockQuantity() != null ? vReq.getStockQuantity() : 0);
                variant.setImageUrl(vReq.getImageUrl());
                variant.setIsActive(vReq.getIsActive() != null ? vReq.getIsActive() : true);
            }
        }

        Product savedProduct = productRepository.save(product);
        return mapToResponse(savedProduct);
    }

    @Transactional
    public void deleteProduct(Long id) {
        if (!productRepository.existsById(id)) {
            return; // Idempotent delete: if it's already gone, just return success
        }
        // Nullify variant references in order_items to avoid FK constraint violation
        orderItemRepository.nullifyVariantsByProductId(id);
        productRepository.deleteById(id);
    }

    private ProductResponse mapToResponse(Product p) {
        CategoryResponse catResp = null;
        if (p.getCategory() != null) {
            catResp = CategoryResponse.builder()
                    .id(p.getCategory().getId())
                    .name(p.getCategory().getName())
                    .slug(p.getCategory().getSlug())
                    .description(p.getCategory().getDescription())
                    .isActive(p.getCategory().getIsActive())
                    .build();
        }

        BrandResponse brandResp = null;
        if (p.getBrand() != null) {
            brandResp = BrandResponse.builder()
                    .id(p.getBrand().getId())
                    .name(p.getBrand().getName())
                    .slug(p.getBrand().getSlug())
                    .logoUrl(p.getBrand().getLogoUrl())
                    .description(p.getBrand().getDescription())
                    .build();
        }

        ProductSpecificationResponse specResp = null;
        if (p.getSpecification() != null) {
            specResp = ProductSpecificationResponse.builder()
                    .id(p.getSpecification().getId())
                    .screenSize(p.getSpecification().getScreenSize())
                    .os(p.getSpecification().getOs())
                    .processor(p.getSpecification().getProcessor())
                    .mainCamera(p.getSpecification().getMainCamera())
                    .selfieCamera(p.getSpecification().getSelfieCamera())
                    .battery(p.getSpecification().getBattery())
                    .sim(p.getSpecification().getSim())
                    .build();
        }

        List<ProductImageResponse> imgResps = Collections.emptyList();
        if (p.getImages() != null) {
            imgResps = p.getImages().stream().map(i -> ProductImageResponse.builder()
                    .id(i.getId())
                    .imageUrl(i.getImageUrl())
                    .isThumbnail(i.getIsThumbnail())
                    .sortOrder(i.getSortOrder())
                    .build()).collect(Collectors.toList());
        }

        List<ProductVariantResponse> varResps = Collections.emptyList();
        if (p.getVariants() != null) {
            varResps = p.getVariants().stream().map(v -> ProductVariantResponse.builder()
                    .id(v.getId())
                    .sku(v.getSku())
                    .color(v.getColor())
                    .storage(v.getStorage())
                    .price(v.getPrice())
                    .stockQuantity(v.getStockQuantity())
                    .imageUrl(v.getImageUrl())
                    .isActive(v.getIsActive())
                    .build()).collect(Collectors.toList());
        }

        return ProductResponse.builder()
                .id(p.getId())
                .name(p.getName())
                .slug(p.getSlug())
                .description(p.getDescription())
                .basePrice(p.getBasePrice())
                .thumbnail(p.getThumbnail())
                .isFeatured(p.getIsFeatured())
                .isActive(p.getIsActive())
                .createdAt(p.getCreatedAt())
                .updatedAt(p.getUpdatedAt())
                .category(catResp)
                .brand(brandResp)
                .specification(specResp)
                .images(imgResps)
                .variants(varResps)
                .build();
    }
}
