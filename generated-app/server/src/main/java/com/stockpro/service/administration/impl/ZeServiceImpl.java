package com.stockpro.service.administration.impl;

import com.stockpro.dto.administration.ZeDTO;
import com.stockpro.entity.administration.Ze;
import com.stockpro.exception.ResourceNotFoundException;
import com.stockpro.mapper.administration.ZeMapper;
import com.stockpro.repository.administration.ZeRepository;
import com.stockpro.service.administration.ZeService;
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
public class ZeServiceImpl implements ZeService {

private final ZeRepository zeRepository;
private final ZeMapper mapper;

@Override
@Transactional(readOnly = true)
public List<ZeDTO> findAll() {
    return zeRepository.findAll().stream()
    .map(mapper::toDto)
    .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ZeDTO> findAll(Pageable pageable) {
        return zeRepository.findAll(pageable).map(mapper::toDto);
        }

        @Override
        @Transactional(readOnly = true)
        public Page<ZeDTO> findAll(String search, Map<String, String> filters, Pageable pageable) {
                return zeRepository.findAll(pageable).map(mapper::toDto);
                }


                        @Override
                        @Transactional(readOnly = true)
                        public ZeDTO findById(UUID id) {
                        return mapper.toDto(getEntity(id));
                        }

                        @Override
                        public ZeDTO create(ZeDTO dto) {
                        Ze entity = mapper.toEntity(dto);
                        entity.setId(null);
                        return mapper.toDto(zeRepository.save(entity));
                        }

                        @Override
                        public ZeDTO update(UUID id, ZeDTO dto) {
                        Ze existing = getEntity(id);
                        return mapper.toDto(zeRepository.save(existing));
                        }

                        @Override
                        public void delete(UUID id) {
                        zeRepository.delete(getEntity(id));
                        }

                        private Ze getEntity(UUID id) {
                        return zeRepository.findById(id)
                        .orElseThrow(() -> new ResourceNotFoundException("Ze", id));
                        }
                        }