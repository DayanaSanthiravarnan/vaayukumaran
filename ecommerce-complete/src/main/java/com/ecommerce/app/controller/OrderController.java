package com.ecommerce.app.controller;

import com.ecommerce.app.model.*;
import com.ecommerce.app.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import jakarta.transaction.Transactional;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderRepository orderRepository;
    private final CartItemRepository cartItemRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    private User getUser(UserDetails ud) {
        return userRepository.findByUsername(ud.getUsername()).orElseThrow();
    }

    @GetMapping
    public List<Order> getMyOrders(@AuthenticationPrincipal UserDetails ud) {
        return orderRepository.findByUserId(getUser(ud).getId());
    }

    @Transactional
    @PostMapping("/place")
    public ResponseEntity<?> placeOrder(@AuthenticationPrincipal UserDetails ud,
                                         @RequestBody Map<String, String> body) {
        User user = getUser(ud);
        List<CartItem> cartItems = cartItemRepository.findByUserId(user.getId());

        if (cartItems.isEmpty())
            return ResponseEntity.badRequest().body(Map.of("message", "Cart is empty"));

        String shippingAddress = body.get("shippingAddress");
        if (shippingAddress == null || shippingAddress.isBlank())
            return ResponseEntity.badRequest().body(Map.of("message", "Shipping address is required"));

        // Stock check
        for (CartItem ci : cartItems) {
            Product product = ci.getProduct();
            if (product.getStock() < ci.getQuantity())
                return ResponseEntity.badRequest().body(Map.of(
                    "message", "Insufficient stock for: " + product.getName(),
                    "available", product.getStock()
                ));
        }

        double total = cartItems.stream()
            .mapToDouble(c -> c.getProduct().getPrice() * c.getQuantity())
            .sum();

        Order order = new Order();
        order.setUser(user);
        order.setTotalAmount(total);
        order.setStatus("PENDING");
        order.setShippingAddress(shippingAddress);

        List<OrderItem> orderItems = new ArrayList<>();
        for (CartItem ci : cartItems) {
            OrderItem oi = new OrderItem();
            oi.setOrder(order);
            oi.setProduct(ci.getProduct());
            oi.setQuantity(ci.getQuantity());
            oi.setPrice(ci.getProduct().getPrice());
            orderItems.add(oi);

            // Reduce stock
            Product product = ci.getProduct();
            product.setStock(product.getStock() - ci.getQuantity());
            productRepository.save(product);
        }
        order.setOrderItems(orderItems);
        orderRepository.save(order);

        cartItemRepository.deleteByUserId(user.getId());

        return ResponseEntity.ok(Map.of(
            "message", "Order placed successfully",
            "orderId", order.getId(),
            "totalAmount", total
        ));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getOrder(@AuthenticationPrincipal UserDetails ud,
                                       @PathVariable Integer id) {
        return orderRepository.findById(id).map(order -> {
            if (!order.getUser().getUsername().equals(ud.getUsername()))
                return ResponseEntity.status(403).<Object>body(Map.of("message", "Forbidden"));
            return ResponseEntity.ok((Object) order);
        }).orElse(ResponseEntity.notFound().build());
    }

    @Transactional
    @PutMapping("/{id}/cancel")
    public ResponseEntity<?> cancelOrder(@AuthenticationPrincipal UserDetails ud,
                                          @PathVariable Integer id) {
        return orderRepository.findById(id).map(order -> {
            if (!order.getUser().getUsername().equals(ud.getUsername()))
                return ResponseEntity.status(403).<Object>body(Map.of("message", "Forbidden"));
            if (!order.getStatus().equals("PENDING"))
                return ResponseEntity.badRequest().<Object>body(Map.of("message", "Only PENDING orders can be cancelled"));

            // Restore stock on cancel
            for (OrderItem oi : order.getOrderItems()) {
                Product product = oi.getProduct();
                product.setStock(product.getStock() + oi.getQuantity());
                productRepository.save(product);
            }

            order.setStatus("CANCELLED");
            orderRepository.save(order);
            return ResponseEntity.ok((Object) Map.of("message", "Order cancelled"));
        }).orElse(ResponseEntity.notFound().build());
    }
}
