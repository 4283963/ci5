package com.jadechain.service;

import com.jadechain.dto.JadeProductDTO;

import java.util.List;

public interface JadeProductService {

    List<JadeProductDTO> getAllProducts();

    JadeProductDTO getProductById(String id);

    List<JadeProductDTO> getProductsByCategory(String category);

    JadeProductDTO createProduct(JadeProductDTO dto);

    JadeProductDTO updateProduct(String id, JadeProductDTO dto);

    void deleteProduct(String id);
}
