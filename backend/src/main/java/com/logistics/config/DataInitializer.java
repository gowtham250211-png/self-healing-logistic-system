package com.logistics.config;

import com.logistics.model.Shipment;
import com.logistics.model.ShipmentStatus;
import com.logistics.repository.ShipmentRepository;
import com.logistics.repository.FailureEventRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final ShipmentRepository shipmentRepository;
    private final FailureEventRepository failureEventRepository;

    @Override
    public void run(String... args) {
        // Clear all existing data and reseed fresh
        failureEventRepository.deleteAll();
        shipmentRepository.deleteAll();

        log.info("Seeding 5 fresh demo shipments...");
        List<Shipment> seedData = List.of(
                Shipment.builder()
                        .productName("Rice Bags 50kg")
                        .source("Thanjavur")
                        .destination("Chennai")
                        .status(ShipmentStatus.ACTIVE)
                        .build(),
                Shipment.builder()
                        .productName("Cotton Bales")
                        .source("Coimbatore")
                        .destination("Tirupur")
                        .status(ShipmentStatus.ACTIVE)
                        .build(),
                Shipment.builder()
                        .productName("Cement Bags")
                        .source("Madurai")
                        .destination("Dindigul")
                        .status(ShipmentStatus.ACTIVE)
                        .build(),
                Shipment.builder()
                        .productName("Electronic Parts")
                        .source("Chennai")
                        .destination("Vellore")
                        .status(ShipmentStatus.ACTIVE)
                        .build(),
                Shipment.builder()
                        .productName("Textile Goods")
                        .source("Erode")
                        .destination("Salem")
                        .status(ShipmentStatus.ACTIVE)
                        .build()
        );
        shipmentRepository.saveAll(seedData);
        log.info("Seeded 5 fresh demo shipments successfully.");
    }
}