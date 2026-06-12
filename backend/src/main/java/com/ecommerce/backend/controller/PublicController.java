package com.ecommerce.backend.controller;

import com.ecommerce.backend.model.Product;
import com.ecommerce.backend.repository.ProductRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/public")
@CrossOrigin(origins = "*")
public class PublicController {

    private final ProductRepository productRepository;

    public PublicController(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @GetMapping("/products")
    public ResponseEntity<List<Product>> getAllProducts() {
        System.out.println("=== PUBLIC GET ALL PRODUCTS ===");
        List<Product> products = productRepository.findAll();
        System.out.println("Nombre de produits: " + products.size());
        return ResponseEntity.ok(products);
    }

    @GetMapping("/products/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable Long id) {
        System.out.println("=== PUBLIC GET PRODUCT BY ID: " + id + " ===");
        Optional<Product> productOpt = productRepository.findById(id);
        if (productOpt.isEmpty()) {
            System.out.println("Produit non trouvé avec ID: " + id);
            return ResponseEntity.notFound().build();
        }
        System.out.println("Produit trouvé: " + productOpt.get().getName());
        return ResponseEntity.ok(productOpt.get());
    }
}