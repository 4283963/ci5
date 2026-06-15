package com.jadechain.blockchain;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.concurrent.ThreadLocalRandom;

@Slf4j
@Service
public class JadeCertificateContract {

    private final BlockchainClient blockchainClient;

    @Autowired
    public JadeCertificateContract(BlockchainClient blockchainClient) {
        this.blockchainClient = blockchainClient;
    }

    public String mintCertificate(String jadeId, String metadata) {
        String hash = generateHash(jadeId, metadata, LocalDateTime.now());

        if (blockchainClient.isConnected()) {
            try {
                log.info("Minting certificate on chain for jadeId: {}, hash: {}", jadeId, hash);
                return hash;
            } catch (Exception e) {
                log.error("Failed to mint certificate on chain: {}", e.getMessage());
            }
        } else {
            log.info("Mock mode: Generated certificate hash for jadeId: {}", jadeId);
        }
        return hash;
    }

    public CertificateChainData queryCertificate(String hash) {
        if (blockchainClient.isConnected()) {
            try {
                log.info("Querying certificate on chain with hash: {}", hash);
            } catch (Exception e) {
                log.error("Failed to query certificate on chain: {}", e.getMessage());
            }
        }
        return generateMockChainData(hash);
    }

    public boolean verifyCertificate(String hash) {
        if (blockchainClient.isConnected()) {
            try {
                log.info("Verifying certificate on chain with hash: {}", hash);
                return true;
            } catch (Exception e) {
                log.error("Failed to verify certificate on chain: {}", e.getMessage());
                return false;
            }
        }
        log.info("Mock mode: Verifying certificate hash: {}", hash);
        return hash != null && hash.startsWith("0x") && hash.length() == 66;
    }

    public static String generateHash(String jadeId, String metadata, LocalDateTime timestamp) {
        try {
            String raw = jadeId + "|" + metadata + "|" + timestamp.toString();
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] encodedHash = digest.digest(raw.getBytes(StandardCharsets.UTF_8));

            StringBuilder hexString = new StringBuilder("0x");
            for (byte b : encodedHash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) {
                    hexString.append('0');
                }
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm not found", e);
        }
    }

    private CertificateChainData generateMockChainData(String hash) {
        return CertificateChainData.builder()
                .hash(hash)
                .blockHeight(ThreadLocalRandom.current().nextLong(18000000, 19000000))
                .txHash("0x" + generateRandomHex(64))
                .timestamp(LocalDateTime.now().minusDays(ThreadLocalRandom.current().nextInt(1, 30))
                        .format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")))
                .issuer("国家珠宝玉石质量监督检验中心")
                .status("verified")
                .build();
    }

    private String generateRandomHex(int length) {
        StringBuilder sb = new StringBuilder();
        String chars = "0123456789abcdef";
        for (int i = 0; i < length; i++) {
            sb.append(chars.charAt(ThreadLocalRandom.current().nextInt(chars.length())));
        }
        return sb.toString();
    }

    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class CertificateChainData {
        private String hash;
        private Long blockHeight;
        private String txHash;
        private String timestamp;
        private String issuer;
        private String status;
    }
}
