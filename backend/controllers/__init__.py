from .course_controller import router as course_router
from .health_controller import router as health_router
from .user_controller import router as user_router

__all__ = [
    "course_router",
    "health_router",
    "user_router",
]
