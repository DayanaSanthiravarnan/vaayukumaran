package com.ecommerce.app.controller;

import com.ecommerce.app.model.Category;
import com.ecommerce.app.model.Product;
import com.ecommerce.app.model.User;
import com.ecommerce.app.repository.CategoryRepository;
import com.ecommerce.app.repository.ProductRepository;
import com.ecommerce.app.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/setup")
@RequiredArgsConstructor
public class SetupController {

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final PasswordEncoder passwordEncoder;

    @GetMapping("/reset")
    public Map<String, String> reset() {
        return Map.of("message", "Reset disabled in production.");
    }

    @GetMapping("/init")
    public Map<String, String> init() {
        if (userRepository.existsByUsername("admin")) {
            return Map.of("message", "Already initialized");
        }

        // Admin user
        User admin = new User();
        admin.setName("Admin");
        admin.setEmail("admin@shopzone.com");
        admin.setUsername("admin");
        admin.setPassword(passwordEncoder.encode("Admin@123"));
        admin.setRole("ADMIN");
        userRepository.save(admin);

        // Categories
        String[] catNames = {"Land Sale", "Wedding", "Vehicle"};
        Category[] cats = new Category[3];
        for (int i = 0; i < catNames.length; i++) {
            Category c = new Category();
            c.setName(catNames[i]);
            cats[i] = categoryRepository.save(c);
        }

        // Sample Products
        Object[][] products = {
            // Land Sale (index 0)
            {"Agricultural Land - 2 Acres", "Fertile agricultural land near highway, clear title", 2500000.00, 1, "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400", 0},
            {"Residential Plot - 5 Cents", "Approved residential plot in city limits", 1500000.00, 1, "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400", 0},
            {"Commercial Land - 10 Cents", "Prime commercial land on main road", 5000000.00, 1, "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=400", 0},
            // Wedding (index 1)
            {"Bridal Saree - Silk", "Premium Kanchipuram silk saree for brides", 15000.00, 10, "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400", 1},
            {"Wedding Decoration Package", "Full wedding hall decoration with flowers", 50000.00, 5, "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=400", 1},
            {"Groom Sherwani", "Designer sherwani for groom with accessories", 12000.00, 8, "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=400", 1},
            // Vehicle (index 2)
            {"Honda Activa 6G", "Well maintained scooter, 2022 model, 8000 km", 65000.00, 1, "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400", 2},
            {"Maruti Swift - 2020", "Single owner, AC, power steering, 30000 km", 550000.00, 1, "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400", 2},
            {"Royal Enfield Classic 350", "2021 model, excellent condition, 15000 km", 150000.00, 1, "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400", 2},
        };

        for (Object[] p : products) {
            Product product = new Product();
            product.setName((String) p[0]);
            product.setDescription((String) p[1]);
            product.setPrice((Double) p[2]);
            product.setStock((Integer) p[3]);
            product.setImageUrl((String) p[4]);
            product.setCategory(cats[(Integer) p[5]]);
            productRepository.save(product);
        }

        return Map.of("message", "Setup complete! Admin: admin / Admin@123 — Categories: Land Sale, Wedding, Vehicle");
    }
}
