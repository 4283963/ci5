package com.jadechain.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "certificates")
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Certificate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "jade_id", nullable = false, length = 64)
    private String jadeId;

    @Column(name = "cert_hash", nullable = false, length = 128, unique = true)
    private String certHash;

    @Column(name = "block_height")
    private Long blockHeight;

    @Column(name = "tx_hash", length = 128)
    private String txHash;

    @Column(name = "issuer", length = 256)
    private String issuer;

    @Column(name = "material", length = 128)
    private String material;

    @Column(name = "weight", length = 64)
    private String weight;

    @Column(name = "origin", length = 256)
    private String origin;

    @Column(name = "test_report_no", length = 128)
    private String testReportNo;

    @Column(name = "minted_on_chain", nullable = false)
    private Boolean mintedOnChain;

    @Column(name = "timestamp")
    private LocalDateTime timestamp;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (timestamp == null) {
            timestamp = LocalDateTime.now();
        }
        if (mintedOnChain == null) {
            mintedOnChain = false;
        }
    }
}
