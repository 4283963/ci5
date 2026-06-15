package com.jadechain.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "jade_products")
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JadeProduct {

    @Id
    @Column(name = "id", length = 64)
    private String id;

    @Column(name = "name", nullable = false, length = 256)
    private String name;

    @Column(name = "category", length = 128)
    private String category;

    @Column(name = "origin", length = 256)
    private String origin;

    @Column(name = "weight", length = 64)
    private String weight;

    @Column(name = "size_spec", length = 128)
    private String sizeSpec;

    @Column(name = "material", length = 128)
    private String material;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "price", precision = 18, scale = 2)
    private BigDecimal price;

    @Column(name = "model_url", length = 512)
    private String modelUrl;

    @Column(name = "certificate_hash", length = 128)
    private String certificateHash;

    @Column(name = "mint_date")
    private LocalDateTime mintDate;

    @Column(name = "issuer", length = 256)
    private String issuer;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
