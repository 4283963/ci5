package com.jadechain.service;

import com.jadechain.dto.JadeProductDTO;
import com.jadechain.entity.JadeProduct;
import com.jadechain.repository.JadeProductRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
public class JadeProductServiceImpl implements JadeProductService {

    private final JadeProductRepository productRepository;

    @Autowired
    public JadeProductServiceImpl(JadeProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @Override
    public List<JadeProductDTO> getAllProducts() {
        return productRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public JadeProductDTO getProductById(String id) {
        return productRepository.findById(id)
                .map(this::convertToDTO)
                .orElseThrow(() -> new RuntimeException("Jade product not found with id: " + id));
    }

    @Override
    public List<JadeProductDTO> getProductsByCategory(String category) {
        return productRepository.findByCategory(category).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public JadeProductDTO createProduct(JadeProductDTO dto) {
        JadeProduct product = convertToEntity(dto);
        product = productRepository.save(product);
        log.info("Created jade product: {}", product.getId());
        return convertToDTO(product);
    }

    @Override
    @Transactional
    public JadeProductDTO updateProduct(String id, JadeProductDTO dto) {
        JadeProduct existing = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Jade product not found with id: " + id));

        existing.setName(dto.getName());
        existing.setCategory(dto.getCategory());
        existing.setOrigin(dto.getOrigin());
        existing.setWeight(dto.getWeight());
        existing.setSizeSpec(dto.getSizeSpec());
        existing.setMaterial(dto.getMaterial());
        existing.setDescription(dto.getDescription());
        existing.setPrice(dto.getPrice());
        existing.setModelUrl(dto.getModelUrl());

        existing = productRepository.save(existing);
        log.info("Updated jade product: {}", id);
        return convertToDTO(existing);
    }

    @Override
    @Transactional
    public void deleteProduct(String id) {
        if (!productRepository.existsById(id)) {
            throw new RuntimeException("Jade product not found with id: " + id);
        }
        productRepository.deleteById(id);
        log.info("Deleted jade product: {}", id);
    }

    private JadeProductDTO convertToDTO(JadeProduct product) {
        return JadeProductDTO.builder()
                .id(product.getId())
                .name(product.getName())
                .category(product.getCategory())
                .origin(product.getOrigin())
                .weight(product.getWeight())
                .sizeSpec(product.getSizeSpec())
                .material(product.getMaterial())
                .description(product.getDescription())
                .price(product.getPrice())
                .modelUrl(product.getModelUrl())
                .certificateHash(product.getCertificateHash())
                .mintDate(product.getMintDate())
                .issuer(product.getIssuer())
                .build();
    }

    private JadeProduct convertToEntity(JadeProductDTO dto) {
        return JadeProduct.builder()
                .id(dto.getId())
                .name(dto.getName())
                .category(dto.getCategory())
                .origin(dto.getOrigin())
                .weight(dto.getWeight())
                .sizeSpec(dto.getSizeSpec())
                .material(dto.getMaterial())
                .description(dto.getDescription())
                .price(dto.getPrice())
                .modelUrl(dto.getModelUrl())
                .certificateHash(dto.getCertificateHash())
                .mintDate(dto.getMintDate())
                .issuer(dto.getIssuer())
                .build();
    }
}
