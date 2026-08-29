package com.stockpro.service.administration.impl;

import com.stockpro.dto.administration.SdDTO;
import com.stockpro.entity.administration.Sd;
import com.stockpro.exception.ResourceNotFoundException;
import com.stockpro.mapper.administration.SdMapper;
import com.stockpro.repository.administration.SdRepository;
import com.stockpro.service.administration.SdService;
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
public class SdServiceImpl implements SdService {

private final SdRepository sdRepository;
private final SdMapper mapper;

@Override
@Transactional(readOnly = true)
public List<SdDTO> findAll() {
    return sdRepository.findAll().stream()
    .map(mapper::toDto)
    .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<SdDTO> findAll(Pageable pageable) {
        return sdRepository.findAll(pageable).map(mapper::toDto);
        }

        @Override
        @Transactional(readOnly = true)
        public Page<SdDTO> findAll(String search, Map<String, String> filters, Pageable pageable) {
                return sdRepository.findAll(pageable).map(mapper::toDto);
                }


                        @Override
                        @Transactional(readOnly = true)
                        public SdDTO findById(UUID id) {
                        return mapper.toDto(getEntity(id));
                        }

                        @Override
                        public SdDTO create(SdDTO dto) {
                        Sd entity = mapper.toEntity(dto);
                        entity.setId(null);
                        return mapper.toDto(sdRepository.save(entity));
                        }

                        @Override
                        public SdDTO update(UUID id, SdDTO dto) {
                        Sd existing = getEntity(id);
                        return mapper.toDto(sdRepository.save(existing));
                        }

                        @Override
                        public void delete(UUID id) {
                        sdRepository.delete(getEntity(id));
                        }

                        private Sd getEntity(UUID id) {
                        return sdRepository.findById(id)
                        .orElseThrow(() -> new ResourceNotFoundException("Sd", id));
                        }
                        }