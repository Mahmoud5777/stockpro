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
import org.springframework.data.jpa.domain.Specification;
import jakarta.persistence.criteria.Predicate;
import java.util.ArrayList;
import java.util.Locale;

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
                return productRepository.findAll(criteria(search, filters), pageable).map(mapper::toDto);
                }

                @Override
                @Transactional(readOnly = true)
                public List<ProductDTO> findAllForExport(String search, Map<String, String> filters) {
                        return productRepository.findAll(criteria(search, filters)).stream()
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
                        existing.setName(dto.getName());
                        existing.setPrice(dto.getPrice());
                        existing.setActive(dto.getActive());
                        return mapper.toDto(productRepository.save(existing));
                        }

                        @Override
                        public void delete(UUID id) {
                        productRepository.delete(getEntity(id));
                        }

                        private Specification<Product> criteria(String search, Map<String, String> filters) {
                            return (root, query, cb) -> {
                                List<Predicate> predicates = new ArrayList<>();
                                if (search != null && !search.isBlank()) {
                                    String pattern = "%" + search.toLowerCase(Locale.ROOT)
                                        .replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_") + "%";
                                    List<Predicate> matches = new ArrayList<>();
                                    matches.add(cb.like(cb.lower(root.get("name")), pattern, '\\'));
                                    if (!matches.isEmpty()) predicates.add(cb.or(matches.toArray(new Predicate[0])));
                                }
                                if (filters != null) {
                                    if (filters.containsKey("name") && !filters.get("name").isBlank()) {
                                        String value = filters.get("name");
                                        predicates.add(cb.equal(root.get("name"), value));
                                    }
                                    if (filters.containsKey("price") && !filters.get("price").isBlank()) {
                                        String value = filters.get("price");
                                        predicates.add(cb.equal(root.get("price"), Double.valueOf(value)));
                                    }
                                    if (filters.containsKey("active") && !filters.get("active").isBlank()) {
                                        String value = filters.get("active");
                                        predicates.add(cb.equal(root.get("active"), Boolean.valueOf(value)));
                                    }
                                }
                                return cb.and(predicates.toArray(new Predicate[0]));
                            };
                        }

                        private Product getEntity(UUID id) {
                        return productRepository.findById(id)
                        .orElseThrow(() -> new ResourceNotFoundException("Product", id));
                        }
                        }
