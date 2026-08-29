package com.stockpro.entity.administration;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "ERZR")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Erzr {

@Id
@Column(name = "ERZR_ID",, length = 32, nullable = false, updatable = false)
private UUID id;

        @PrePersist
        public void prePersist() {
        if (this.id == null) {
        this.id = UUID.randomUUID();
        }
        }
        }