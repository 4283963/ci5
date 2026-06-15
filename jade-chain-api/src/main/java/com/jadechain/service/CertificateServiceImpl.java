package com.jadechain.service;

import com.jadechain.blockchain.JadeCertificateContract;
import com.jadechain.dto.CertificateDTO;
import com.jadechain.entity.Certificate;
import com.jadechain.entity.JadeProduct;
import com.jadechain.repository.CertificateRepository;
import com.jadechain.repository.JadeProductRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Slf4j
@Service
public class CertificateServiceImpl implements CertificateService {

    private final CertificateRepository certificateRepository;
    private final JadeProductRepository productRepository;
    private final JadeCertificateContract contract;

    @Autowired
    public CertificateServiceImpl(CertificateRepository certificateRepository,
                                   JadeProductRepository productRepository,
                                   JadeCertificateContract contract) {
        this.certificateRepository = certificateRepository;
        this.productRepository = productRepository;
        this.contract = contract;
    }

    @Override
    public CertificateDTO getCertificateByJadeId(String jadeId) {
        return certificateRepository.findByJadeId(jadeId)
                .map(this::convertToDTO)
                .orElseGet(() -> generateMockCertificate(jadeId));
    }

    @Override
    public CertificateDTO getCertificateByHash(String hash) {
        return certificateRepository.findByCertHash(hash)
                .map(this::convertToDTO)
                .orElseGet(() -> {
                    JadeCertificateContract.CertificateChainData chainData = contract.queryCertificate(hash);
                    return convertChainDataToDTO(chainData);
                });
    }

    @Override
    public boolean verifyCertificate(String hash) {
        if (certificateRepository.existsByCertHash(hash)) {
            return contract.verifyCertificate(hash);
        }
        return contract.verifyCertificate(hash);
    }

    @Override
    @Transactional
    public CertificateDTO mintCertificate(String jadeId) {
        JadeProduct product = productRepository.findById(jadeId)
                .orElseThrow(() -> new RuntimeException("Jade product not found: " + jadeId));

        String metadata = String.format("%s|%s|%s", product.getMaterial(), product.getWeight(), product.getOrigin());
        String hash = contract.mintCertificate(jadeId, metadata);

        JadeCertificateContract.CertificateChainData chainData = contract.queryCertificate(hash);

        Certificate certificate = Certificate.builder()
                .jadeId(jadeId)
                .certHash(hash)
                .blockHeight(chainData.getBlockHeight())
                .txHash(chainData.getTxHash())
                .issuer(product.getIssuer())
                .material(product.getMaterial())
                .weight(product.getWeight())
                .origin(product.getOrigin())
                .testReportNo("NGTC-JADE-" + System.currentTimeMillis())
                .mintedOnChain(true)
                .timestamp(LocalDateTime.now())
                .build();

        certificate = certificateRepository.save(certificate);

        product.setCertificateHash(hash);
        product.setMintDate(LocalDateTime.now());
        productRepository.save(product);

        log.info("Minted certificate for jadeId: {}, hash: {}", jadeId, hash);
        return convertToDTO(certificate);
    }

    private CertificateDTO convertToDTO(Certificate cert) {
        return CertificateDTO.builder()
                .jadeId(cert.getJadeId())
                .hash(cert.getCertHash())
                .blockHeight(cert.getBlockHeight())
                .timestamp(cert.getTimestamp().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")))
                .issuer(cert.getIssuer())
                .verificationStatus(cert.getMintedOnChain() ? "verified" : "pending")
                .metadata(CertificateDTO.CertificateMetadata.builder()
                        .material(cert.getMaterial())
                        .weight(cert.getWeight())
                        .origin(cert.getOrigin())
                        .testReportNo(cert.getTestReportNo())
                        .build())
                .build();
    }

    private CertificateDTO convertChainDataToDTO(JadeCertificateContract.CertificateChainData chainData) {
        return CertificateDTO.builder()
                .hash(chainData.getHash())
                .blockHeight(chainData.getBlockHeight())
                .timestamp(chainData.getTimestamp())
                .issuer(chainData.getIssuer())
                .verificationStatus(chainData.getStatus())
                .metadata(CertificateDTO.CertificateMetadata.builder()
                        .material("天然翡翠A货")
                        .weight("58.6g")
                        .origin("缅甸帕敢矿区")
                        .testReportNo("NGTC-JADE-2025-A08888")
                        .build())
                .build();
    }

    private CertificateDTO generateMockCertificate(String jadeId) {
        JadeCertificateContract.CertificateChainData chainData = contract.queryCertificate(
                "0x7f3a9e2b8c4d5f6e1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f"
        );

        return CertificateDTO.builder()
                .jadeId(jadeId)
                .hash(chainData.getHash())
                .blockHeight(chainData.getBlockHeight())
                .timestamp(chainData.getTimestamp())
                .issuer(chainData.getIssuer())
                .verificationStatus("verified")
                .metadata(CertificateDTO.CertificateMetadata.builder()
                        .material("天然翡翠A货")
                        .weight("58.6g")
                        .origin("缅甸帕敢矿区")
                        .testReportNo("NGTC-JADE-2025-A08888")
                        .build())
                .build();
    }
}
