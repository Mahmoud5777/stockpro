package com.stockpro.service.stock;

import com.stockpro.dto.stock.ProductDTO;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Map;
import java.util.UUID;

public interface ProductService {
List<ProductDTO> findAll();
    Page<ProductDTO> findAll(Pageable pageable);
        Page<ProductDTO> findAll(String search, Map<String, String> filters, Pageable pageable);
                List<ProductDTO> findAllForExport(String search, Map<String, String> filters);
                        ProductDTO findById(UUID id);
                        ProductDTO create(ProductDTO dto);
                        ProductDTO update(UUID id, ProductDTO dto);
                        void delete(UUID id);
                        }