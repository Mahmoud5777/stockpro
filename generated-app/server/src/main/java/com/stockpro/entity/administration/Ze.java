package com.stockpro.entity.administration;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "ZE")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Ze {

@Id
@Column(name = "ZE_ID",, length = 32, nullable = false, updatable = false)
private UUID id;

        @PrePersist
        public void prePersist() {
        if (this.id == null) {
        this.id = UUID.randomUUID();
        }
        }
        }