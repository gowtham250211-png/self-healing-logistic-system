package com.logistics.service;

import com.logistics.dto.DashboardStats;
import com.logistics.dto.ShipmentRequest;
import com.logistics.dto.ShipmentResponse;
import com.logistics.exception.ResourceNotFoundException;
import com.logistics.model.Shipment;
import com.logistics.model.ShipmentStatus;
import com.logistics.repository.ShipmentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ShipmentService {

    private final ShipmentRepository shipmentRepository;

    // ── Create ────────────────────────────────────────────────────────────────

    @Transactional
    public ShipmentResponse createShipment(ShipmentRequest request) {
        Shipment shipment = Shipment.builder()
                .productName(request.getProductName())
                .source(request.getSource())
                .destination(request.getDestination())
                .status(ShipmentStatus.ACTIVE)
                .build();

        Shipment saved = shipmentRepository.save(shipment);
        log.info("Created shipment [id={}] for product '{}' from {} to {}",
                saved.getId(), saved.getProductName(), saved.getSource(), saved.getDestination());
        return ShipmentResponse.from(saved);
    }

    // ── Read ──────────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<ShipmentResponse> getAllShipments() {
        return shipmentRepository.findAll()
                .stream()
                .map(ShipmentResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ShipmentResponse getShipmentById(Long id) {
        Shipment shipment = findOrThrow(id);
        return ShipmentResponse.from(shipment);
    }

    @Transactional(readOnly = true)
    public List<ShipmentResponse> getShipmentsByStatus(ShipmentStatus status) {
        return shipmentRepository.findByStatus(status)
                .stream()
                .map(ShipmentResponse::from)
                .collect(Collectors.toList());
    }

    // ── Update ────────────────────────────────────────────────────────────────

    @Transactional
    public ShipmentResponse updateShipment(Long id, ShipmentRequest request) {
        Shipment shipment = findOrThrow(id);
        shipment.setProductName(request.getProductName());
        shipment.setSource(request.getSource());
        shipment.setDestination(request.getDestination());

        if (request.getStatus() != null) {
            try {
                shipment.setStatus(ShipmentStatus.valueOf(request.getStatus().toUpperCase()));
            } catch (IllegalArgumentException e) {
                log.warn("Invalid status '{}' ignored during update", request.getStatus());
            }
        }

        return ShipmentResponse.from(shipmentRepository.save(shipment));
    }

    @Transactional
    public ShipmentResponse updateStatus(Long id, ShipmentStatus status) {
        Shipment shipment = findOrThrow(id);
        shipment.setStatus(status);
        return ShipmentResponse.from(shipmentRepository.save(shipment));
    }

    // ── Delete ────────────────────────────────────────────────────────────────

    @Transactional
    public void deleteShipment(Long id) {
        Shipment shipment = findOrThrow(id);
        shipmentRepository.delete(shipment);
        log.info("Deleted shipment [id={}]", id);
    }

    // ── Dashboard Stats ───────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public DashboardStats getDashboardStats() {
        long total     = shipmentRepository.count();
        long active    = shipmentRepository.countByStatus(ShipmentStatus.ACTIVE)
                       + shipmentRepository.countByStatus(ShipmentStatus.IN_TRANSIT);
        long failures  = shipmentRepository.countFailures();
        long recovered = shipmentRepository.countRecovered();

        return new DashboardStats(total, active, failures, recovered);
    }

    // ── Internal helper ───────────────────────────────────────────────────────

    public Shipment findOrThrow(Long id) {
        return shipmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Shipment not found with id: " + id));
    }
}
