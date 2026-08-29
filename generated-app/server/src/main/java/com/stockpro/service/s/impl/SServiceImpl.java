package com.stockpro.service.s.impl;

import com.stockpro.dto.s.SDTO;
import com.stockpro.entity.s.S;
import com.stockpro.exception.ResourceNotFoundException;
import com.stockpro.mapper.s.SMapper;
import com.stockpro.repository.s.SRepository;
import com.stockpro.service.s.SService;
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
public class SServiceImpl implements SService {

private final SRepository sRepository;
private final SMapper mapper;

@Override
@Transactional(readOnly = true)
public List<SDTO> findAll() {
    return sRepository.findAll().stream()
    .map(mapper::toDto)
    .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<SDTO> findAll(Pageable pageable) {
        return sRepository.findAll(pageable).map(mapper::toDto);
        }

        @Override
        @Transactional(readOnly = true)
        public Page<SDTO> findAll(String search, Map<String, String> filters, Pageable pageable) {
                return sRepository.findAll(pageable).map(mapper::toDto);
                }


                        @Override
                        @Transactional(readOnly = true)
                        public SDTO findById(UUID id) {
                        return mapper.toDto(getEntity(id));
                        }

                        @Override
                        public SDTO create(SDTO dto) {
                        S entity = mapper.toEntity(dto);
                        entity.setId(null);
                        return mapper.toDto(sRepository.save(entity));
                        }

                        @Override
                        public SDTO update(UUID id, SDTO dto) {
                        S existing = getEntity(id);
                        return mapper.toDto(sRepository.save(existing));
                        }

                        @Override
                        public void delete(UUID id) {
                        sRepository.delete(getEntity(id));
                        }

                        private S getEntity(UUID id) {
                        return sRepository.findById(id)
                        .orElseThrow(() -> new ResourceNotFoundException("S", id));
                        }
                        }