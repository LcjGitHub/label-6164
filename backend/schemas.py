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


class CityStats(BaseModel):
    """单个城市的统计数据。"""

    city: str
    total_count: int
    unified_count: int
    unified_rate: float


class StatsOverview(BaseModel):
    """统计概览数据。"""

    total_cities: int
    total_records: int
    total_unified: int
    overall_unified_rate: float
    city_stats: list[CityStats]


class MaterialBase(BaseModel):
    """材质词典公共字段。"""

    name: str = Field(..., min_length=1, max_length=64, description="材质名称")
    description: str = Field(..., min_length=1, max_length=256, description="材质说明")


class MaterialCreate(MaterialBase):
    """创建材质词典记录。"""


class MaterialResponse(MaterialBase):
    """材质词典响应。"""

    model_config = ConfigDict(from_attributes=True)

    id: int
