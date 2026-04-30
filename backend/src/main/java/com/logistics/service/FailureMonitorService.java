package com.logistics.service;

import com.logistics.dto.FailureEventResponse;
import com.logistics.model.*;
import com.logistics.repository.FailureEventRepository;
import com.logistics.repository.ShipmentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class FailureMonitorService {

    private final ShipmentRepository shipmentRepository;
    private final FailureEventRepository failureEventRepository;
    private final RecoveryService recoveryService;

    @Value("${app.monitor.delay-threshold-minutes:60}")
    private int delayThresholdMinutes;

    // ── Scheduled scan (called by FailureMonitorScheduler) ───────────────────

    @Transactional
    public int scanAndRecover() {
        log.debug("Running failure scan...");

        LocalDateTime delayThreshold = LocalDateTime.now().minusMinutes(delayThresholdMinutes);
        List<Shipment> candidates = shipmentRepository.findPotentiallyDelayed(delayThreshold);

        int failuresFound = 0;
        for (Shipment shipment : candidates) {
            // Skip if already being recovered
            boolean alreadyHandled = failureEventRepository.existsByShipmentIdAndRecoveryStatusIn(
                    shipment.getId(),
                    List.of(RecoveryStatus.PENDING, RecoveryStatus.IN_PROGRESS)
            );
            if (alreadyHandled) continue;

            log.warn("Potential delay detected for shipment [id={}], age > {} min",
                    shipment.getId(), delayThresholdMinutes);

            recoveryService.triggerRecovery(
                    shipment,
                    FailureType.DELAY,
                    "Shipment exceeded expected transit time of " + delayThresholdMinutes + " minutes"
            );
            failuresFound++;
        }

        if (failuresFound > 0) {
            log.info("Failure scan complete — {} failure(s) detected and recovery triggered", failuresFound);
        }
        return failuresFound;
    }

    // ── Manual failure simulation (from frontend button) ─────────────────────

    @Transactional
    public FailureEventResponse simulateFailure(Long shipmentId, FailureType type, String reason) {
        Shipment shipment = shipmentRepository.findById(shipmentId)
                .orElseThrow(() -> new RuntimeException("Shipment not found: " + shipmentId));

        FailureEvent event = recoveryService.triggerRecovery(
                shipment,
                type != null ? type : FailureType.MANUAL,
                reason != null ? reason : "Manually triggered failure simulation"
        );

        if (event == null) {
            throw new RuntimeException("Recovery already in progress for shipment: " + shipmentId);
        }

        return FailureEventResponse.from(event);
    }

    // ── Get system status summary ─────────────────────────────────────────────

    @Transactional(readOnly = true)
    public MonitorStatus getSystemStatus() {
        long total       = shipmentRepository.count();
        long active      = shipmentRepository.countByStatus(ShipmentStatus.ACTIVE)
                         + shipmentRepository.countByStatus(ShipmentStatus.IN_TRANSIT);
        long failed      = shipmentRepository.countByStatus(ShipmentStatus.FAILED)
                         + shipmentRepository.countByStatus(ShipmentStatus.DELAYED);
        long recovered   = shipmentRepository.countByStatus(ShipmentStatus.RECOVERED);
        long pending     = failureEventRepository.findByRecoveryStatus(RecoveryStatus.PENDING).size();

        String status = (failed > 0 || pending > 0) ? "FAILURE_DETECTED" : "NOMINAL";

        return new MonitorStatus(status, total, active, failed, recovered, pending);
    }

    // ── Get all failure events ─────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<FailureEventResponse> getAllFailureEvents() {
        return failureEventRepository.findAllByOrderByDetectedAtDesc()
                .stream()
                .map(FailureEventResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<FailureEventResponse> getFailureEventsByShipment(Long shipmentId) {
        return failureEventRepository.findByShipmentId(shipmentId)
                .stream()
                .map(FailureEventResponse::from)
                .collect(Collectors.toList());
    }

    // ── Inner DTO for monitor status ─────────────────────────────────────────

    public record MonitorStatus(
            String systemStatus,
            long totalShipments,
            long activeDeliveries,
            long failuresDetected,
            long recovered,
            long pendingRecoveries
    ) {}
}
