package com.stockpro.service.stock;

import com.stockpro.dto.stock.CategoryDTO;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Map;
import java.util.UUID;

public interface CategoryService {
List<CategoryDTO> findAll();
    Page<CategoryDTO> findAll(Pageable pageable);
        Page<CategoryDTO> findAll(String search, Map<String, String> filters, Pageable pageable);
                List<CategoryDTO> findAllForExport(String search, Map<String, String> filters);
                        CategoryDTO findById(UUID id);
                        CategoryDTO create(CategoryDTO dto);
                        CategoryDTO update(UUID id, CategoryDTO dto);
                        void delete(UUID id);
                        }