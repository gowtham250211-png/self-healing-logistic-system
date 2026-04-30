package com.logistics.dto;

import com.logistics.model.Shipment;
import com.logistics.model.ShipmentStatus;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ShipmentResponse {

    private Long id;
    private String productName;
    private String source;
    private String destination;
    private ShipmentStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String reroutedVia;
    private String backupVehicle;
    private String failureReason;
    private int recoveryAttempts;

    public static ShipmentResponse from(Shipment s) {
        ShipmentResponse r = new ShipmentResponse();
        r.setId(s.getId());
        r.setProductName(s.getProductName());
        r.setSource(s.getSource());
        r.setDestination(s.getDestination());
        r.setStatus(s.getStatus());
        r.setCreatedAt(s.getCreatedAt());
        r.setUpdatedAt(s.getUpdatedAt());
        r.setReroutedVia(s.getReroutedVia());
        r.setBackupVehicle(s.getBackupVehicle());
        r.setFailureReason(s.getFailureReason());
        r.setRecoveryAttempts(s.getRecoveryAttempts());
        return r;
    }
}