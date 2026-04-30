package com.logistics.dto;

import com.logistics.model.FailureEvent;
import com.logistics.model.FailureType;
import com.logistics.model.RecoveryStatus;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class FailureEventResponse {

    private Long id;
    private Long shipmentId;
    private String productName;
    private String reason;
    private FailureType type;
    private RecoveryStatus recoveryStatus;
    private String recoveryAction;
    private LocalDateTime detectedAt;
    private LocalDateTime resolvedAt;

    public static FailureEventResponse from(FailureEvent e) {
        FailureEventResponse r = new FailureEventResponse();
        r.setId(e.getId());
        r.setShipmentId(e.getShipment().getId());
        r.setProductName(e.getShipment().getProductName());
        r.setReason(e.getReason());
        r.setType(e.getType());
        r.setRecoveryStatus(e.getRecoveryStatus());
        r.setRecoveryAction(e.getRecoveryAction());
        r.setDetectedAt(e.getDetectedAt());
        r.setResolvedAt(e.getResolvedAt());
        return r;
    }
}