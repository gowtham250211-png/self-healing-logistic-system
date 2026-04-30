package com.logistics.service;

import com.logistics.model.*;
import com.logistics.repository.FailureEventRepository;
import com.logistics.repository.ShipmentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;

@Service
@RequiredArgsConstructor
@Slf4j
public class RecoveryService {

    private final ShipmentRepository shipmentRepository;
    private final FailureEventRepository failureEventRepository;
    private final Random random = new Random();

    // Tamil Nadu local backup routes
    private static final List<String> BACKUP_ROUTES = List.of(
            "Route NH-44 via Krishnagiri",
            "Route NH-48 via Vellore",
            "Route NH-38 via Dindigul",
            "Route SH-15 via Namakkal",
            "Route NH-83 via Tirunelveli"
    );

    // Local backup vehicles
    private static final List<String> BACKUP_VEHICLES = List.of(
            "Lorry-TN-45-AB-1234",
            "Truck-TN-22-CD-5678",
            "Van-TN-11-EF-9012",
            "Freight-TN-37-GH-3456",
            "Lorry-TN-59-IJ-7890"
    );

    public FailureEvent triggerRecovery(Shipment shipment,
                                        FailureType failureType, String reason) {

        // Guard — skip if already recovering
        boolean alreadyRecovering = failureEventRepository
                .existsByShipmentIdAndRecoveryStatusIn(
                        shipment.getId(),
                        List.of(RecoveryStatus.PENDING, RecoveryStatus.IN_PROGRESS)
                );
        if (alreadyRecovering) {
            log.info("Recovery already in progress for [id={}] — skipping.", shipment.getId());
            return null;
        }

        log.warn("⚠ Failure detected on shipment [id={}] type={}", shipment.getId(), failureType);

        // Step 1 — Mark as DELAYED immediately (visible to user)
        shipment.setStatus(ShipmentStatus.DELAYED);
        shipment.setFailureReason(reason);
        shipment.setRecoveryAttempts(shipment.getRecoveryAttempts() + 1);
        shipmentRepository.save(shipment);
        log.info("Shipment [id={}] → DELAYED", shipment.getId());

        // Create FailureEvent record
        FailureEvent event = FailureEvent.builder()
                .shipment(shipment)
                .reason(reason)
                .type(failureType)
                .recoveryStatus(RecoveryStatus.IN_PROGRESS)
                .build();
        failureEventRepository.save(event);

        // Run full recovery in background thread (non-blocking)
        Long shipmentId = shipment.getId();
        Long eventId    = event.getId();

        new Thread(() -> {
            try {
                // Show DELAYED for 20 seconds
                sleep(20000);

                // Step 2 — Mark FAILED
                Shipment s1 = shipmentRepository.findById(shipmentId).orElse(null);
                if (s1 == null) return;
                s1.setStatus(ShipmentStatus.FAILED);
                shipmentRepository.save(s1);
                log.info("Shipment [id={}] → FAILED", shipmentId);

                // Show FAILED for 30 seconds
                sleep(30000);

                // Step 3 — Perform recovery
                Shipment s2 = shipmentRepository.findById(shipmentId).orElse(null);
                if (s2 == null) return;

                String recoveryAction;
                String vehicleAssigned  = null;
                String routeAssigned    = null;

                switch (failureType) {
                    case DELAY -> {
                        routeAssigned = pickRandom(BACKUP_ROUTES);
                        s2.setReroutedVia(routeAssigned);
                        recoveryAction = "Rerouted via " + routeAssigned;
                    }
                    case BREAKDOWN, VEHICLE_FAILURE -> {
                        vehicleAssigned = pickRandom(BACKUP_VEHICLES);
                        s2.setBackupVehicle(vehicleAssigned);
                        recoveryAction = "Backup vehicle assigned: " + vehicleAssigned;
                    }
                    case ROUTE_UNAVAILABLE -> {
                        routeAssigned   = pickRandom(BACKUP_ROUTES);
                        vehicleAssigned = pickRandom(BACKUP_VEHICLES);
                        s2.setReroutedVia(routeAssigned);
                        s2.setBackupVehicle(vehicleAssigned);
                        recoveryAction  = "Rerouted via " + routeAssigned
                                + " | Vehicle: " + vehicleAssigned;
                    }
                    default -> recoveryAction = "Manual recovery — operator dispatched";
                }

                s2.setStatus(ShipmentStatus.RECOVERED);
                shipmentRepository.save(s2);
                log.info("✅ Shipment [id={}] → RECOVERED — {}", shipmentId, recoveryAction);

                // Update FailureEvent as resolved
                FailureEvent fe = failureEventRepository.findById(eventId).orElse(null);
                if (fe != null) {
                    fe.setRecoveryStatus(RecoveryStatus.RECOVERED);
                    fe.setRecoveryAction(recoveryAction);
                    fe.setResolvedAt(LocalDateTime.now());
                    failureEventRepository.save(fe);
                }

            } catch (Exception ex) {
                log.error("Recovery error for shipment [id={}]: {}", shipmentId, ex.getMessage());
            }
        }, "recovery-thread-" + shipmentId).start();

        return event;
    }

    public int recoverAllPending() {
        List<FailureEvent> pending = failureEventRepository
                .findByRecoveryStatus(RecoveryStatus.PENDING);
        for (FailureEvent e : pending) {
            triggerRecovery(e.getShipment(), e.getType(), e.getReason());
        }
        return pending.size();
    }

    private void sleep(long ms) {
        try { Thread.sleep(ms); }
        catch (InterruptedException e) { Thread.currentThread().interrupt(); }
    }

    private String pickRandom(List<String> options) {
        return options.get(random.nextInt(options.size()));
    }
}