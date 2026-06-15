package com.jadechain.config;

import com.jadechain.entity.Certificate;
import com.jadechain.entity.JadeProduct;
import com.jadechain.repository.CertificateRepository;
import com.jadechain.repository.JadeProductRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Slf4j
@Component
public class DataInitializer implements CommandLineRunner {

    private final JadeProductRepository productRepository;
    private final CertificateRepository certificateRepository;

    @Autowired
    public DataInitializer(JadeProductRepository productRepository,
                          CertificateRepository certificateRepository) {
        this.productRepository = productRepository;
        this.certificateRepository = certificateRepository;
    }

    @Override
    public void run(String... args) {
        if (productRepository.count() == 0) {
            log.info("Initializing sample jade product data...");

            JadeProduct jade1 = JadeProduct.builder()
                    .id("JADE-2026-00888")
                    .name("冰种翡翠·帝王绿手串")
                    .category("翡翠手串")
                    .origin("缅甸帕敢矿区")
                    .weight("58.6g")
                    .sizeSpec("14mm × 12颗")
                    .material("天然翡翠A货")
                    .description("此款手串选用缅甸帕敢老坑冰种翡翠原料，质地细腻温润，水头十足，呈现出浓郁纯正的帝王绿色泽。每颗珠子经过大师精心打磨，光泽内敛，宝气内含，堪称收藏级珍品。")
                    .price(new BigDecimal("288000.00"))
                    .modelUrl("/models/jade-bracelet.gltf")
                    .certificateHash("0x7f3a9e2b8c4d5f6e1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f")
                    .mintDate(LocalDateTime.now().minusDays(15))
                    .issuer("国家珠宝玉石质量监督检验中心")
                    .build();

            JadeProduct jade2 = JadeProduct.builder()
                    .id("JADE-2026-00666")
                    .name("和田玉籽料·羊脂白玉吊坠")
                    .category("和田玉吊坠")
                    .origin("新疆和田玉龙喀什河")
                    .weight("32.4g")
                    .sizeSpec("48mm × 32mm")
                    .material("和田玉籽料羊脂白玉")
                    .description("精选新疆和田玉龙喀什河独籽原石，质地温润细腻，油脂光泽柔和，白度达羊脂级别，雕工精湛，是不可多得的传世珍品。")
                    .price(new BigDecimal("168000.00"))
                    .modelUrl("/models/hetian-pendant.gltf")
                    .certificateHash("0x8a4b0f3c9d5e7a2b1e4f6a8c0d2e9b4f7c6a1e3d5b9f0a2c4e6b8d0f2a4c6e8")
                    .mintDate(LocalDateTime.now().minusDays(30))
                    .issuer("国家珠宝玉石质量监督检验中心")
                    .build();

            JadeProduct jade3 = JadeProduct.builder()
                    .id("JADE-2026-00999")
                    .name("南红玛瑙·保山料貔貅手把件")
                    .category("南红手把件")
                    .origin("云南保山")
                    .weight("86.2g")
                    .sizeSpec("56mm × 42mm")
                    .material("保山南红玛瑙")
                    .description("云南保山原矿南红玛瑙，色泽浓郁纯正，满肉柿子红，质地细腻油润，貔貅造型古朴大气，寓意招财进宝。")
                    .price(new BigDecimal("58000.00"))
                    .modelUrl("/models/nanhong-pixiu.gltf")
                    .certificateHash("0x1c7d3e9f5a1b7c3d5e9f1a3b5c7d9e1f3a5b7c9d1e3f5a7b9c1d3e5f7a9c3b5")
                    .mintDate(LocalDateTime.now().minusDays(10))
                    .issuer("国家珠宝玉石质量监督检验中心")
                    .build();

            productRepository.save(jade1);
            productRepository.save(jade2);
            productRepository.save(jade3);

            log.info("Sample jade products initialized, total: {}", productRepository.count());

            Certificate cert1 = Certificate.builder()
                    .jadeId("JADE-2026-00888")
                    .certHash("0x7f3a9e2b8c4d5f6e1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f")
                    .blockHeight(18745236L)
                    .txHash("0xabc123def456ghi789")
                    .issuer("国家珠宝玉石质量监督检验中心")
                    .material("天然翡翠A货")
                    .weight("58.6g")
                    .origin("缅甸帕敢矿区")
                    .testReportNo("NGTC-JADE-2025-A08888")
                    .mintedOnChain(true)
                    .timestamp(LocalDateTime.now().minusDays(15))
                    .build();

            certificateRepository.save(cert1);
            log.info("Sample certificates initialized.");
        }
    }
}
