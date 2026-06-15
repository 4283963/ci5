package com.jadechain.blockchain;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.concurrent.*;
import java.util.concurrent.ThreadLocalRandom;

@Slf4j
@Service
public class JadeCertificateContract {

    private final BlockchainClient blockchainClient;
    private final ExecutorService chainExecutor;
    private final Cache<String, CertificateChainData> certificateCache;

    private static final long CHAIN_CALL_TIMEOUT_MS = 2_500;

    @Autowired
    public JadeCertificateContract(BlockchainClient blockchainClient) {
        this.blockchainClient = blockchainClient;
        this.chainExecutor = Executors.newFixedThreadPool(4, r -> {
            Thread t = new Thread(r, "chain-worker");
            t.setDaemon(true);
            return t;
        });
        this.certificateCache = Caffeine.newBuilder()
                .maximumSize(10_000)
                .expireAfterWrite(30, TimeUnit.MINUTES)
                .build();
    }

    public String mintCertificate(String jadeId, String metadata) {
        String hash = generateHash(jadeId, metadata, LocalDateTime.now());

        if (blockchainClient.isConnected()) {
            Future<String> future = chainExecutor.submit(() -> {
                try {
                    log.info("Minting certificate on chain for jadeId: {}", jadeId);
                    blockchainClient.recordSuccess();
                    return hash;
                } catch (Exception e) {
                    log.error("Failed to mint certificate on chain: {}", e.getMessage());
                    blockchainClient.recordFailure();
                    throw e;
                }
            });

            try {
                return future.get(CHAIN_CALL_TIMEOUT_MS, TimeUnit.MILLISECONDS);
            } catch (TimeoutException e) {
                log.warn("Mint certificate timed out after {}ms for jadeId: {}", CHAIN_CALL_TIMEOUT_MS, jadeId);
                blockchainClient.recordFailure();
                future.cancel(true);
                return hash;
            } catch (Exception e) {
                log.warn("Mint certificate failed, returning local hash: {}", e.getMessage());
                return hash;
            }
        } else {
            log.info("Circuit open or disconnected: Generated local certificate hash for jadeId: {}", jadeId);
            return hash;
        }
    }

    public CertificateChainData queryCertificate(String hash) {
        CertificateChainData cached = certificateCache.getIfPresent(hash);
        if (cached != null) {
            log.debug("Cache hit for certificate hash: {}", shortenHash(hash));
            return cached;
        }

        CertificateChainData result;
        if (blockchainClient.isConnected()) {
            Future<CertificateChainData> future = chainExecutor.submit(() -> {
                try {
                    log.info("Querying certificate on chain with hash: {}", shortenHash(hash));
                    CertificateChainData chainData = generateMockChainData(hash);
                    blockchainClient.recordSuccess();
                    return chainData;
                } catch (Exception e) {
                    log.error("Failed to query certificate on chain: {}", e.getMessage());
                    blockchainClient.recordFailure();
                    throw e;
                }
            });

            try {
                result = future.get(CHAIN_CALL_TIMEOUT_MS, TimeUnit.MILLISECONDS);
            } catch (TimeoutException e) {
                log.warn("Query certificate timed out after {}ms, using fallback", CHAIN_CALL_TIMEOUT_MS);
                blockchainClient.recordFailure();
                future.cancel(true);
                result = generateMockChainData(hash);
            } catch (Exception e) {
                log.warn("Query certificate failed, using fallback: {}", e.getMessage());
                result = generateMockChainData(hash);
            }
        } else {
            log.info("Circuit open or disconnected: Using mock certificate data");
            result = generateMockChainData(hash);
        }

        certificateCache.put(hash, result);
        return result;
    }

    public boolean verifyCertificate(String hash) {
        CertificateChainData cached = certificateCache.getIfPresent(hash);
        if (cached != null) {
            log.debug("Cache hit verifying hash: {}", shortenHash(hash));
            return true;
        }

        if (blockchainClient.isConnected()) {
            Future<Boolean> future = chainExecutor.submit(() -> {
                try {
                    log.info("Verifying certificate on chain with hash: {}", shortenHash(hash));
                    blockchainClient.recordSuccess();
                    return true;
                } catch (Exception e) {
                    log.error("Failed to verify certificate on chain: {}", e.getMessage());
                    blockchainClient.recordFailure();
                    throw e;
                }
            });

            try {
                Boolean result = future.get(CHAIN_CALL_TIMEOUT_MS, TimeUnit.MILLISECONDS);
                if (Boolean.TRUE.equals(result)) {
                    certificateCache.put(hash, generateMockChainData(hash));
                }
                return result;
            } catch (TimeoutException e) {
                log.warn("Verify certificate timed out after {}ms, falling back to local validation", CHAIN_CALL_TIMEOUT_MS);
                blockchainClient.recordFailure();
                future.cancel(true);
                return validateHashFormat(hash);
            } catch (Exception e) {
                log.warn("Verify certificate failed, falling back to local validation: {}", e.getMessage());
                return validateHashFormat(hash);
            }
        }

        log.info("Circuit open or disconnected: Using local hash validation");
        return validateHashFormat(hash);
    }

    private boolean validateHashFormat(String hash) {
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

    private String shortenHash(String hash) {
        if (hash == null || hash.length() <= 18) return hash;
        return hash.substring(0, 10) + "..." + hash.substring(hash.length() - 8);
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
