package com.logistics.controller;

import com.logistics.dto.DashboardStats;
import com.logistics.dto.ShipmentRequest;
import com.logistics.dto.ShipmentResponse;
import com.logistics.model.ShipmentStatus;
import com.logistics.service.ShipmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/shipments")
@RequiredArgsConstructor
public class ShipmentController {

    private final ShipmentService shipmentService;

    // POST /api/shipments — Create a new shipment
    @PostMapping
    public ResponseEntity<ShipmentResponse> createShipment(
            @Valid @RequestBody ShipmentRequest request) {
        ShipmentResponse response = shipmentService.createShipment(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // GET /api/shipments — List all shipments
    @GetMapping
    public ResponseEntity<List<ShipmentResponse>> getAllShipments(
            @RequestParam(required = false) String status) {

        if (status != null) {
            try {
                ShipmentStatus s = ShipmentStatus.valueOf(status.toUpperCase());
                return ResponseEntity.ok(shipmentService.getShipmentsByStatus(s));
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().build();
            }
        }
        return ResponseEntity.ok(shipmentService.getAllShipments());
    }

    // GET /api/shipments/{id} — Get one shipment
    @GetMapping("/{id}")
    public ResponseEntity<ShipmentResponse> getShipment(@PathVariable Long id) {
        return ResponseEntity.ok(shipmentService.getShipmentById(id));
    }

    // PUT /api/shipments/{id} — Update shipment
    @PutMapping("/{id}")
    public ResponseEntity<ShipmentResponse> updateShipment(
            @PathVariable Long id,
            @Valid @RequestBody ShipmentRequest request) {
        return ResponseEntity.ok(shipmentService.updateShipment(id, request));
    }

    // PATCH /api/shipments/{id}/status — Update only status
    @PatchMapping("/{id}/status")
    public ResponseEntity<ShipmentResponse> updateStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        try {
            ShipmentStatus s = ShipmentStatus.valueOf(status.toUpperCase());
            return ResponseEntity.ok(shipmentService.updateStatus(id, s));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // DELETE /api/shipments/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteShipment(@PathVariable Long id) {
        shipmentService.deleteShipment(id);
        return ResponseEntity.noContent().build();
    }

    // GET /api/shipments/stats — Dashboard stats
    @GetMapping("/stats")
    public ResponseEntity<DashboardStats> getDashboardStats() {
        return ResponseEntity.ok(shipmentService.getDashboardStats());
    }
}
