package com.stockpro.service.crm;

import com.stockpro.dto.crm.CustomerDTO;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Map;
import java.util.UUID;

public interface CustomerService {
List<CustomerDTO> findAll();
    Page<CustomerDTO> findAll(Pageable pageable);
        Page<CustomerDTO> findAll(String search, Map<String, String> filters, Pageable pageable);
                List<CustomerDTO> findAllForExport(String search, Map<String, String> filters);
                        CustomerDTO findById(UUID id);
                        CustomerDTO create(CustomerDTO dto);
                        CustomerDTO update(UUID id, CustomerDTO dto);
                        void delete(UUID id);
                        }