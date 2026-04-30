package com.logistics.dto;

import com.logistics.model.FailureType;
import lombok.Data;

@Data
public class SimulateFailureRequest {
    private Long shipmentId;
    private FailureType type;
    private String reason;
}