package com.ecommerce.backend.controller;

import com.ecommerce.backend.config.JwtUtil;
import com.ecommerce.backend.config.RateLimitingFilter;
import com.ecommerce.backend.model.User;
import com.ecommerce.backend.repository.UserRepository;
import com.ecommerce.backend.service.AlertService;
import com.ecommerce.backend.service.EmailService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.Random;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final JwtUtil jwtUtil;
    private final RateLimitingFilter rateLimitingFilter;
    private final AlertService alertService;

    public AuthController(UserRepository userRepository,
                         BCryptPasswordEncoder passwordEncoder,
                         EmailService emailService,
                         JwtUtil jwtUtil,
                         RateLimitingFilter rateLimitingFilter,
                         AlertService alertService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
        this.jwtUtil = jwtUtil;
        this.rateLimitingFilter = rateLimitingFilter;
        this.alertService = alertService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> loginRequest,
                                   HttpServletRequest request) {
        String email = loginRequest.get("email");
        String password = loginRequest.get("password");
        String clientIp = getClientIp(request);

        System.out.println("[LOGIN] Tentative - IP: " + clientIp + ", Email: " + email);

        Optional<User> userOpt = userRepository.findByEmail(email);
        
        if (userOpt.isEmpty() || !passwordEncoder.matches(password, userOpt.get().getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("error", "Email ou mot de passe incorrect"));
        }
        
        User user = userOpt.get();
        
        if (!user.isEnabled()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("error", "Veuillez vérifier votre email d'abord"));
        }
        
        String token = jwtUtil.generateToken(user.getEmail(), user.getRole());
        
        Map<String, Object> response = new HashMap<>();
        response.put("id", user.getId());
        response.put("email", user.getEmail());
        response.put("firstName", user.getFirstName());
        response.put("lastName", user.getLastName());
        response.put("role", user.getRole());
        response.put("token", token);
        response.put("message", "Connexion réussie");
        
        System.out.println("[LOGIN] Succès - Email: " + email);
        
        return ResponseEntity.ok(response);
    }

    @PostMapping("/admin/login")
    public ResponseEntity<?> adminLogin(@RequestBody Map<String, String> loginRequest,
                                        HttpServletRequest request) {
        String email = loginRequest.get("email");
        String password = loginRequest.get("password");

        Optional<User> userOpt = userRepository.findByEmail(email);
        
        if (userOpt.isEmpty() || !passwordEncoder.matches(password, userOpt.get().getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("error", "Identifiants administrateur incorrects"));
        }
        
        User admin = userOpt.get();
        
        if (!admin.getRole().equals("ROLE_ADMIN")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("error", "Accès non autorisé"));
        }
        
        String token = jwtUtil.generateToken(admin.getEmail(), admin.getRole());
        
        Map<String, Object> response = new HashMap<>();
        response.put("id", admin.getId());
        response.put("email", admin.getEmail());
        response.put("firstName", admin.getFirstName());
        response.put("lastName", admin.getLastName());
        response.put("role", admin.getRole());
        response.put("token", token);
        response.put("message", "Connexion admin réussie");
        
        return ResponseEntity.ok(response);
    }

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody Map<String, String> signupRequest) {
        String email = signupRequest.get("email");
        String password = signupRequest.get("password");
        String firstName = signupRequest.get("firstName");
        String lastName = signupRequest.get("lastName");
        String phone = signupRequest.get("phone");

        if (userRepository.existsByEmail(email)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email déjà utilisé"));
        }

        User user = new User();
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setPhone(phone);
        user.setRole("ROLE_CLIENT");
        user.setEnabled(false);
        
        String verificationCode = String.format("%06d", new Random().nextInt(999999));
        user.setVerificationCode(verificationCode);
        
        userRepository.save(user);
        
        try {
            emailService.sendVerificationEmail(email, verificationCode);
            System.out.println("Code de vérification pour " + email + ": " + verificationCode);
        } catch (Exception e) {
            System.out.println("Erreur email: " + e.getMessage());
        }
        
        return ResponseEntity.ok(Map.of(
            "message", "Inscription réussie. Un code de vérification a été envoyé à votre email."
        ));
    }

    @PostMapping("/verify")
    public ResponseEntity<?> verifyAccount(@RequestBody Map<String, String> verifyRequest) {
        String email = verifyRequest.get("email");
        String code = verifyRequest.get("code");
        
        Optional<User> userOpt = userRepository.findByEmail(email);
        
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Utilisateur non trouvé"));
        }
        
        User user = userOpt.get();
        
        if (user.getVerificationCode() != null && user.getVerificationCode().equals(code)) {
            user.setEnabled(true);
            user.setVerificationCode(null);
            userRepository.save(user);
            return ResponseEntity.ok(Map.of("message", "Compte activé avec succès"));
        }
        
        return ResponseEntity.badRequest().body(Map.of("error", "Code de vérification incorrect"));
    }

    private String getClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}