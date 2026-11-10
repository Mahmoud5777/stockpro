package com.stockpro.mapper.crm;

import com.stockpro.dto.crm.CustomerDTO;
import com.stockpro.entity.crm.Customer;
import org.springframework.stereotype.Component;

@Component
public class CustomerMapper {

    public CustomerDTO toDto(Customer entity) {
        if (entity == null) {
            return null;
        }
        CustomerDTO.CustomerDTOBuilder builder = CustomerDTO.builder()
                .id(entity.getId())
                .fullName(entity.getFullName())
                .email(entity.getEmail())
;
        return builder.build();
    }

    public Customer toEntity(CustomerDTO dto) {
        if (dto == null) {
            return null;
        }
        Customer.CustomerBuilder builder = Customer.builder()
                .id(dto.getId())
                .fullName(dto.getFullName())
                .email(dto.getEmail())
;
        return builder.build();
    }
}