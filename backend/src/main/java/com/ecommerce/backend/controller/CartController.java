package com.ecommerce.backend.controller;

import com.ecommerce.backend.config.JwtUtil;
import com.ecommerce.backend.model.*;
import com.ecommerce.backend.repository.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/cart")
@CrossOrigin(origins = "*")
public class CartController {

    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final JwtUtil jwtUtil;

    public CartController(UserRepository userRepository,
                         ProductRepository productRepository,
                         JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.jwtUtil = jwtUtil;
    }

    private User getUserFromToken(String token) {
        if (token == null || !token.startsWith("Bearer ")) {
            return null;
        }
        String jwt = token.substring(7);
        String email = jwtUtil.extractEmail(jwt);
        return userRepository.findByEmail(email).orElse(null);
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCart(@RequestHeader(value = "Authorization", required = false) String token) {
        User user = getUserFromToken(token);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Non authentifié"));
        }
        
        return ResponseEntity.ok(Map.of("message", "Panier récupéré", "items", new Object[0], "totalItems", 0, "totalPrice", 0));
    }

    @PostMapping("/add")
    public ResponseEntity<?> addToCart(@RequestBody Map<String, Object> data,
                                       @RequestHeader(value = "Authorization", required = false) String token) {
        User user = getUserFromToken(token);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Non authentifié"));
        }
        
        Long productId = Long.parseLong(data.get("productId").toString());
        int quantity = Integer.parseInt(data.get("quantity").toString());
        
        Optional<Product> productOpt = productRepository.findById(productId);
        if (productOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Produit non trouvé"));
        }
        
        return ResponseEntity.ok(Map.of("message", "Produit ajouté au panier", "productId", productId, "quantity", quantity));
    }
}