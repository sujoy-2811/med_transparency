import uuid
from typing import Optional
from sqlalchemy import String, Float, Boolean, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base


class Alert(Base):
    __tablename__ = "alerts"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(String, ForeignKey("users.id"), nullable=False)
    procedure_id: Mapped[str] = mapped_column(String, ForeignKey("procedures.id"), nullable=False)
    region_id: Mapped[Optional[str]] = mapped_column(String, ForeignKey("regions.id"), nullable=True)
    target_cost_usd: Mapped[float] = mapped_column(Float, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    user: Mapped["User"] = relationship("User", back_populates="alerts")
    procedure: Mapped["Procedure"] = relationship("Procedure", back_populates="alerts")
    region: Mapped[Optional["Region"]] = relationship("Region", back_populates="alerts")
