package com.ecommerce.backend.controller;

import com.ecommerce.backend.config.JwtUtil;
import com.ecommerce.backend.model.*;
import com.ecommerce.backend.repository.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    private final UserRepository userRepository;
    private final SupplierRepository supplierRepository;
    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final SupplierInvoiceRepository invoiceRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AdminController(UserRepository userRepository,
                          SupplierRepository supplierRepository,
                          CategoryRepository categoryRepository,
                          ProductRepository productRepository,
                          OrderRepository orderRepository,
                          OrderItemRepository orderItemRepository,
                          SupplierInvoiceRepository invoiceRepository,
                          BCryptPasswordEncoder passwordEncoder,
                          JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.supplierRepository = supplierRepository;
        this.categoryRepository = categoryRepository;
        this.productRepository = productRepository;
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.invoiceRepository = invoiceRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    private boolean isAdmin(String token) {
        System.out.println("=== VÉRIFICATION ADMIN ===");
        if (token == null || !token.startsWith("Bearer ")) {
            System.out.println("Token manquant ou invalide");
            return false;
        }
        String jwt = token.substring(7);
        String role = jwtUtil.extractClaim(jwt, claims -> claims.get("role", String.class));
        boolean isValid = jwtUtil.validateToken(jwt);
        System.out.println("Role: " + role + ", Valide: " + isValid);
        return "ROLE_ADMIN".equals(role) && isValid;
    }

    // ==================== ENDPOINTS PUBLICS ====================

    @GetMapping("/public/products")
    public ResponseEntity<?> getPublicProducts() {
        System.out.println("=== GET PUBLIC PRODUCTS ===");
        List<Product> products = productRepository.findAll();
        return ResponseEntity.ok(products);
    }

    @GetMapping("/public/products/{id}")
    public ResponseEntity<?> getPublicProductById(@PathVariable Long id) {
        System.out.println("=== GET PUBLIC PRODUCT BY ID: " + id + " ===");
        Optional<Product> productOpt = productRepository.findById(id);
        if (productOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(productOpt.get());
    }

    // ==================== UTILISATEURS ====================

    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers(@RequestHeader(value = "Authorization", required = false) String token) {
        System.out.println("=== GET ALL USERS ===");
        if (!isAdmin(token)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Accès non autorisé"));
        }
        return ResponseEntity.ok(userRepository.findAll());
    }

    @GetMapping("/users/clients")
    public ResponseEntity<?> getClients(@RequestHeader(value = "Authorization", required = false) String token) {
        System.out.println("=== GET CLIENTS ===");
        if (!isAdmin(token)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Accès non autorisé"));
        }
        List<User> clients = userRepository.findAll().stream()
                .filter(u -> "ROLE_CLIENT".equals(u.getRole()))
                .toList();
        return ResponseEntity.ok(clients);
    }

    @PutMapping("/users/{id}/toggle")
    public ResponseEntity<?> toggleUserStatus(@PathVariable Long id,
                                              @RequestHeader(value = "Authorization", required = false) String token) {
        System.out.println("=== TOGGLE USER STATUS: " + id + " ===");
        if (!isAdmin(token)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Accès non autorisé"));
        }
        
        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        User user = userOpt.get();
        user.setEnabled(!user.isEnabled());
        userRepository.save(user);
        
        return ResponseEntity.ok(Map.of("message", user.isEnabled() ? "Compte activé" : "Compte désactivé"));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id,
                                        @RequestHeader(value = "Authorization", required = false) String token) {
        System.out.println("=== DELETE USER: " + id + " ===");
        if (!isAdmin(token)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Accès non autorisé"));
        }
        
        if (!userRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        
        userRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Utilisateur supprimé avec succès"));
    }

    // ==================== CATEGORIES ====================

    @GetMapping("/categories")
    public ResponseEntity<?> getAllCategories(@RequestHeader(value = "Authorization", required = false) String token) {
        System.out.println("=== GET ALL CATEGORIES ===");
        if (!isAdmin(token)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Accès non autorisé"));
        }
        return ResponseEntity.ok(categoryRepository.findAll());
    }

    @PostMapping("/categories")
    public ResponseEntity<?> createCategory(@RequestBody Map<String, String> categoryData,
                                            @RequestHeader(value = "Authorization", required = false) String token) {
        System.out.println("=== CREATE CATEGORY ===");
        if (!isAdmin(token)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Accès non autorisé"));
        }
        
        String name = categoryData.get("name");
        
        if (categoryRepository.existsByName(name)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Une catégorie avec ce nom existe déjà"));
        }
        
        Category category = new Category();
        category.setName(name);
        category.setDescription(categoryData.get("description"));
        
        if (categoryData.containsKey("parentId") && categoryData.get("parentId") != null) {
            Long parentId = Long.parseLong(categoryData.get("parentId"));
            Optional<Category> parentOpt = categoryRepository.findById(parentId);
            parentOpt.ifPresent(category::setParentCategory);
        }
        
        categoryRepository.save(category);
        return ResponseEntity.ok(Map.of("message", "Catégorie créée avec succès", "category", category));
    }

    @PutMapping("/categories/{id}")
    public ResponseEntity<?> updateCategory(@PathVariable Long id,
                                            @RequestBody Map<String, String> categoryData,
                                            @RequestHeader(value = "Authorization", required = false) String token) {
        System.out.println("=== UPDATE CATEGORY: " + id + " ===");
        if (!isAdmin(token)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Accès non autorisé"));
        }
        
        Optional<Category> categoryOpt = categoryRepository.findById(id);
        if (categoryOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        Category category = categoryOpt.get();
        category.setName(categoryData.getOrDefault("name", category.getName()));
        category.setDescription(categoryData.getOrDefault("description", category.getDescription()));
        category.setEnabled(Boolean.parseBoolean(categoryData.getOrDefault("enabled", "true")));
        
        if (categoryData.containsKey("parentId") && categoryData.get("parentId") != null) {
            Long parentId = Long.parseLong(categoryData.get("parentId"));
            Optional<Category> parentOpt = categoryRepository.findById(parentId);
            parentOpt.ifPresent(category::setParentCategory);
        }
        
        categoryRepository.save(category);
        return ResponseEntity.ok(Map.of("message", "Catégorie modifiée avec succès", "category", category));
    }

    @DeleteMapping("/categories/{id}")
    public ResponseEntity<?> deleteCategory(@PathVariable Long id,
                                            @RequestHeader(value = "Authorization", required = false) String token) {
        System.out.println("=== DELETE CATEGORY: " + id + " ===");
        if (!isAdmin(token)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Accès non autorisé"));
        }
        
        if (!categoryRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        
        categoryRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Catégorie supprimée avec succès"));
    }

    // ==================== PRODUITS ====================

    @GetMapping("/products")
    public ResponseEntity<?> getAllProducts(@RequestHeader(value = "Authorization", required = false) String token) {
        System.out.println("=== GET ALL PRODUCTS (ADMIN) ===");
        if (!isAdmin(token)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Accès non autorisé"));
        }
        return ResponseEntity.ok(productRepository.findAll());
    }

    @PostMapping("/products")
    public ResponseEntity<?> createProduct(@RequestBody Map<String, Object> productData,
                                           @RequestHeader(value = "Authorization", required = false) String token) {
        System.out.println("=== CREATE PRODUCT ===");
        if (!isAdmin(token)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Accès non autorisé"));
        }
        
        String name = (String) productData.get("name");
        
        if (productRepository.existsByName(name)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Un produit avec ce nom existe déjà"));
        }
        
        Product product = new Product();
        product.setName(name);
        product.setDescription((String) productData.get("description"));
        product.setPurchasePrice(Double.parseDouble(productData.get("purchasePrice").toString()));
        product.setSellingPrice(Double.parseDouble(productData.get("sellingPrice").toString()));
        
        if (productData.containsKey("categoryId") && productData.get("categoryId") != null) {
            Long categoryId = Long.parseLong(productData.get("categoryId").toString());
            Optional<Category> categoryOpt = categoryRepository.findById(categoryId);
            categoryOpt.ifPresent(product::setCategory);
        }
        
        if (productData.containsKey("subCategoryId") && productData.get("subCategoryId") != null) {
            Long subCategoryId = Long.parseLong(productData.get("subCategoryId").toString());
            Optional<Category> subCategoryOpt = categoryRepository.findById(subCategoryId);
            subCategoryOpt.ifPresent(product::setSubCategory);
        }
        
        if (productData.containsKey("imageUrl") && productData.get("imageUrl") != null) {
            product.setImageUrl((String) productData.get("imageUrl"));
        }
        
        productRepository.save(product);
        return ResponseEntity.ok(Map.of("message", "Produit créé avec succès", "product", product));
    }

    @PutMapping("/products/{id}")
    public ResponseEntity<?> updateProduct(@PathVariable Long id,
                                           @RequestBody Map<String, Object> productData,
                                           @RequestHeader(value = "Authorization", required = false) String token) {
        System.out.println("=== UPDATE PRODUCT: " + id + " ===");
        if (!isAdmin(token)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Accès non autorisé"));
        }
        
        Optional<Product> productOpt = productRepository.findById(id);
        if (productOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        Product product = productOpt.get();
        product.setName((String) productData.getOrDefault("name", product.getName()));
        product.setDescription((String) productData.getOrDefault("description", product.getDescription()));
        product.setPurchasePrice(Double.parseDouble(productData.get("purchasePrice").toString()));
        product.setSellingPrice(Double.parseDouble(productData.get("sellingPrice").toString()));
        product.setEnabled(Boolean.parseBoolean(productData.getOrDefault("enabled", true).toString()));
        
        if (productData.containsKey("categoryId") && productData.get("categoryId") != null) {
            Long categoryId = Long.parseLong(productData.get("categoryId").toString());
            Optional<Category> categoryOpt = categoryRepository.findById(categoryId);
            categoryOpt.ifPresent(product::setCategory);
        }
        
        if (productData.containsKey("subCategoryId") && productData.get("subCategoryId") != null) {
            Long subCategoryId = Long.parseLong(productData.get("subCategoryId").toString());
            Optional<Category> subCategoryOpt = categoryRepository.findById(subCategoryId);
            subCategoryOpt.ifPresent(product::setSubCategory);
        }
        
        if (productData.containsKey("imageUrl") && productData.get("imageUrl") != null) {
            product.setImageUrl((String) productData.get("imageUrl"));
        }
        
        productRepository.save(product);
        return ResponseEntity.ok(Map.of("message", "Produit modifié avec succès", "product", product));
    }

    @DeleteMapping("/products/{id}")
    public ResponseEntity<?> deleteProduct(@PathVariable Long id,
                                           @RequestHeader(value = "Authorization", required = false) String token) {
        System.out.println("=== DELETE PRODUCT: " + id + " ===");
        if (!isAdmin(token)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Accès non autorisé"));
        }
        
        if (!productRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        
        productRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Produit supprimé avec succès"));
    }

    @PutMapping("/products/{id}/increase-quantity")
    public ResponseEntity<?> increaseQuantity(@PathVariable Long id,
                                              @RequestBody Map<String, Integer> quantityData,
                                              @RequestHeader(value = "Authorization", required = false) String token) {
        System.out.println("=== INCREASE QUANTITY: " + id + " ===");
        if (!isAdmin(token)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Accès non autorisé"));
        }
        
        Optional<Product> productOpt = productRepository.findById(id);
        if (productOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        Product product = productOpt.get();
        int quantityToAdd = quantityData.get("quantity");
        
        if (quantityToAdd <= 0) {
            return ResponseEntity.badRequest().body(Map.of("error", "La quantité doit être supérieure à 0"));
        }
        
        int oldQuantity = product.getQuantity();
        product.setQuantity(oldQuantity + quantityToAdd);
        productRepository.save(product);
        
        return ResponseEntity.ok(Map.of(
            "message", "Quantité augmentée avec succès",
            "productName", product.getName(),
            "oldQuantity", oldQuantity,
            "addedQuantity", quantityToAdd,
            "newQuantity", product.getQuantity()
        ));
    }

    @PutMapping("/products/{id}/decrease-quantity")
    public ResponseEntity<?> decreaseQuantity(@PathVariable Long id,
                                              @RequestBody Map<String, Integer> quantityData,
                                              @RequestHeader(value = "Authorization", required = false) String token) {
        System.out.println("=== DECREASE QUANTITY: " + id + " ===");
        if (!isAdmin(token)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Accès non autorisé"));
        }
        
        Optional<Product> productOpt = productRepository.findById(id);
        if (productOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        Product product = productOpt.get();
        int quantityToRemove = quantityData.get("quantity");
        
        if (quantityToRemove <= 0) {
            return ResponseEntity.badRequest().body(Map.of("error", "La quantité doit être supérieure à 0"));
        }
        
        if (product.getQuantity() < quantityToRemove) {
            return ResponseEntity.badRequest().body(Map.of("error", "Stock insuffisant. Stock actuel: " + product.getQuantity()));
        }
        
        int oldQuantity = product.getQuantity();
        product.setQuantity(oldQuantity - quantityToRemove);
        productRepository.save(product);
        
        return ResponseEntity.ok(Map.of(
            "message", "Quantité diminuée avec succès",
            "productName", product.getName(),
            "oldQuantity", oldQuantity,
            "removedQuantity", quantityToRemove,
            "newQuantity", product.getQuantity()
        ));
    }

    // ==================== FOURNISSEURS ====================

    @GetMapping("/suppliers")
    public ResponseEntity<?> getAllSuppliers(@RequestHeader(value = "Authorization", required = false) String token) {
        System.out.println("=== GET ALL SUPPLIERS ===");
        if (!isAdmin(token)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Accès non autorisé"));
        }
        return ResponseEntity.ok(supplierRepository.findAll());
    }

    @PostMapping("/suppliers")
    public ResponseEntity<?> createSupplier(@RequestBody Map<String, String> supplierData,
                                            @RequestHeader(value = "Authorization", required = false) String token) {
        System.out.println("=== CREATE SUPPLIER ===");
        if (!isAdmin(token)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Accès non autorisé"));
        }
        
        String email = supplierData.get("email");
        
        if (supplierRepository.existsByEmail(email)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Un fournisseur avec cet email existe déjà"));
        }
        
        Supplier supplier = new Supplier();
        supplier.setCompanyName(supplierData.get("companyName"));
        supplier.setContactPerson(supplierData.get("contactPerson"));
        supplier.setEmail(email);
        supplier.setPhone(supplierData.get("phone"));
        supplier.setAddress(supplierData.get("address"));
        supplier.setTaxNumber(supplierData.get("taxNumber"));
        
        supplierRepository.save(supplier);
        return ResponseEntity.ok(Map.of("message", "Fournisseur créé avec succès", "supplier", supplier));
    }

    @PutMapping("/suppliers/{id}")
    public ResponseEntity<?> updateSupplier(@PathVariable Long id,
                                            @RequestBody Map<String, String> supplierData,
                                            @RequestHeader(value = "Authorization", required = false) String token) {
        System.out.println("=== UPDATE SUPPLIER: " + id + " ===");
        if (!isAdmin(token)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Accès non autorisé"));
        }
        
        Optional<Supplier> supplierOpt = supplierRepository.findById(id);
        if (supplierOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        Supplier supplier = supplierOpt.get();
        supplier.setCompanyName(supplierData.getOrDefault("companyName", supplier.getCompanyName()));
        supplier.setContactPerson(supplierData.getOrDefault("contactPerson", supplier.getContactPerson()));
        supplier.setPhone(supplierData.getOrDefault("phone", supplier.getPhone()));
        supplier.setAddress(supplierData.getOrDefault("address", supplier.getAddress()));
        supplier.setTaxNumber(supplierData.getOrDefault("taxNumber", supplier.getTaxNumber()));
        
        supplierRepository.save(supplier);
        return ResponseEntity.ok(Map.of("message", "Fournisseur modifié avec succès", "supplier", supplier));
    }

    @DeleteMapping("/suppliers/{id}")
    public ResponseEntity<?> deleteSupplier(@PathVariable Long id,
                                            @RequestHeader(value = "Authorization", required = false) String token) {
        System.out.println("=== DELETE SUPPLIER: " + id + " ===");
        if (!isAdmin(token)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Accès non autorisé"));
        }
        
        if (!supplierRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        
        supplierRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Fournisseur supprimé avec succès"));
    }

    // ==================== FACTURES (INVOICES) ====================

    @GetMapping("/invoices")
    public ResponseEntity<?> getAllInvoices(@RequestHeader(value = "Authorization", required = false) String token) {
        System.out.println("=== GET ALL INVOICES ===");
        if (!isAdmin(token)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Accès non autorisé"));
        }
        
        try {
            List<SupplierInvoice> invoices = invoiceRepository.findAll();
            System.out.println("Nombre de factures: " + invoices.size());
            return ResponseEntity.ok(invoices);
        } catch (Exception e) {
            System.out.println("Erreur lors du chargement des factures: " + e.getMessage());
            return ResponseEntity.ok(new ArrayList<>());
        }
    }

    @GetMapping("/invoices/{id}")
    public ResponseEntity<?> getInvoiceById(@PathVariable Long id,
                                            @RequestHeader(value = "Authorization", required = false) String token) {
        System.out.println("=== GET INVOICE BY ID: " + id + " ===");
        if (!isAdmin(token)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Accès non autorisé"));
        }
        
        Optional<SupplierInvoice> invoiceOpt = invoiceRepository.findById(id);
        if (invoiceOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(invoiceOpt.get());
    }

    @PostMapping("/invoices")
    public ResponseEntity<?> createInvoice(@RequestBody Map<String, Object> invoiceData,
                                           @RequestHeader(value = "Authorization", required = false) String token) {
        System.out.println("=== CREATE INVOICE ===");
        if (!isAdmin(token)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Accès non autorisé"));
        }
        
        try {
            String invoiceNumber = (String) invoiceData.get("invoiceNumber");
            Long supplierId = Long.parseLong(invoiceData.get("supplierId").toString());
            LocalDate invoiceDate = LocalDate.parse((String) invoiceData.get("invoiceDate"));
            double totalAmount = Double.parseDouble(invoiceData.get("totalAmount").toString());
            
            Optional<Supplier> supplierOpt = supplierRepository.findById(supplierId);
            if (supplierOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Fournisseur non trouvé"));
            }
            
            SupplierInvoice invoice = new SupplierInvoice();
            invoice.setInvoiceNumber(invoiceNumber);
            invoice.setSupplier(supplierOpt.get());
            invoice.setInvoiceDate(invoiceDate);
            invoice.setTotalAmount(totalAmount);
            
            SupplierInvoice savedInvoice = invoiceRepository.save(invoice);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Facture créée avec succès");
            response.put("invoice", savedInvoice);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("Erreur création facture: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", "Erreur lors de la création: " + e.getMessage()));
        }
    }

    @DeleteMapping("/invoices/{id}")
    public ResponseEntity<?> deleteInvoice(@PathVariable Long id,
                                           @RequestHeader(value = "Authorization", required = false) String token) {
        System.out.println("=== DELETE INVOICE: " + id + " ===");
        if (!isAdmin(token)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Accès non autorisé"));
        }
        
        if (!invoiceRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        
        invoiceRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Facture supprimée avec succès"));
    }

    // ==================== COMMANDES (ORDERS) ====================

    @GetMapping("/orders")
    public ResponseEntity<?> getAllOrders(@RequestHeader(value = "Authorization", required = false) String token) {
        System.out.println("=== GET ALL ORDERS ===");
        if (!isAdmin(token)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Accès non autorisé"));
        }
        
        List<Order> orders = orderRepository.findAll();
        System.out.println("Nombre de commandes: " + orders.size());
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/orders/{orderNumber}")
    public ResponseEntity<?> getOrderByNumber(@PathVariable String orderNumber,
                                              @RequestHeader(value = "Authorization", required = false) String token) {
        System.out.println("=== GET ORDER BY NUMBER: " + orderNumber + " ===");
        if (!isAdmin(token)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Accès non autorisé"));
        }
        
        Optional<Order> orderOpt = orderRepository.findByOrderNumber(orderNumber);
        if (orderOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(orderOpt.get());
    }

    @GetMapping("/orders/status/{status}")
    public ResponseEntity<?> getOrdersByStatus(@PathVariable String status,
                                               @RequestHeader(value = "Authorization", required = false) String token) {
        System.out.println("=== GET ORDERS BY STATUS: " + status + " ===");
        if (!isAdmin(token)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Accès non autorisé"));
        }
        
        List<Order> orders = orderRepository.findByStatus(status);
        return ResponseEntity.ok(orders);
    }

    @PutMapping("/orders/{orderNumber}/status")
    public ResponseEntity<?> updateOrderStatus(@PathVariable String orderNumber,
                                               @RequestBody Map<String, String> statusData,
                                               @RequestHeader(value = "Authorization", required = false) String token) {
        System.out.println("=== UPDATE ORDER STATUS: " + orderNumber + " ===");
        if (!isAdmin(token)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Accès non autorisé"));
        }
        
        Optional<Order> orderOpt = orderRepository.findByOrderNumber(orderNumber);
        if (orderOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        Order order = orderOpt.get();
        String newStatus = statusData.get("status");
        order.setStatus(OrderStatus.valueOf(newStatus));
        orderRepository.save(order);
        
        return ResponseEntity.ok(Map.of("message", "Statut mis à jour", "status", newStatus));
    }

    @PutMapping("/orders/{orderNumber}/validate")
    public ResponseEntity<?> validateOrder(@PathVariable String orderNumber,
                                           @RequestHeader(value = "Authorization", required = false) String token) {
        System.out.println("=== VALIDATE ORDER: " + orderNumber + " ===");
        if (!isAdmin(token)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Accès non autorisé"));
        }
        
        Optional<Order> orderOpt = orderRepository.findByOrderNumber(orderNumber);
        if (orderOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        Order order = orderOpt.get();
        order.setVerified(true);
        order.setStatus(OrderStatus.VERIFIED);
        orderRepository.save(order);
        
        return ResponseEntity.ok(Map.of("message", "Commande validée avec succès", "status", order.getStatus()));
    }

    @DeleteMapping("/orders/{id}")
    public ResponseEntity<?> deleteOrder(@PathVariable Long id,
                                         @RequestHeader(value = "Authorization", required = false) String token) {
        System.out.println("=== DELETE ORDER: " + id + " ===");
        if (!isAdmin(token)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Accès non autorisé"));
        }
        
        if (!orderRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        
        // Supprimer d'abord les order_items associés
        orderItemRepository.deleteByOrderId(id);
        orderRepository.deleteById(id);
        
        return ResponseEntity.ok(Map.of("message", "Commande supprimée avec succès"));
    }
}