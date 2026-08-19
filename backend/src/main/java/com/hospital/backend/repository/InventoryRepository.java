package com.hospital.backend.repository;

import com.hospital.backend.model.InventoryItem;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface InventoryRepository extends MongoRepository<InventoryItem, String> {
    List<InventoryItem> findByCategory(String category);
    List<InventoryItem> findByStockLevelLessThanEqual(Integer level);
}
