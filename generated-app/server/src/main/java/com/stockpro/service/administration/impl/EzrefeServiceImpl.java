package com.stockpro.service.administration.impl;

import com.stockpro.dto.administration.EzrefeDTO;
import com.stockpro.entity.administration.Ezrefe;
import com.stockpro.exception.ResourceNotFoundException;
import com.stockpro.mapper.administration.EzrefeMapper;
import com.stockpro.repository.administration.EzrefeRepository;
import com.stockpro.service.administration.EzrefeService;
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
public class EzrefeServiceImpl implements EzrefeService {

private final EzrefeRepository ezrefeRepository;
private final EzrefeMapper mapper;

@Override
@Transactional(readOnly = true)
public List<EzrefeDTO> findAll() {
    return ezrefeRepository.findAll().stream()
    .map(mapper::toDto)
    .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<EzrefeDTO> findAll(Pageable pageable) {
        return ezrefeRepository.findAll(pageable).map(mapper::toDto);
        }

        @Override
        @Transactional(readOnly = true)
        public Page<EzrefeDTO> findAll(String search, Map<String, String> filters, Pageable pageable) {
                return ezrefeRepository.findAll(pageable).map(mapper::toDto);
                }


                        @Override
                        @Transactional(readOnly = true)
                        public EzrefeDTO findById(UUID id) {
                        return mapper.toDto(getEntity(id));
                        }

                        @Override
                        public EzrefeDTO create(EzrefeDTO dto) {
                        Ezrefe entity = mapper.toEntity(dto);
                        entity.setId(null);
                        return mapper.toDto(ezrefeRepository.save(entity));
                        }

                        @Override
                        public EzrefeDTO update(UUID id, EzrefeDTO dto) {
                        Ezrefe existing = getEntity(id);
                        return mapper.toDto(ezrefeRepository.save(existing));
                        }

                        @Override
                        public void delete(UUID id) {
                        ezrefeRepository.delete(getEntity(id));
                        }

                        private Ezrefe getEntity(UUID id) {
                        return ezrefeRepository.findById(id)
                        .orElseThrow(() -> new ResourceNotFoundException("Ezrefe", id));
                        }
                        }