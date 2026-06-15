package com.jadechain.blockchain;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.web3j.crypto.Credentials;
import org.web3j.protocol.Web3j;
import org.web3j.protocol.http.HttpService;

import jakarta.annotation.PostConstruct;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicInteger;

@Slf4j
@Component
public class BlockchainClient {

    @Value("${blockchain.consortium.rpc-url}")
    private String rpcUrl;

    @Value("${blockchain.consortium.private-key}")
    private String privateKey;

    @Value("${blockchain.consortium.contract-address}")
    private String contractAddress;

    @Value("${blockchain.consortium.chain-id}")
    private long chainId;

    private Web3j web3j;
    private Credentials credentials;
    private HttpService httpService;

    private final AtomicInteger consecutiveFailures = new AtomicInteger(0);
    private final AtomicBoolean circuitOpen = new AtomicBoolean(false);
    private final ScheduledExecutorService circuitScheduler = Executors.newSingleThreadScheduledExecutor();

    private static final int FAILURE_THRESHOLD = 3;
    private static final long CIRCUIT_RESET_MS = 30_000;

    @Autowired
    public BlockchainClient() {
    }

    @PostConstruct
    public void init() {
        try {
            httpService = new HttpService(rpcUrl, false);
            httpService.setConnectTimeout(2000, TimeUnit.MILLISECONDS);
            httpService.setReadTimeout(3000, TimeUnit.MILLISECONDS);
            web3j = Web3j.build(httpService);
            credentials = Credentials.create(privateKey);
            log.info("Blockchain client initialized, RPC URL: {}, contract: {}", rpcUrl, contractAddress);

            Executors.newSingleThreadExecutor().submit(this::testConnection);
        } catch (Exception e) {
            log.warn("Failed to initialize blockchain client, will operate in degraded mode: {}", e.getMessage());
            web3j = null;
            credentials = null;
        }
    }

    private void testConnection() {
        try {
            if (web3j != null) {
                web3j.ethBlockNumber().send();
                log.info("Blockchain connection verified successfully");
            }
        } catch (Exception e) {
            log.warn("Blockchain connection test failed, will use fallback mode: {}", e.getMessage());
            recordFailure();
        }
    }

    public boolean isConnected() {
        return web3j != null && !circuitOpen.get();
    }

    public void recordFailure() {
        int failures = consecutiveFailures.incrementAndGet();
        log.warn("Blockchain call failure recorded, consecutive: {}", failures);
        if (failures >= FAILURE_THRESHOLD && circuitOpen.compareAndSet(false, true)) {
            log.error("Circuit breaker OPEN after {} failures, halting blockchain calls for {}ms",
                    failures, CIRCUIT_RESET_MS);
            circuitScheduler.schedule(() -> {
                log.info("Circuit breaker HALF-OPEN, testing connection...");
                consecutiveFailures.set(0);
                circuitOpen.set(false);
                testConnection();
            }, CIRCUIT_RESET_MS, TimeUnit.MILLISECONDS);
        }
    }

    public void recordSuccess() {
        if (consecutiveFailures.getAndSet(0) > 0) {
            log.info("Blockchain call succeeded, resetting failure counter");
        }
        circuitOpen.set(false);
    }

    public Web3j getWeb3j() {
        return web3j;
    }

    public Credentials getCredentials() {
        return credentials;
    }

    public String getContractAddress() {
        return contractAddress;
    }

    public long getChainId() {
        return chainId;
    }

    public boolean isCircuitOpen() {
        return circuitOpen.get();
    }
}
