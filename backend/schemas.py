"""Pydantic 请求/响应模型。"""

from pydantic import BaseModel, ConfigDict, Field


class StreetSignBase(BaseModel):
    """路名牌字体公共字段。"""

    city: str = Field(..., min_length=1, max_length=64, description="城市")
    font_description: str = Field(..., min_length=1, description="字体描述")
    background_color: str = Field(..., min_length=1, max_length=32, description="背景色")
    material: str = Field(..., min_length=1, max_length=64, description="材质")
    is_unified_standard: bool = Field(..., description="是否统一规范")


class StreetSignCreate(StreetSignBase):
    """创建路名牌字体记录。"""


class StreetSignUpdate(StreetSignBase):
    """更新路名牌字体记录。"""


class StreetSignResponse(StreetSignBase):
    """路名牌字体响应。"""

    model_config = ConfigDict(from_attributes=True)

    id: int
