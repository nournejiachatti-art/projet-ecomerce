package com.ecommerce.backend.controller;

import com.ecommerce.backend.config.JwtUtil;
import com.ecommerce.backend.model.*;
import com.ecommerce.backend.repository.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/dashboard")
@CrossOrigin(origins = "*")
public class DashboardController {

    private final UserRepository userRepository;
    private final SupplierRepository supplierRepository;
    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final JwtUtil jwtUtil;

    public DashboardController(UserRepository userRepository,
                              SupplierRepository supplierRepository,
                              CategoryRepository categoryRepository,
                              ProductRepository productRepository,
                              OrderRepository orderRepository,
                              OrderItemRepository orderItemRepository,
                              JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.supplierRepository = supplierRepository;
        this.categoryRepository = categoryRepository;
        this.productRepository = productRepository;
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.jwtUtil = jwtUtil;
    }

    private boolean isAdmin(String token) {
        if (token == null || !token.startsWith("Bearer ")) {
            return false;
        }
        String jwt = token.substring(7);
        String role = jwtUtil.extractClaim(jwt, claims -> claims.get("role", String.class));
        return "ROLE_ADMIN".equals(role) && jwtUtil.validateToken(jwt);
    }

    @GetMapping("/stats")
    public ResponseEntity<?> getDashboardStats(@RequestHeader(value = "Authorization", required = false) String token) {
        System.out.println("=== GET DASHBOARD STATS ===");
        if (!isAdmin(token)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Accès non autorisé"));
        }

        try {
            Map<String, Object> stats = new HashMap<>();
            
            // ==================== PRODUITS ====================
            List<Product> products = productRepository.findAll();
            int totalProducts = products.size();
            int lowStock = (int) products.stream().filter(p -> p.getQuantity() < 10).count();
            
            // ==================== FOURNISSEURS ====================
            int totalSuppliers = (int) supplierRepository.count();
            
            // ==================== COMMANDES ====================
            List<Order> orders = orderRepository.findAll();
            int totalOrders = orders.size();
            int pendingOrders = (int) orders.stream().filter(o -> o.getStatus() == OrderStatus.PENDING).count();
            
            // ==================== CHIFFRE D'AFFAIRES ====================
            // Calculer le CA à partir des commandes VERIFIED, PROCESSING, SHIPPED, DELIVERED
            double totalRevenue = orders.stream()
                    .filter(o -> o.getStatus() == OrderStatus.VERIFIED || 
                                o.getStatus() == OrderStatus.PROCESSING ||
                                o.getStatus() == OrderStatus.SHIPPED ||
                                o.getStatus() == OrderStatus.DELIVERED)
                    .mapToDouble(Order::getTotalAmount)
                    .sum();
            
            System.out.println("Chiffre d'affaires calculé: " + totalRevenue + " €");
            
            // ==================== PRODUITS PAR CATEGORIE ====================
            List<Category> categories = categoryRepository.findAll();
            List<Map<String, Object>> productsByCategory = new ArrayList<>();
            for (Category cat : categories) {
                long count = products.stream()
                        .filter(p -> p.getCategory() != null && p.getCategory().getId().equals(cat.getId()))
                        .count();
                if (count > 0) {
                    Map<String, Object> catStat = new HashMap<>();
                    catStat.put("name", cat.getName());
                    catStat.put("value", count);
                    productsByCategory.add(catStat);
                }
            }
            
            // ==================== CHIFFRE D'AFFAIRES MENSUEL ====================
            String[] months = {"Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Aoû", "Sep", "Oct", "Nov", "Déc"};
            List<Map<String, Object>> monthlyRevenue = new ArrayList<>();
            
            // Initialiser tous les mois à 0
            for (String month : months) {
                Map<String, Object> monthData = new HashMap<>();
                monthData.put("month", month);
                monthData.put("revenue", 0.0);
                monthlyRevenue.add(monthData);
            }
            
            // Calculer le CA par mois à partir des commandes
            for (Order order : orders) {
                if (order.getStatus() == OrderStatus.VERIFIED || 
                    order.getStatus() == OrderStatus.PROCESSING ||
                    order.getStatus() == OrderStatus.SHIPPED ||
                    order.getStatus() == OrderStatus.DELIVERED) {
                    
                    if (order.getCreatedAt() != null) {
                        int monthIndex = order.getCreatedAt().getMonthValue() - 1;
                        if (monthIndex >= 0 && monthIndex < 12) {
                            double currentRevenue = (double) monthlyRevenue.get(monthIndex).get("revenue");
                            monthlyRevenue.get(monthIndex).put("revenue", currentRevenue + order.getTotalAmount());
                        }
                    }
                }
            }
            
            System.out.println("Revenue mensuel calculé: " + monthlyRevenue);
            
            // ==================== STATUT DES COMMANDES ====================
            Map<String, Integer> statusCount = new LinkedHashMap<>();
            statusCount.put("PENDING", 0);
            statusCount.put("VERIFIED", 0);
            statusCount.put("PROCESSING", 0);
            statusCount.put("SHIPPED", 0);
            statusCount.put("DELIVERED", 0);
            statusCount.put("CANCELLED", 0);
            
            for (Order order : orders) {
                String status = order.getStatus().name();
                statusCount.put(status, statusCount.getOrDefault(status, 0) + 1);
            }
            
            List<Map<String, Object>> orderStatusData = new ArrayList<>();
            for (Map.Entry<String, Integer> entry : statusCount.entrySet()) {
                if (entry.getValue() > 0) {
                    Map<String, Object> statusData = new HashMap<>();
                    String displayName = "";
                    switch (entry.getKey()) {
                        case "PENDING": displayName = "En attente"; break;
                        case "VERIFIED": displayName = "Vérifiée"; break;
                        case "PROCESSING": displayName = "En traitement"; break;
                        case "SHIPPED": displayName = "Expédiée"; break;
                        case "DELIVERED": displayName = "Livrée"; break;
                        case "CANCELLED": displayName = "Annulée"; break;
                        default: displayName = entry.getKey();
                    }
                    statusData.put("name", displayName);
                    statusData.put("value", entry.getValue());
                    orderStatusData.add(statusData);
                }
            }
            
            // ==================== STOCK PAR CATEGORIE ====================
            List<Map<String, Object>> stockStatus = new ArrayList<>();
            for (Category cat : categories) {
                int totalStock = products.stream()
                        .filter(p -> p.getCategory() != null && p.getCategory().getId().equals(cat.getId()))
                        .mapToInt(Product::getQuantity)
                        .sum();
                if (totalStock > 0) {
                    Map<String, Object> stockData = new HashMap<>();
                    stockData.put("name", cat.getName());
                    stockData.put("stock", totalStock);
                    stockStatus.add(stockData);
                }
            }
            
            // ==================== COMMANDES RÉCENTES ====================
            List<Map<String, Object>> recentOrders = new ArrayList<>();
            List<Order> recentOrdersList = orders.stream()
                    .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                    .limit(5)
                    .collect(Collectors.toList());
            
            for (Order order : recentOrdersList) {
                Map<String, Object> orderMap = new HashMap<>();
                orderMap.put("id", order.getId());
                orderMap.put("orderNumber", order.getOrderNumber());
                orderMap.put("totalAmount", order.getTotalAmount());
                orderMap.put("status", order.getStatus().name());
                orderMap.put("createdAt", order.getCreatedAt());
                if (order.getUser() != null) {
                    orderMap.put("userEmail", order.getUser().getEmail());
                }
                recentOrders.add(orderMap);
            }
            
            // ==================== CONSTRUCTION DE LA RÉPONSE ====================
            stats.put("totalProducts", totalProducts);
            stats.put("totalSuppliers", totalSuppliers);
            stats.put("totalOrders", totalOrders);
            stats.put("totalRevenue", totalRevenue);
            stats.put("pendingOrders", pendingOrders);
            stats.put("lowStock", lowStock);
            stats.put("productsByCategory", productsByCategory);
            stats.put("monthlyRevenue", monthlyRevenue);
            stats.put("orderStatusData", orderStatusData);
            stats.put("stockStatus", stockStatus);
            stats.put("recentOrders", recentOrders);
            
            System.out.println("Dashboard stats envoyées avec succès");
            System.out.println("Total CA: " + totalRevenue);
            System.out.println("Total commandes: " + totalOrders);
            
            return ResponseEntity.ok(stats);
            
        } catch (Exception e) {
            System.out.println("Erreur dashboard: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Erreur lors du chargement des statistiques: " + e.getMessage()));
        }
    }
}