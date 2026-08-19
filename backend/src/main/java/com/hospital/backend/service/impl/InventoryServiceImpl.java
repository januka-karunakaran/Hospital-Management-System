package com.hospital.backend.service.impl;

import com.hospital.backend.model.InventoryItem;
import com.hospital.backend.repository.InventoryRepository;
import com.hospital.backend.service.InventoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class InventoryServiceImpl implements InventoryService {

    private final InventoryRepository inventoryRepository;

    @Override
    public InventoryItem addItem(InventoryItem item) {
        return inventoryRepository.save(item);
    }

    @Override
    public List<InventoryItem> getAllItems() {
        return inventoryRepository.findAll();
    }

    @Override
    public InventoryItem updateStock(String id, Integer quantity) {
        InventoryItem item = inventoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Item not found"));
        
        item.setStockLevel(item.getStockLevel() + quantity);
        if (item.getStockLevel() < 0) item.setStockLevel(0);
        
        return inventoryRepository.save(item);
    }

    @Override
    public List<InventoryItem> getLowStockItems() {
        return inventoryRepository.findAll().stream()
                .filter(item -> item.getStockLevel() <= item.getReorderLevel())
                .collect(java.util.stream.Collectors.toList());
    }
}
