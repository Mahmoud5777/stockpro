package com.stockpro.service.stock.impl;

import com.stockpro.dto.stock.CategoryDTO;
import com.stockpro.entity.stock.Category;
import com.stockpro.exception.ResourceNotFoundException;
import com.stockpro.mapper.stock.CategoryMapper;
import com.stockpro.repository.stock.CategoryRepository;
import com.stockpro.service.stock.CategoryService;
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
public class CategoryServiceImpl implements CategoryService {

private final CategoryRepository categoryRepository;
private final CategoryMapper mapper;

@Override
@Transactional(readOnly = true)
public List<CategoryDTO> findAll() {
    return categoryRepository.findAll().stream()
    .map(mapper::toDto)
    .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<CategoryDTO> findAll(Pageable pageable) {
        return categoryRepository.findAll(pageable).map(mapper::toDto);
        }

        @Override
        @Transactional(readOnly = true)
        public Page<CategoryDTO> findAll(String search, Map<String, String> filters, Pageable pageable) {
                return categoryRepository.findAll(criteria(search, filters), pageable).map(mapper::toDto);
                }

                @Override
                @Transactional(readOnly = true)
                public List<CategoryDTO> findAllForExport(String search, Map<String, String> filters) {
                        return categoryRepository.findAll(criteria(search, filters)).stream()
                        .map(mapper::toDto)
                        .collect(Collectors.toList());
                        }

                        @Override
                        @Transactional(readOnly = true)
                        public CategoryDTO findById(UUID id) {
                        return mapper.toDto(getEntity(id));
                        }

                        @Override
                        public CategoryDTO create(CategoryDTO dto) {
                        Category entity = mapper.toEntity(dto);
                        entity.setId(null);
                        return mapper.toDto(categoryRepository.save(entity));
                        }

                        @Override
                        public CategoryDTO update(UUID id, CategoryDTO dto) {
                        Category existing = getEntity(id);
                        existing.setName(dto.getName());
                        return mapper.toDto(categoryRepository.save(existing));
                        }

                        @Override
                        public void delete(UUID id) {
                        categoryRepository.delete(getEntity(id));
                        }

                        private Specification<Category> criteria(String search, Map<String, String> filters) {
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
                                }
                                return cb.and(predicates.toArray(new Predicate[0]));
                            };
                        }

                        private Category getEntity(UUID id) {
                        return categoryRepository.findById(id)
                        .orElseThrow(() -> new ResourceNotFoundException("Category", id));
                        }
                        }
