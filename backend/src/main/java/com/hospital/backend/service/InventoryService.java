package com.hospital.backend.service;

import com.hospital.backend.model.InventoryItem;
import java.util.List;

public interface InventoryService {
    InventoryItem addItem(InventoryItem item);
    List<InventoryItem> getAllItems();
    InventoryItem updateStock(String id, Integer quantity); // Positive for add, negative for consume
    List<InventoryItem> getLowStockItems();
}
