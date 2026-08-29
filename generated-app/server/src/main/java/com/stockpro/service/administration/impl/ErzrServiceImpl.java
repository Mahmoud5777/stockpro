package com.stockpro.service.administration.impl;

import com.stockpro.dto.administration.ErzrDTO;
import com.stockpro.entity.administration.Erzr;
import com.stockpro.exception.ResourceNotFoundException;
import com.stockpro.mapper.administration.ErzrMapper;
import com.stockpro.repository.administration.ErzrRepository;
import com.stockpro.service.administration.ErzrService;
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
public class ErzrServiceImpl implements ErzrService {

private final ErzrRepository erzrRepository;
private final ErzrMapper mapper;

@Override
@Transactional(readOnly = true)
public List<ErzrDTO> findAll() {
    return erzrRepository.findAll().stream()
    .map(mapper::toDto)
    .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ErzrDTO> findAll(Pageable pageable) {
        return erzrRepository.findAll(pageable).map(mapper::toDto);
        }

        @Override
        @Transactional(readOnly = true)
        public Page<ErzrDTO> findAll(String search, Map<String, String> filters, Pageable pageable) {
                return erzrRepository.findAll(pageable).map(mapper::toDto);
                }


                        @Override
                        @Transactional(readOnly = true)
                        public ErzrDTO findById(UUID id) {
                        return mapper.toDto(getEntity(id));
                        }

                        @Override
                        public ErzrDTO create(ErzrDTO dto) {
                        Erzr entity = mapper.toEntity(dto);
                        entity.setId(null);
                        return mapper.toDto(erzrRepository.save(entity));
                        }

                        @Override
                        public ErzrDTO update(UUID id, ErzrDTO dto) {
                        Erzr existing = getEntity(id);
                        return mapper.toDto(erzrRepository.save(existing));
                        }

                        @Override
                        public void delete(UUID id) {
                        erzrRepository.delete(getEntity(id));
                        }

                        private Erzr getEntity(UUID id) {
                        return erzrRepository.findById(id)
                        .orElseThrow(() -> new ResourceNotFoundException("Erzr", id));
                        }
                        }