package com.ecommerce.backend.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.Map;

@RestController
@RequestMapping("/api/monitoring")
public class MonitoringController {

    @GetMapping("/health")
    public Map<String, String> health() {
        return Map.of("status", "UP", "message", "Application is running", "timestamp", String.valueOf(System.currentTimeMillis()));
    }
    
    @GetMapping("/info")
    public Map<String, String> info() {
        return Map.of("name", "Ecommerce Backend", "version", "1.0.0", "status", "running");
    }
}