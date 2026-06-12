package com.ecommerce.backend.controller;

import com.ecommerce.backend.config.JwtUtil;
import com.ecommerce.backend.model.*;
import com.ecommerce.backend.repository.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.Random;
import java.util.UUID;

@RestController
@RequestMapping("/api/cart")
@CrossOrigin(origins = "*")
public class CartController {

    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final JwtUtil jwtUtil;

    public CartController(UserRepository userRepository,
                         ProductRepository productRepository,
                         CartRepository cartRepository,
                         CartItemRepository cartItemRepository,
                         OrderRepository orderRepository,
                         OrderItemRepository orderItemRepository,
                         JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
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

    @PostMapping("/checkout")
    public ResponseEntity<?> checkout(@RequestBody Map<String, Object> data,
                                     @RequestHeader(value = "Authorization", required = false) String token) {
        User user = getUserFromToken(token);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Non authentifié"));
        }
        
        Cart cart = cartRepository.findByUser(user).orElseThrow(() -> 
                new RuntimeException("Panier non trouvé"));
        
        if (cart.getItems().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Panier vide"));
        }
        
        String shippingAddress = (String) data.get("shippingAddress");
        String phoneNumber = (String) data.get("phoneNumber");
        
        // Create order
        Order order = new Order();
        order.setUser(user);
        order.setOrderNumber("ORD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        order.setShippingAddress(shippingAddress);
        order.setPhoneNumber(phoneNumber);
        
        // Generate verification code
        Random random = new Random();
        String verificationCode = String.format("%06d", random.nextInt(1000000));
        order.setVerificationCode(verificationCode);
        
        double total = 0;
        
        for (CartItem cartItem : cart.getItems()) {
            Product product = cartItem.getProduct();
            
            // Check stock again
            if (product.getQuantity() < cartItem.getQuantity()) {
                return ResponseEntity.badRequest().body(Map.of("error", 
                    "Stock insuffisant pour le produit: " + product.getName()));
            }
            
            // Create order item
            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setProduct(product);
            orderItem.setQuantity(cartItem.getQuantity());
            orderItem.setPriceAtTime(product.getSellingPrice());
            order.getItems().add(orderItem);
            
            total += product.getSellingPrice() * cartItem.getQuantity();
        }
        
        order.setTotalAmount(total);
        Order savedOrder = orderRepository.save(order);
        
        // Clear cart
        cart.getItems().clear();
        cartRepository.save(cart);
        
        return ResponseEntity.ok(Map.of(
                "message", "Commande créée",
                "orderNumber", savedOrder.getOrderNumber(),
                "verificationCode", verificationCode
        ));
    }

    @PostMapping("/verify-order")
    public ResponseEntity<?> verifyOrder(@RequestBody Map<String, String> data,
                                        @RequestHeader(value = "Authorization", required = false) String token) {
        User user = getUserFromToken(token);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Non authentifié"));
        }
        
        String orderNumber = data.get("orderNumber");
        String code = data.get("verificationCode");
        
        Optional<Order> orderOpt = orderRepository.findByOrderNumber(orderNumber);
        if (orderOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Commande non trouvée"));
        }
        
        Order order = orderOpt.get();
        
        if (!order.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Accès refusé"));
        }
        
        if (!order.getVerificationCode().equals(code)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Code de vérification incorrect"));
        }
        
        if (order.isVerified()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Commande déjà vérifiée"));
        }
        
        // Verify order and update stock
        order.setVerified(true);
        order.setVerifiedAt(LocalDateTime.now());
        order.setStatus(OrderStatus.VERIFIED);
        
        for (OrderItem orderItem : order.getItems()) {
            Product product = orderItem.getProduct();
            product.setQuantity(product.getQuantity() - orderItem.getQuantity());
            productRepository.save(product);
        }
        
        orderRepository.save(order);
        
        return ResponseEntity.ok(Map.of("message", "Commande vérifiée avec succès"));
    }

    @GetMapping("/my-orders")
    public ResponseEntity<?> getMyOrders(@RequestHeader(value = "Authorization", required = false) String token) {
        User user = getUserFromToken(token);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Non authentifié"));
        }
        
        return ResponseEntity.ok(orderRepository.findByUser(user));
    }

    @GetMapping("/order/{orderNumber}")
    public ResponseEntity<?> getOrderDetail(@PathVariable String orderNumber,
                                            @RequestHeader(value = "Authorization", required = false) String token) {
        User user = getUserFromToken(token);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Non authentifié"));
        }
        
        Optional<Order> orderOpt = orderRepository.findByOrderNumber(orderNumber);
        if (orderOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        Order order = orderOpt.get();
        
        if (!order.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Accès refusé"));
        }
        
        return ResponseEntity.ok(order);
    }
}