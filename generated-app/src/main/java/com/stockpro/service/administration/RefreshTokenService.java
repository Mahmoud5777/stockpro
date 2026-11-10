package com.stockpro.service.administration;

import com.stockpro.entity.administration.RefreshToken;
import com.stockpro.entity.administration.User;

public interface RefreshTokenService {

    RefreshToken create(User user);

    RefreshToken findByToken(String token);

    RefreshToken verify(RefreshToken token);

    void revoke(RefreshToken token);

    void revokeAllForUser(User user);

    RefreshToken rotate(RefreshToken oldToken);
}
