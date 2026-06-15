package com.jadechain.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JadeProductDTO {

    private String id;
    private String name;
    private String category;
    private String origin;
    private String weight;
    private String sizeSpec;
    private String material;
    private String description;
    private BigDecimal price;
    private String modelUrl;
    private String certificateHash;
    private LocalDateTime mintDate;
    private String issuer;
}
