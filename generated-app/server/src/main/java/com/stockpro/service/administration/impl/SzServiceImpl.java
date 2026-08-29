package com.stockpro.service.administration.impl;

import com.stockpro.dto.administration.SzDTO;
import com.stockpro.entity.administration.Sz;
import com.stockpro.exception.ResourceNotFoundException;
import com.stockpro.mapper.administration.SzMapper;
import com.stockpro.repository.administration.SzRepository;
import com.stockpro.service.administration.SzService;
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
public class SzServiceImpl implements SzService {

private final SzRepository szRepository;
private final SzMapper mapper;

@Override
@Transactional(readOnly = true)
public List<SzDTO> findAll() {
    return szRepository.findAll().stream()
    .map(mapper::toDto)
    .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<SzDTO> findAll(Pageable pageable) {
        return szRepository.findAll(pageable).map(mapper::toDto);
        }

        @Override
        @Transactional(readOnly = true)
        public Page<SzDTO> findAll(String search, Map<String, String> filters, Pageable pageable) {
                return szRepository.findAll(pageable).map(mapper::toDto);
                }


                        @Override
                        @Transactional(readOnly = true)
                        public SzDTO findById(UUID id) {
                        return mapper.toDto(getEntity(id));
                        }

                        @Override
                        public SzDTO create(SzDTO dto) {
                        Sz entity = mapper.toEntity(dto);
                        entity.setId(null);
                        return mapper.toDto(szRepository.save(entity));
                        }

                        @Override
                        public SzDTO update(UUID id, SzDTO dto) {
                        Sz existing = getEntity(id);
                        return mapper.toDto(szRepository.save(existing));
                        }

                        @Override
                        public void delete(UUID id) {
                        szRepository.delete(getEntity(id));
                        }

                        private Sz getEntity(UUID id) {
                        return szRepository.findById(id)
                        .orElseThrow(() -> new ResourceNotFoundException("Sz", id));
                        }
                        }