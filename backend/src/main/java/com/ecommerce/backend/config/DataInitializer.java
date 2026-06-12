package com.ecommerce.backend.config;

import com.ecommerce.backend.model.User;
import com.ecommerce.backend.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.env.Environment;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final Environment env;

    public DataInitializer(UserRepository userRepository, 
                          BCryptPasswordEncoder passwordEncoder, 
                          Environment env) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.env = env;
    }

    @Override
    public void run(String... args) throws Exception {
        if (!userRepository.existsByEmail("admin@ecommerce.com")) {
            User admin = new User();
            admin.setFirstName("Super");
            admin.setLastName("Admin");
            admin.setEmail("admin@ecommerce.com");
            admin.setPassword(passwordEncoder.encode(env.getProperty("admin.password", "Admin@123")));
            admin.setRole("ROLE_ADMIN");
            admin.setEnabled(true);
            admin.setPhone("0000000000");
            userRepository.save(admin);
            System.out.println("Admin créé avec succès - Email: admin@ecommerce.com, Mot de passe: Admin@123");
        }
    }
}