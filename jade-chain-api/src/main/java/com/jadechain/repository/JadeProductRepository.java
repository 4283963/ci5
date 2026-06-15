package com.jadechain.repository;

import com.jadechain.entity.JadeProduct;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JadeProductRepository extends JpaRepository<JadeProduct, String> {

    List<JadeProduct> findByCategory(String category);

    List<JadeProduct> findByNameContaining(String keyword);
}
