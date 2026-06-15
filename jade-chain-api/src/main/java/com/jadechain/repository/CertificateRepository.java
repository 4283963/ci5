package com.jadechain.repository;

import com.jadechain.entity.Certificate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CertificateRepository extends JpaRepository<Certificate, Long> {

    Optional<Certificate> findByJadeId(String jadeId);

    Optional<Certificate> findByCertHash(String certHash);

    boolean existsByCertHash(String certHash);
}
