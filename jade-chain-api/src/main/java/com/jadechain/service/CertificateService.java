package com.jadechain.service;

import com.jadechain.dto.CertificateDTO;

public interface CertificateService {

    CertificateDTO getCertificateByJadeId(String jadeId);

    CertificateDTO getCertificateByHash(String hash);

    boolean verifyCertificate(String hash);

    CertificateDTO mintCertificate(String jadeId);
}
