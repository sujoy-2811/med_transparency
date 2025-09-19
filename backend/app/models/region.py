import uuid
from sqlalchemy import String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base


class Region(Base):
    __tablename__ = "regions"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name: Mapped[str] = mapped_column(String, nullable=False)
    country_code: Mapped[str] = mapped_column(String(3), nullable=False)
    healthcare_summary: Mapped[str] = mapped_column(Text, nullable=True)
    flag_emoji: Mapped[str] = mapped_column(String(10), nullable=True)

    hospitals: Mapped[list["Hospital"]] = relationship("Hospital", back_populates="region", lazy="select")
    alerts: Mapped[list["Alert"]] = relationship("Alert", back_populates="region", lazy="select")
