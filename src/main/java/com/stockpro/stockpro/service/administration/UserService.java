package com.stockpro.stockpro.service.administration;

import com.stockpro.stockpro.entity.administration.User;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface UserService {
    List<User> findAll();
    Page<User> findAll(Pageable pageable);
    Page<User> search(String query, Pageable pageable);
    User findById(String id);
    User findByLogin(String login);
    User create(User user);
    User update(String id, User user);
    void delete(String id);
}
