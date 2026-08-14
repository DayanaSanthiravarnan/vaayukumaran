package com.ecommerce.app.controller;

import com.ecommerce.app.model.Order;
import com.ecommerce.app.repository.OrderRepository;
import com.ecommerce.app.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;

    @GetMapping("/orders")
    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    @PutMapping("/orders/{id}/status")
    public ResponseEntity<?> updateOrderStatus(@PathVariable Integer id,
                                                @RequestBody Map<String, String> body) {
        String status = body.get("status");
        List<String> validStatuses = List.of("PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED");
        if (status == null || !validStatuses.contains(status))
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid status. Valid: " + validStatuses));

        return orderRepository.findById(id).map(order -> {
            order.setStatus(status);
            orderRepository.save(order);
            return ResponseEntity.ok(Map.of("message", "Order status updated to " + status));
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/users/orders/{userId}")
    public ResponseEntity<?> getOrdersByUser(@PathVariable Integer userId) {
        List<Order> orders = orderRepository.findByUserId(userId);
        if (orders.isEmpty())
            return ResponseEntity.ok(Map.of("message", "No orders found for this user"));
        return ResponseEntity.ok(orders);
    }
}
