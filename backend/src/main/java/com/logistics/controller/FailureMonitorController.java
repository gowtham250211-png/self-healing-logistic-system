package com.logistics.controller;

import com.logistics.dto.FailureEventResponse;
import com.logistics.dto.SimulateFailureRequest;
import com.logistics.service.FailureMonitorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/monitor")
@RequiredArgsConstructor
public class FailureMonitorController {

    private final FailureMonitorService failureMonitorService;

    // GET /api/monitor/status — System health summary
    @GetMapping("/status")
    public ResponseEntity<FailureMonitorService.MonitorStatus> getStatus() {
        return ResponseEntity.ok(failureMonitorService.getSystemStatus());
    }

    // GET /api/monitor/failures — All failure events
    @GetMapping("/failures")
    public ResponseEntity<List<FailureEventResponse>> getAllFailures() {
        return ResponseEntity.ok(failureMonitorService.getAllFailureEvents());
    }

    // GET /api/monitor/failures/shipment/{id} — Failures for a specific shipment
    @GetMapping("/failures/shipment/{shipmentId}")
    public ResponseEntity<List<FailureEventResponse>> getFailuresByShipment(
            @PathVariable Long shipmentId) {
        return ResponseEntity.ok(failureMonitorService.getFailureEventsByShipment(shipmentId));
    }

    // POST /api/monitor/simulate — Simulate a failure (from frontend button)
    @PostMapping("/simulate")
    public ResponseEntity<FailureEventResponse> simulateFailure(
            @RequestBody SimulateFailureRequest request) {
        FailureEventResponse response = failureMonitorService.simulateFailure(
                request.getShipmentId(),
                request.getType(),
                request.getReason()
        );
        return ResponseEntity.ok(response);
    }

    // POST /api/monitor/scan — Manually trigger a scan cycle
    @PostMapping("/scan")
    public ResponseEntity<Map<String, Object>> triggerScan() {
        int count = failureMonitorService.scanAndRecover();
        return ResponseEntity.ok(Map.of(
                "message", "Scan complete",
                "failuresHandled", count
        ));
    }
}
