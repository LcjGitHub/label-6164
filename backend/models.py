"""路名牌字体数据模型。"""

from sqlalchemy import Boolean, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from database import Base


class StreetSign(Base):
    """老式路名牌字体记录。"""

    __tablename__ = "street_signs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    city: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    font_description: Mapped[str] = mapped_column(Text, nullable=False)
    background_color: Mapped[str] = mapped_column(String(32), nullable=False)
    material: Mapped[str] = mapped_column(String(64), nullable=False)
    is_unified_standard: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    discovery_decade: Mapped[str | None] = mapped_column(String(64), nullable=True)


class Material(Base):
    """材质词典。"""

    __tablename__ = "materials"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(64), nullable=False, unique=True, index=True)
    description: Mapped[str] = mapped_column(String(256), nullable=False)
