package com.stockpro.entity.stock;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "CATEGORIE")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Category {

@Id
@Column(name = "ID_CATEGORIE", length = 32,nullable = false, updatable = false)
private UUID id;

@Column(name = "", length = 100, nullable = false)
private String name;

        @PrePersist
        public void prePersist() {
        if (this.id == null) {
        this.id = UUID.randomUUID();
        }
        }
        }
