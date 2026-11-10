package com.stockpro.entity.stock;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "PRODUIT")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {

@Id
@Column(name = "ID_PRODUIT", length = 32,nullable = false, updatable = false)
private UUID id;

@Column(name = "", length = 150, nullable = false)
private String name;

@Column(name = "")
private Double price;

@Column(name = "")
private Boolean active;

        @PrePersist
        public void prePersist() {
        if (this.id == null) {
        this.id = UUID.randomUUID();
        }
        }
        }