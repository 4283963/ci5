package com.jadechain.blockchain;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.web3j.crypto.Credentials;
import org.web3j.protocol.Web3j;
import org.web3j.protocol.http.HttpService;

import jakarta.annotation.PostConstruct;

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

    @PostConstruct
    public void init() {
        try {
            web3j = Web3j.build(new HttpService(rpcUrl));
            credentials = Credentials.create(privateKey);
            log.info("Blockchain client initialized, RPC URL: {}", rpcUrl);
            log.info("Contract address: {}", contractAddress);
        } catch (Exception e) {
            log.warn("Failed to initialize blockchain client, will use mock mode: {}", e.getMessage());
            web3j = null;
            credentials = null;
        }
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

    public boolean isConnected() {
        return web3j != null;
    }
}
