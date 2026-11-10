package com.stockpro.mapper.stock;

import com.stockpro.dto.stock.ProductDTO;
import com.stockpro.entity.stock.Product;
import org.springframework.stereotype.Component;

@Component
public class ProductMapper {

    public ProductDTO toDto(Product entity) {
        if (entity == null) {
            return null;
        }
        ProductDTO.ProductDTOBuilder builder = ProductDTO.builder()
                .id(entity.getId())
                .name(entity.getName())
                .price(entity.getPrice())
                .active(entity.getActive())
;
        return builder.build();
    }

    public Product toEntity(ProductDTO dto) {
        if (dto == null) {
            return null;
        }
        Product.ProductBuilder builder = Product.builder()
                .id(dto.getId())
                .name(dto.getName())
                .price(dto.getPrice())
                .active(dto.getActive())
;
        return builder.build();
    }
}