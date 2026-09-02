package com.stockpro.dto.crm;

import jakarta.validation.constraints.*;
import lombok.*;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CustomerDTO {

private UUID id;

@NotBlank(message = "Le nom complet est obligatoire")
private String fullName;

private String email;

}