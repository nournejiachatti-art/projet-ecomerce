package com.ecommerce.backend.repository;

import com.ecommerce.backend.model.OrderItem;
import com.ecommerce.backend.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
    
    List<OrderItem> findByProduct(Product product);
    
    void deleteByProduct(Product product);
    
    @Modifying
    @Transactional
    @Query("DELETE FROM OrderItem oi WHERE oi.order.id = ?1")
    void deleteByOrderId(Long orderId);
    
    List<OrderItem> findByOrderId(Long orderId);
}