package com.jadechain.controller;

import com.jadechain.dto.ApiResponse;
import com.jadechain.dto.JadeProductDTO;
import com.jadechain.service.JadeProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/jades")
@CrossOrigin(origins = "http://localhost:3000")
public class JadeProductController {

    private final JadeProductService productService;

    @Autowired
    public JadeProductController(JadeProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    public ApiResponse<List<JadeProductDTO>> getAllProducts() {
        return ApiResponse.success(productService.getAllProducts());
    }

    @GetMapping("/{id}")
    public ApiResponse<JadeProductDTO> getProductById(@PathVariable String id) {
        return ApiResponse.success(productService.getProductById(id));
    }

    @GetMapping("/category/{category}")
    public ApiResponse<List<JadeProductDTO>> getProductsByCategory(@PathVariable String category) {
        return ApiResponse.success(productService.getProductsByCategory(category));
    }

    @PostMapping
    public ApiResponse<JadeProductDTO> createProduct(@RequestBody JadeProductDTO dto) {
        return ApiResponse.success("Product created successfully", productService.createProduct(dto));
    }

    @PutMapping("/{id}")
    public ApiResponse<JadeProductDTO> updateProduct(@PathVariable String id, @RequestBody JadeProductDTO dto) {
        return ApiResponse.success("Product updated successfully", productService.updateProduct(id, dto));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteProduct(@PathVariable String id) {
        productService.deleteProduct(id);
        return ApiResponse.success("Product deleted successfully", null);
    }
}
