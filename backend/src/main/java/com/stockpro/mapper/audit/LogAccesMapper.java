package com.stockpro.mapper.audit;

import com.stockpro.dto.audit.LogAccesDTO;
import com.stockpro.entity.audit.LogAcces;
import org.springframework.stereotype.Component;

@Component
public class LogAccesMapper {

    public LogAccesDTO toDto(LogAcces entity) {
        if (entity == null) return null;
        return LogAccesDTO.builder()
                .idLog(entity.getIdLog())
                .login(entity.getLogin())
                .idUtil(entity.getIdUtil())
                .action(entity.getAction())
                .methodeHttp(entity.getMethodeHttp())
                .endpoint(entity.getEndpoint())
                .statutHttp(entity.getStatutHttp())
                .adresseIp(entity.getAdresseIp())
                .userAgent(entity.getUserAgent())
                .details(entity.getDetails())
                .dateAcces(entity.getDateAcces())
                .build();
    }
}
