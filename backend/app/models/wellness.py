"""SQLAlchemy ORM models for VitaMirror wellness data."""
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, DateTime, Text, JSON
from app.database.session import Base


class WellnessCheck(Base):
    """Represents a single completed wellness analysis session."""

    __tablename__ = "wellness_checks"

    id = Column(Integer, primary_key=True, index=True)
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Composite indicator levels: "low" | "moderate" | "elevated"
    fatigue_level = Column(String(20), nullable=False, default="unknown")
    stress_level = Column(String(20), nullable=False, default="unknown")

    # Skin observation keys (stored as JSON for flexibility)
    skin_observations = Column(JSON, nullable=True)

    # Overall wellness label
    overall_wellness = Column(String(20), nullable=False, default="unknown")

    # Raw metric values (for trend charts)
    ear_value = Column(Float, nullable=True)          # Eye Aspect Ratio
    blink_rate = Column(Float, nullable=True)         # blinks per minute estimate
    brow_tension = Column(Float, nullable=True)       # experimental stress proxy
    skin_brightness = Column(Float, nullable=True)
    skin_texture_variance = Column(Float, nullable=True)
    skin_redness = Column(Float, nullable=True)

    # Quality flags
    lighting_quality = Column(String(20), nullable=True)  # "good" | "poor" | "unknown"
    face_detected = Column(Integer, default=1)            # boolean as int for SQLite

    # Optional free-text notes
    notes = Column(Text, nullable=True)

    def __repr__(self) -> str:
        return f"<WellnessCheck id={self.id} fatigue={self.fatigue_level} at={self.created_at}>"
