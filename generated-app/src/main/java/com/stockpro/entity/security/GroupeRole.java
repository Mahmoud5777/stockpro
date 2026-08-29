package com.stockpro.entity.security;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "GROUPE_ROLE")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GroupeRole {

@Id
@Column(name = "ID",, length = 32, nullable = false, updatable = false)
private UUID id;

// Relation ""
@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "GROUP_ID", nullable = false)
private Group group;

// Relation ""
@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "ROLE_ID", nullable = false)
private Role role;

        @PrePersist
        public void prePersist() {
        if (this.id == null) {
        this.id = UUID.randomUUID();
        }
        }
        }