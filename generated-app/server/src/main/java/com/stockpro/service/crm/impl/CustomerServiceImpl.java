package com.stockpro.service.crm.impl;

import com.stockpro.dto.crm.CustomerDTO;
import com.stockpro.entity.crm.Customer;
import com.stockpro.exception.ResourceNotFoundException;
import com.stockpro.mapper.crm.CustomerMapper;
import com.stockpro.repository.crm.CustomerRepository;
import com.stockpro.service.crm.CustomerService;
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
public class CustomerServiceImpl implements CustomerService {

private final CustomerRepository customerRepository;
private final CustomerMapper mapper;

@Override
@Transactional(readOnly = true)
public List<CustomerDTO> findAll() {
    return customerRepository.findAll().stream()
    .map(mapper::toDto)
    .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<CustomerDTO> findAll(Pageable pageable) {
        return customerRepository.findAll(pageable).map(mapper::toDto);
        }

        @Override
        @Transactional(readOnly = true)
        public Page<CustomerDTO> findAll(String search, Map<String, String> filters, Pageable pageable) {
                return customerRepository.findAll(criteria(search, filters), pageable).map(mapper::toDto);
                }

                @Override
                @Transactional(readOnly = true)
                public List<CustomerDTO> findAllForExport(String search, Map<String, String> filters) {
                        return customerRepository.findAll(criteria(search, filters)).stream()
                        .map(mapper::toDto)
                        .collect(Collectors.toList());
                        }

                        @Override
                        @Transactional(readOnly = true)
                        public CustomerDTO findById(UUID id) {
                        return mapper.toDto(getEntity(id));
                        }

                        @Override
                        public CustomerDTO create(CustomerDTO dto) {
                        Customer entity = mapper.toEntity(dto);
                        entity.setId(null);
                        return mapper.toDto(customerRepository.save(entity));
                        }

                        @Override
                        public CustomerDTO update(UUID id, CustomerDTO dto) {
                        Customer existing = getEntity(id);
                        existing.setFullName(dto.getFullName());
                        existing.setEmail(dto.getEmail());
                        return mapper.toDto(customerRepository.save(existing));
                        }

                        @Override
                        public void delete(UUID id) {
                        customerRepository.delete(getEntity(id));
                        }

                        private Specification<Customer> criteria(String search, Map<String, String> filters) {
                            return (root, query, cb) -> {
                                List<Predicate> predicates = new ArrayList<>();
                                if (search != null && !search.isBlank()) {
                                    String pattern = "%" + search.toLowerCase(Locale.ROOT)
                                        .replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_") + "%";
                                    List<Predicate> matches = new ArrayList<>();
                                    matches.add(cb.like(cb.lower(root.get("fullName")), pattern, '\\'));
                                    matches.add(cb.like(cb.lower(root.get("email")), pattern, '\\'));
                                    if (!matches.isEmpty()) predicates.add(cb.or(matches.toArray(new Predicate[0])));
                                }
                                if (filters != null) {
                                    if (filters.containsKey("fullName") && !filters.get("fullName").isBlank()) {
                                        String value = filters.get("fullName");
                                        predicates.add(cb.equal(root.get("fullName"), value));
                                    }
                                    if (filters.containsKey("email") && !filters.get("email").isBlank()) {
                                        String value = filters.get("email");
                                        predicates.add(cb.equal(root.get("email"), value));
                                    }
                                }
                                return cb.and(predicates.toArray(new Predicate[0]));
                            };
                        }

                        private Customer getEntity(UUID id) {
                        return customerRepository.findById(id)
                        .orElseThrow(() -> new ResourceNotFoundException("Customer", id));
                        }
                        }
