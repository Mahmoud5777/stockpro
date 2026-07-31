package com.stockpro.dto.audit;

import com.stockpro.entity.audit.AuditAction;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LogAccesDTO {

    private UUID idLog;
    private String login;
    private UUID idUtil;
    private AuditAction action;
    private String methodeHttp;
    private String endpoint;
    private Integer statutHttp;
    private String adresseIp;
    private String userAgent;
    private String details;
    private LocalDateTime dateAcces;
}
