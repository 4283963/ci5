package com.jadechain.controller;

import com.jadechain.dto.ApiResponse;
import com.jadechain.dto.CertificateDTO;
import com.jadechain.service.CertificateService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/certificates")
@CrossOrigin(origins = "http://localhost:3000")
public class CertificateController {

    private final CertificateService certificateService;

    @Autowired
    public CertificateController(CertificateService certificateService) {
        this.certificateService = certificateService;
    }

    @GetMapping("/jade/{jadeId}")
    public ApiResponse<CertificateDTO> getCertificateByJadeId(@PathVariable String jadeId) {
        return ApiResponse.success(certificateService.getCertificateByJadeId(jadeId));
    }

    @GetMapping("/hash/{hash}")
    public ApiResponse<CertificateDTO> getCertificateByHash(@PathVariable String hash) {
        return ApiResponse.success(certificateService.getCertificateByHash(hash));
    }

    @GetMapping("/verify/{hash}")
    public ApiResponse<Boolean> verifyCertificate(@PathVariable String hash) {
        boolean valid = certificateService.verifyCertificate(hash);
        return ApiResponse.success(valid ? "Certificate verification passed" : "Certificate verification failed", valid);
    }

    @PostMapping("/mint/{jadeId}")
    public ApiResponse<CertificateDTO> mintCertificate(@PathVariable String jadeId) {
        return ApiResponse.success("Certificate minted successfully on blockchain", certificateService.mintCertificate(jadeId));
    }
}
