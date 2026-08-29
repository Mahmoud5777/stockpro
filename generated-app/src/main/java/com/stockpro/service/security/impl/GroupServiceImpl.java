package com.stockpro.service.security.impl;

import com.stockpro.dto.security.GroupDTO;
import com.stockpro.entity.security.Group;
import com.stockpro.exception.ResourceNotFoundException;
import com.stockpro.mapper.security.GroupMapper;
import com.stockpro.repository.security.GroupRepository;
import com.stockpro.service.security.GroupService;
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
public class GroupServiceImpl implements GroupService {

private final GroupRepository groupRepository;
private final GroupMapper mapper;

@Override
@Transactional(readOnly = true)
public List<GroupDTO> findAll() {
    return groupRepository.findAll().stream()
    .map(mapper::toDto)
    .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<GroupDTO> findAll(Pageable pageable) {
        return groupRepository.findAll(pageable).map(mapper::toDto);
        }

        @Override
        @Transactional(readOnly = true)
        public Page<GroupDTO> findAll(String search, Map<String, String> filters, Pageable pageable) {
                return groupRepository.findAll(pageable).map(mapper::toDto);
                }

                @Override
                @Transactional(readOnly = true)
                public List<GroupDTO> findAllForExport(String search, Map<String, String> filters) {
                        return groupRepository.findAll().stream()
                        .map(mapper::toDto)
                        .collect(Collectors.toList());
                        }

                        @Override
                        @Transactional(readOnly = true)
                        public GroupDTO findById(UUID id) {
                        return mapper.toDto(getEntity(id));
                        }

                        @Override
                        public GroupDTO create(GroupDTO dto) {
                        Group entity = mapper.toEntity(dto);
                        entity.setId(null);
                        return mapper.toDto(groupRepository.save(entity));
                        }

                        @Override
                        public GroupDTO update(UUID id, GroupDTO dto) {
                        Group existing = getEntity(id);
                        existing.setDescription(dto.getDescription());
                        return mapper.toDto(groupRepository.save(existing));
                        }

                        @Override
                        public void delete(UUID id) {
                        groupRepository.delete(getEntity(id));
                        }

                        private Group getEntity(UUID id) {
                        return groupRepository.findById(id)
                        .orElseThrow(() -> new ResourceNotFoundException("Group", id));
                        }
                        }