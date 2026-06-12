package com.ecommerce.backend.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.Map;

@RestController
@RequestMapping("/api/test")
public class TestController {

    @GetMapping
    public Map<String, String> test() {
        return Map.of("message", "API fonctionne correctement !");
    }
    
    @GetMapping("/public")
    public Map<String, String> publicTest() {
        return Map.of("message", "API publique fonctionne");
    }
    
    @GetMapping("/verify-token")
    public Map<String, String> verifyToken() {
        return Map.of("message", "Token verification endpoint");
    }
}