"""
Wellness service – business logic layer.

Separates database operations from API route handlers.
"""
from __future__ import annotations
from typing import Optional
from sqlalchemy.orm import Session
from app.models.wellness import WellnessCheck
from app.schemas.wellness import WellnessCheckCreate


def create_check(db: Session, data: WellnessCheckCreate) -> WellnessCheck:
    """Persist a new wellness check to the database."""
    db_check = WellnessCheck(
        fatigue_level=data.fatigue_level,
        stress_level=data.stress_level,
        overall_wellness=data.overall_wellness,
        skin_observations=data.skin_observations,
        ear_value=data.ear_value,
        blink_rate=data.blink_rate,
        brow_tension=data.brow_tension,
        skin_brightness=data.skin_brightness,
        skin_texture_variance=data.skin_texture_variance,
        skin_redness=data.skin_redness,
        lighting_quality=data.lighting_quality,
        face_detected=1 if data.face_detected else 0,
        notes=data.notes,
    )
    db.add(db_check)
    db.commit()
    db.refresh(db_check)
    return db_check


def get_check(db: Session, check_id: int) -> Optional[WellnessCheck]:
    return db.query(WellnessCheck).filter(WellnessCheck.id == check_id).first()


def get_checks(db: Session, skip: int = 0, limit: int = 50) -> tuple[list[WellnessCheck], int]:
    total = db.query(WellnessCheck).count()
    checks = (
        db.query(WellnessCheck)
        .order_by(WellnessCheck.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return checks, total


def delete_check(db: Session, check_id: int) -> bool:
    db_check = db.query(WellnessCheck).filter(WellnessCheck.id == check_id).first()
    if not db_check:
        return False
    db.delete(db_check)
    db.commit()
    return True
