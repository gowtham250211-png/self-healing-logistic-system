package com.logistics.scheduler;

import com.logistics.service.FailureMonitorService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class FailureMonitorScheduler {

    private final FailureMonitorService failureMonitorService;

    @Value("${app.monitor.scan-interval-ms:30000}")
    private long scanIntervalMs;

    /**
     * Runs every 30 seconds (configurable via application.properties).
     * Scans all ACTIVE/IN_TRANSIT shipments for potential delays
     * and auto-triggers recovery if needed.
     */
    @Scheduled(fixedDelayString = "${app.monitor.scan-interval-ms:30000}")
    public void runMonitorScan() {
        log.debug("FailureMonitorScheduler — starting scan");
        try {
            int count = failureMonitorService.scanAndRecover();
            if (count > 0) {
                log.info("FailureMonitorScheduler — scan complete: {} failure(s) handled", count);
            }
        } catch (Exception e) {
            log.error("FailureMonitorScheduler — scan error: {}", e.getMessage(), e);
        }
    }
}
