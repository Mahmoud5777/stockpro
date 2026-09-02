package com.stockpro.dto.auth;

import lombok.*;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SiteAllegeDTO {
    private UUID idSite;
    private String libSite;
}
