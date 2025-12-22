from fastapi import APIRouter, Depends

from models.responses.health import HealthStatusResponse
from services.health_service import HealthService

router = APIRouter(prefix="/health", tags=["Health"])


def get_health_service() -> HealthService:
    return HealthService()


@router.get(
    "",
    response_model=HealthStatusResponse,
    summary="Health check",
    response_description="The current health of the backend service.",
    tags=["Health"],
)
def health_check(service: HealthService = Depends(get_health_service)) -> HealthStatusResponse:
    return service.get_status()

