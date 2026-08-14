package com.ecommerce.app.controller;

import com.ecommerce.app.model.CartItem;
import com.ecommerce.app.model.Product;
import com.ecommerce.app.model.User;
import com.ecommerce.app.repository.CartItemRepository;
import com.ecommerce.app.repository.ProductRepository;
import com.ecommerce.app.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.HtmlUtils;
import jakarta.transaction.Transactional;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    private User getUser(UserDetails ud) {
        return userRepository.findByUsername(ud.getUsername()).orElseThrow();
    }

    @GetMapping
    public List<CartItem> getCart(@AuthenticationPrincipal UserDetails ud) {
        return cartItemRepository.findByUserId(getUser(ud).getId());
    }

    @PostMapping("/add")
    public ResponseEntity<?> addToCart(@AuthenticationPrincipal UserDetails ud,
                                        @RequestBody Map<String, Integer> body) {
        Integer productId = body.get("productId");
        Integer quantity = body.getOrDefault("quantity", 1);

        User user = getUser(ud);
        Product product = productRepository.findById(productId)
            .orElseThrow(() -> new RuntimeException("Product not found"));

        if (product.getStock() <= 0)
            return ResponseEntity.badRequest().body(Map.of("message", "Product is out of stock"));
        if (product.getStock() < quantity)
            return ResponseEntity.badRequest().body(Map.of("message", "Only " + HtmlUtils.htmlEscape(String.valueOf(product.getStock())) + " items available"));

        cartItemRepository.findByUserIdAndProductId(user.getId(), productId)
            .ifPresentOrElse(
                item -> {
                    item.setQuantity(item.getQuantity() + quantity);
                    cartItemRepository.save(item);
                },
                () -> {
                    CartItem item = new CartItem();
                    item.setUser(user);
                    item.setProduct(product);
                    item.setQuantity(quantity);
                    cartItemRepository.save(item);
                }
            );
        return ResponseEntity.ok(Map.of("message", "Added to cart"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateQuantity(@AuthenticationPrincipal UserDetails ud,
                                             @PathVariable Integer id,
                                             @RequestBody Map<String, Integer> body) {
        Integer quantity = body.get("quantity");
        return cartItemRepository.findById(id).map(item -> {
            if (!item.getUser().getUsername().equals(ud.getUsername()))
                return ResponseEntity.status(403).<Object>body(Map.of("message", "Forbidden"));
            if (quantity <= 0) {
                cartItemRepository.delete(item);
                return ResponseEntity.ok(Map.of("message", "Item removed"));
            }
            item.setQuantity(quantity);
            return ResponseEntity.ok((Object) cartItemRepository.save(item));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> removeFromCart(@AuthenticationPrincipal UserDetails ud,
                                             @PathVariable Integer id) {
        return cartItemRepository.findById(id).map(item -> {
            if (!item.getUser().getUsername().equals(ud.getUsername()))
                return ResponseEntity.status(403).<Void>build();
            cartItemRepository.delete(item);
            return ResponseEntity.noContent().<Void>build();
        }).orElse(ResponseEntity.notFound().build());
    }

    @Transactional
    @DeleteMapping("/clear")
    public ResponseEntity<?> clearCart(@AuthenticationPrincipal UserDetails ud) {
        cartItemRepository.deleteByUserId(getUser(ud).getId());
        return ResponseEntity.ok(Map.of("message", "Cart cleared"));
    }
}
