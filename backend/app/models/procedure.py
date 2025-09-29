import uuid
from sqlalchemy import String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base


class Procedure(Base):
    __tablename__ = "procedures"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name: Mapped[str] = mapped_column(String, nullable=False, index=True)
    category: Mapped[str] = mapped_column(String, nullable=False, index=True)
    icd_code: Mapped[str] = mapped_column(String, nullable=True)
    slug: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=True)

    submissions: Mapped[list["Submission"]] = relationship("Submission", back_populates="procedure", lazy="select")
    alerts: Mapped[list["Alert"]] = relationship("Alert", back_populates="procedure", lazy="select")
