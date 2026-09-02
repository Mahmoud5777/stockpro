package com.stockpro.mapper.stock;

import com.stockpro.dto.stock.CategoryDTO;
import com.stockpro.entity.stock.Category;
import org.springframework.stereotype.Component;

@Component
public class CategoryMapper {

    public CategoryDTO toDto(Category entity) {
        if (entity == null) {
            return null;
        }
        CategoryDTO.CategoryDTOBuilder builder = CategoryDTO.builder()
                .id(entity.getId())
                .name(entity.getName())
;
        return builder.build();
    }

    public Category toEntity(CategoryDTO dto) {
        if (dto == null) {
            return null;
        }
        Category.CategoryBuilder builder = Category.builder()
                .id(dto.getId())
                .name(dto.getName())
;
        return builder.build();
    }
}