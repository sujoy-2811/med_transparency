import uuid
from datetime import datetime
from typing import Optional
from sqlalchemy import String, Float, Integer, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base, utcnow


class Submission(Base):
    __tablename__ = "submissions"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[Optional[str]] = mapped_column(String, ForeignKey("users.id"), nullable=True)
    procedure_id: Mapped[str] = mapped_column(String, ForeignKey("procedures.id"), nullable=False)
    hospital_id: Mapped[str] = mapped_column(String, ForeignKey("hospitals.id"), nullable=False)
    cost_usd: Mapped[float] = mapped_column(Float, nullable=False)
    original_cost: Mapped[float] = mapped_column(Float, nullable=False)
    currency: Mapped[str] = mapped_column(String(3), nullable=False, default="USD")
    wait_days: Mapped[int] = mapped_column(Integer, nullable=False)
    outcome_score: Mapped[int] = mapped_column(Integer, nullable=False)
    testimony: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)

    user: Mapped[Optional["User"]] = relationship("User", back_populates="submissions")
    procedure: Mapped["Procedure"] = relationship("Procedure", back_populates="submissions")
    hospital: Mapped["Hospital"] = relationship("Hospital", back_populates="submissions")
