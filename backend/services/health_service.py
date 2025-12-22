from models.responses.health import HealthStatusResponse


class HealthService:

    def get_status(self) -> HealthStatusResponse:
        
        return HealthStatusResponse(status="ok", detail="All subsystems operational.")

