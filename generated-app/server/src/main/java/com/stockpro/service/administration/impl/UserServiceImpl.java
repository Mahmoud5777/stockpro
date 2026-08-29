package com.stockpro.service.administration.impl;

import com.stockpro.dto.administration.UserDTO;
import com.stockpro.entity.administration.User;
import com.stockpro.exception.ResourceNotFoundException;
import com.stockpro.mapper.administration.UserMapper;
import com.stockpro.repository.administration.UserRepository;
import com.stockpro.service.administration.UserService;
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
public class UserServiceImpl implements UserService {

private final UserRepository userRepository;
private final UserMapper mapper;

@Override
@Transactional(readOnly = true)
public List<UserDTO> findAll() {
    return userRepository.findAll().stream()
    .map(mapper::toDto)
    .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<UserDTO> findAll(Pageable pageable) {
        return userRepository.findAll(pageable).map(mapper::toDto);
        }

        @Override
        @Transactional(readOnly = true)
        public Page<UserDTO> findAll(String search, Map<String, String> filters, Pageable pageable) {
                return userRepository.findAll(pageable).map(mapper::toDto);
                }


                        @Override
                        @Transactional(readOnly = true)
                        public UserDTO findById(UUID id) {
                        return mapper.toDto(getEntity(id));
                        }

                        @Override
                        public UserDTO create(UserDTO dto) {
                        User entity = mapper.toEntity(dto);
                        entity.setId(null);
                        return mapper.toDto(userRepository.save(entity));
                        }

                        @Override
                        public UserDTO update(UUID id, UserDTO dto) {
                        User existing = getEntity(id);
                        return mapper.toDto(userRepository.save(existing));
                        }

                        @Override
                        public void delete(UUID id) {
                        userRepository.delete(getEntity(id));
                        }

                        private User getEntity(UUID id) {
                        return userRepository.findById(id)
                        .orElseThrow(() -> new ResourceNotFoundException("User", id));
                        }
                        }