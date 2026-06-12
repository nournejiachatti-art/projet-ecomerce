package com.ecommerce.backend.repository;

import com.ecommerce.backend.model.InvoiceItem;
import com.ecommerce.backend.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface InvoiceItemRepository extends JpaRepository<InvoiceItem, Long> {
    List<InvoiceItem> findByProduct(Product product);
    void deleteByProduct(Product product);
}