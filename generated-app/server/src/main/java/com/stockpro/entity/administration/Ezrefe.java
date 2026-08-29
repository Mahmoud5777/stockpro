package com.stockpro.entity.administration;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "EZREFE")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Ezrefe {

@Id
@Column(name = "EZREFE_ID",, length = 32, nullable = false, updatable = false)
private UUID id;

        @PrePersist
        public void prePersist() {
        if (this.id == null) {
        this.id = UUID.randomUUID();
        }
        }
        }