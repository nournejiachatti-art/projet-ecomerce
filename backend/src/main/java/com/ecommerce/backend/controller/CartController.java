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
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final JwtUtil jwtUtil;

    public CartController(UserRepository userRepository,
                         ProductRepository productRepository,
                         CartRepository cartRepository,
                         CartItemRepository cartItemRepository,
                         JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
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
        
        Cart cart = cartRepository.findByUser(user).orElseGet(() -> {
            Cart newCart = new Cart();
            newCart.setUser(user);
            return cartRepository.save(newCart);
        });
        
        double totalPrice = cart.getItems().stream()
                .mapToDouble(item -> item.getProduct().getSellingPrice() * item.getQuantity())
                .sum();
        int totalItems = cart.getItems().stream()
                .mapToInt(CartItem::getQuantity)
                .sum();
        
        return ResponseEntity.ok(Map.of(
                "message", "Panier récupéré",
                "items", cart.getItems(),
                "totalItems", totalItems,
                "totalPrice", totalPrice
        ));
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
        
        Product product = productOpt.get();
        
        // Check stock
        if (product.getQuantity() < quantity) {
            return ResponseEntity.badRequest().body(Map.of("error", "Stock insuffisant"));
        }
        
        Cart cart = cartRepository.findByUser(user).orElseGet(() -> {
            Cart newCart = new Cart();
            newCart.setUser(user);
            return cartRepository.save(newCart);
        });
        
        Optional<CartItem> existingItemOpt = cartItemRepository.findByCartAndProduct(cart, product);
        
        if (existingItemOpt.isPresent()) {
            CartItem existingItem = existingItemOpt.get();
            existingItem.setQuantity(existingItem.getQuantity() + quantity);
            cartItemRepository.save(existingItem);
        } else {
            CartItem newItem = new CartItem();
            newItem.setCart(cart);
            newItem.setProduct(product);
            newItem.setQuantity(quantity);
            cartItemRepository.save(newItem);
        }
        
        return ResponseEntity.ok(Map.of("message", "Produit ajouté au panier"));
    }

    @PutMapping("/update")
    public ResponseEntity<?> updateCartItem(@RequestBody Map<String, Object> data,
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
        
        Product product = productOpt.get();
        
        // Check stock
        if (product.getQuantity() < quantity) {
            return ResponseEntity.badRequest().body(Map.of("error", "Stock insuffisant"));
        }
        
        Cart cart = cartRepository.findByUser(user).orElseThrow(() -> 
                new RuntimeException("Panier non trouvé"));
        
        Optional<CartItem> existingItemOpt = cartItemRepository.findByCartAndProduct(cart, product);
        
        if (existingItemOpt.isPresent()) {
            CartItem existingItem = existingItemOpt.get();
            existingItem.setQuantity(quantity);
            cartItemRepository.save(existingItem);
            return ResponseEntity.ok(Map.of("message", "Quantité mise à jour"));
        } else {
            return ResponseEntity.badRequest().body(Map.of("error", "Produit non trouvé dans le panier"));
        }
    }

    @DeleteMapping("/remove/{productId}")
    public ResponseEntity<?> removeFromCart(@PathVariable Long productId,
                                           @RequestHeader(value = "Authorization", required = false) String token) {
        User user = getUserFromToken(token);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Non authentifié"));
        }
        
        Optional<Product> productOpt = productRepository.findById(productId);
        if (productOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Produit non trouvé"));
        }
        
        Product product = productOpt.get();
        
        Cart cart = cartRepository.findByUser(user).orElseThrow(() -> 
                new RuntimeException("Panier non trouvé"));
        
        cartItemRepository.deleteByCartAndProduct(cart, product);
        
        return ResponseEntity.ok(Map.of("message", "Produit retiré du panier"));
    }

    @DeleteMapping("/clear")
    public ResponseEntity<?> clearCart(@RequestHeader(value = "Authorization", required = false) String token) {
        User user = getUserFromToken(token);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Non authentifié"));
        }
        
        Cart cart = cartRepository.findByUser(user).orElseThrow(() -> 
                new RuntimeException("Panier non trouvé"));
        
        cart.getItems().clear();
        cartRepository.save(cart);
        
        return ResponseEntity.ok(Map.of("message", "Panier vidé"));
    }
}