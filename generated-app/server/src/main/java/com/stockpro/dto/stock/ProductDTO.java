package com.stockpro.dto.stock;

import jakarta.validation.constraints.*;
import lombok.*;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductDTO {

private UUID id;

@NotBlank(message = "Le nom est obligatoire")
private String name;

private Double price;

private Boolean active;

}
