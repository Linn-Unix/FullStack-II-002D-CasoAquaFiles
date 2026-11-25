package cl.aquachile.aquafiles.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import cl.aquachile.aquafiles.dto.DashboardResponse;
import cl.aquachile.aquafiles.service.DashboardService;

@RestController
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    // GET /api/v1/dashboard/resumen (solo ANALISTA)
    @GetMapping("/api/v1/dashboard/resumen")
    public DashboardResponse resumen() {
        return dashboardService.resumen();
    }
}