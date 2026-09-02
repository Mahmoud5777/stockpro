package com.stockpro.service.stock.impl;

import com.stockpro.dto.stock.ProductDTO;
import com.stockpro.entity.stock.Product;
import com.stockpro.exception.ResourceNotFoundException;
import com.stockpro.mapper.stock.ProductMapper;
import com.stockpro.repository.stock.ProductRepository;
import com.stockpro.service.stock.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ProductServiceImpl implements ProductService {

private final ProductRepository productRepository;
private final ProductMapper mapper;

@Override
@Transactional(readOnly = true)
public List<ProductDTO> findAll() {
    return productRepository.findAll().stream()
    .map(mapper::toDto)
    .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ProductDTO> findAll(Pageable pageable) {
        return productRepository.findAll(pageable).map(mapper::toDto);
        }

        @Override
        @Transactional(readOnly = true)
        public Page<ProductDTO> findAll(String search, Map<String, String> filters, Pageable pageable) {
                return productRepository.findAll(pageable).map(mapper::toDto);
                }

                @Override
                @Transactional(readOnly = true)
                public List<ProductDTO> findAllForExport(String search, Map<String, String> filters) {
                        return productRepository.findAll().stream()
                        .map(mapper::toDto)
                        .collect(Collectors.toList());
                        }

                        @Override
                        @Transactional(readOnly = true)
                        public ProductDTO findById(UUID id) {
                        return mapper.toDto(getEntity(id));
                        }

                        @Override
                        public ProductDTO create(ProductDTO dto) {
                        Product entity = mapper.toEntity(dto);
                        entity.setId(null);
                        return mapper.toDto(productRepository.save(entity));
                        }

                        @Override
                        public ProductDTO update(UUID id, ProductDTO dto) {
                        Product existing = getEntity(id);
                        return mapper.toDto(productRepository.save(existing));
                        }

                        @Override
                        public void delete(UUID id) {
                        productRepository.delete(getEntity(id));
                        }

                        private Product getEntity(UUID id) {
                        return productRepository.findById(id)
                        .orElseThrow(() -> new ResourceNotFoundException("Product", id));
                        }
                        }