package com.jadechain.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CertificateDTO {

    private String jadeId;
    private String hash;
    private Long blockHeight;
    private String timestamp;
    private String issuer;
    private String verificationStatus;
    private CertificateMetadata metadata;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CertificateMetadata {
        private String material;
        private String weight;
        private String origin;
        private String testReportNo;
    }
}
