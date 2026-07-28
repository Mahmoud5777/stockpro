package com.stockpro.exception;

public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }

    public ResourceNotFoundException(String entity, String id) {
        super(entity + " introuvable avec id : " + id);
    }
}
