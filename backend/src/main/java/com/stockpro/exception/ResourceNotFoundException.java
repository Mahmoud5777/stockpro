package com.stockpro.exception;

import java.util.UUID;

public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }

    public ResourceNotFoundException(String entity, UUID id) {
        super(entity + " introuvable avec id : " + id);
    }
}
