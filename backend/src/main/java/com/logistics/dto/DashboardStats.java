package com.logistics.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class DashboardStats {
    private long totalShipments;
    private long activeDeliveries;
    private long failuresDetected;
    private long recovered;
}