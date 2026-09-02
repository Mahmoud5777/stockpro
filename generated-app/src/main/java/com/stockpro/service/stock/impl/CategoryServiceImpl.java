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
                return categoryRepository.findAll(pageable).map(mapper::toDto);
                }

                @Override
                @Transactional(readOnly = true)
                public List<CategoryDTO> findAllForExport(String search, Map<String, String> filters) {
                        return categoryRepository.findAll().stream()
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
                        return mapper.toDto(categoryRepository.save(existing));
                        }

                        @Override
                        public void delete(UUID id) {
                        categoryRepository.delete(getEntity(id));
                        }

                        private Category getEntity(UUID id) {
                        return categoryRepository.findById(id)
                        .orElseThrow(() -> new ResourceNotFoundException("Category", id));
                        }
                        }