import uuid
from typing import Optional
from sqlalchemy import String, Float, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base


class Hospital(Base):
    __tablename__ = "hospitals"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name: Mapped[str] = mapped_column(String, nullable=False, index=True)
    region_id: Mapped[str] = mapped_column(String, ForeignKey("regions.id"), nullable=False)
    city: Mapped[str] = mapped_column(String, nullable=False)
    accreditation: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    latitude: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    longitude: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    website: Mapped[Optional[str]] = mapped_column(String, nullable=True)

    region: Mapped["Region"] = relationship("Region", back_populates="hospitals")
    submissions: Mapped[list["Submission"]] = relationship("Submission", back_populates="hospital", lazy="select")
