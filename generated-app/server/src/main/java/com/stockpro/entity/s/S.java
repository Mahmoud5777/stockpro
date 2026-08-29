package com.stockpro.entity.s;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "S")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class S {

@Id
@Column(name = "S_ID",, length = 32, nullable = false, updatable = false)
private UUID id;

        @PrePersist
        public void prePersist() {
        if (this.id == null) {
        this.id = UUID.randomUUID();
        }
        }
        }