package com.logistics.repository;

import com.logistics.model.FailureEvent;
import com.logistics.model.RecoveryStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface FailureEventRepository extends JpaRepository<FailureEvent, Long> {

    List<FailureEvent> findByShipmentId(Long shipmentId);
    List<FailureEvent> findByRecoveryStatus(RecoveryStatus recoveryStatus);
    List<FailureEvent> findAllByOrderByDetectedAtDesc();
    boolean existsByShipmentIdAndRecoveryStatusIn(Long shipmentId, List<RecoveryStatus> statuses);
}