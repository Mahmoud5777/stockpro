package com.stockpro.entity.crm;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "CLIENT")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Customer {

@Id
@Column(name = "ID_CLIENT", length = 32,nullable = false, updatable = false)
private UUID id;

@Column(name = "", length = 150, nullable = false)
private String fullName;

@Column(name = "", length = 150, unique =
true)
private String email;

        @PrePersist
        public void prePersist() {
        if (this.id == null) {
        this.id = UUID.randomUUID();
        }
        }
        }