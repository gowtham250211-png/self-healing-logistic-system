package com.logistics.repository;

import com.logistics.model.Shipment;
import com.logistics.model.ShipmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ShipmentRepository extends JpaRepository<Shipment, Long> {

    List<Shipment> findByStatus(ShipmentStatus status);
    List<Shipment> findByStatusIn(List<ShipmentStatus> statuses);

    @Query("SELECT s FROM Shipment s WHERE s.status IN ('ACTIVE', 'IN_TRANSIT') AND s.createdAt < :threshold")
    List<Shipment> findPotentiallyDelayed(LocalDateTime threshold);

    long countByStatus(ShipmentStatus status);

    @Query("SELECT COUNT(s) FROM Shipment s WHERE s.status IN ('FAILED', 'DELAYED')")
    long countFailures();

    @Query("SELECT COUNT(s) FROM Shipment s WHERE s.status = 'RECOVERED'")
    long countRecovered();
}