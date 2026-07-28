package com.stockpro.dto.audit;

import com.stockpro.entity.audit.AuditAction;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LogAccesDTO {

    private String idLog;
    private String login;
    private String idUtil;
    private AuditAction action;
    private String methodeHttp;
    private String endpoint;
    private Integer statutHttp;
    private String adresseIp;
    private String userAgent;
    private String details;
    private LocalDateTime dateAcces;
}
