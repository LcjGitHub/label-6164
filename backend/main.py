"""老式路名牌字体图鉴 API。"""

from typing import Annotated

from fastapi import Depends, FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import Integer, func
from sqlalchemy.orm import Session

from database import Base, engine, get_db
from models import Material, StreetSign
from schemas import (
    CityDirectoryResponse,
    CityStats,
    MaterialCreate,
    MaterialResponse,
    StatsOverview,
    StreetSignCreate,
    StreetSignResponse,
    StreetSignUpdate,
)
from seed import seed_database

Base.metadata.create_all(bind=engine)

app = FastAPI(title="老式路名牌字体图鉴", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:6101", "http://127.0.0.1:6101"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DbSession = Annotated[Session, Depends(get_db)]


@app.on_event("startup")
def on_startup() -> None:
    """应用启动时写入种子数据。"""
    db = next(get_db())
    try:
        seed_database(db)
    finally:
        db.close()


@app.get("/api/health")
def health_check() -> dict[str, str]:
    """健康检查。"""
    return {"status": "ok"}


@app.get("/api/signs", response_model=list[StreetSignResponse])
def list_signs(
    db: DbSession,
    city: str | None = Query(None, description="按城市名称筛选"),
) -> list[StreetSign]:
    """获取全部路名牌记录，按城市、ID 排序。"""
    query = db.query(StreetSign)
    if city:
        query = query.filter(StreetSign.city == city)
    return query.order_by(StreetSign.city.asc(), StreetSign.id.asc()).all()


@app.get("/api/signs/{sign_id}", response_model=StreetSignResponse)
def get_sign(sign_id: int, db: DbSession) -> StreetSign:
    """获取单条记录。"""
    sign = db.get(StreetSign, sign_id)
    if sign is None:
        raise HTTPException(status_code=404, detail="记录不存在")
    return sign


@app.post("/api/signs", response_model=StreetSignResponse, status_code=201)
def create_sign(payload: StreetSignCreate, db: DbSession) -> StreetSign:
    """创建记录。"""
    sign = StreetSign(**payload.model_dump())
    db.add(sign)
    db.commit()
    db.refresh(sign)
    return sign


@app.put("/api/signs/{sign_id}", response_model=StreetSignResponse)
def update_sign(
    sign_id: int, payload: StreetSignUpdate, db: DbSession
) -> StreetSign:
    """更新记录。"""
    sign = db.get(StreetSign, sign_id)
    if sign is None:
        raise HTTPException(status_code=404, detail="记录不存在")
    for key, value in payload.model_dump().items():
        setattr(sign, key, value)
    db.commit()
    db.refresh(sign)
    return sign


@app.delete("/api/signs/{sign_id}", status_code=204)
def delete_sign(sign_id: int, db: DbSession) -> None:
    """删除记录。"""
    sign = db.get(StreetSign, sign_id)
    if sign is None:
        raise HTTPException(status_code=404, detail="记录不存在")
    db.delete(sign)
    db.commit()


@app.get("/api/materials", response_model=list[MaterialResponse])
def list_materials(db: DbSession) -> list[Material]:
    """获取全部材质词典记录。"""
    return db.query(Material).order_by(Material.id.asc()).all()


@app.post("/api/materials", response_model=MaterialResponse, status_code=201)
def create_material(payload: MaterialCreate, db: DbSession) -> Material:
    """新增材质词典记录。"""
    existing = db.query(Material).filter(Material.name == payload.name).first()
    if existing is not None:
        raise HTTPException(status_code=409, detail="该材质名称已存在")
    material = Material(**payload.model_dump())
    db.add(material)
    db.commit()
    db.refresh(material)
    return material


@app.get("/api/stats/overview", response_model=StatsOverview)
def get_stats_overview(db: DbSession) -> StatsOverview:
    """获取统计概览：按城市汇总记录数量与规范率。"""
    total_records = db.query(func.count(StreetSign.id)).scalar() or 0
    total_unified = (
        db.query(func.count(StreetSign.id))
        .filter(StreetSign.is_unified_standard.is_(True))
        .scalar()
        or 0
    )
    total_cities = (
        db.query(func.count(func.distinct(StreetSign.city))).scalar() or 0
    )

    city_stats_query = (
        db.query(
            StreetSign.city,
            func.count(StreetSign.id).label("total_count"),
            func.sum(func.cast(StreetSign.is_unified_standard, Integer)).label(
                "unified_count"
            ),
        )
        .group_by(StreetSign.city)
        .order_by(StreetSign.city.asc())
        .all()
    )

    city_stats: list[CityStats] = []
    for city, total_count, unified_count in city_stats_query:
        unified_count = unified_count or 0
        unified_rate = (
            round(unified_count / total_count, 4) if total_count > 0 else 0.0
        )
        city_stats.append(
            CityStats(
                city=city,
                total_count=total_count,
                unified_count=unified_count,
                unified_rate=unified_rate,
            )
        )

    overall_unified_rate = (
        round(total_unified / total_records, 4) if total_records > 0 else 0.0
    )

    return StatsOverview(
        total_cities=total_cities,
        total_records=total_records,
        total_unified=total_unified,
        overall_unified_rate=overall_unified_rate,
        city_stats=city_stats,
    )


@app.get("/api/cities", response_model=CityDirectoryResponse)
def get_city_directory(db: DbSession) -> CityDirectoryResponse:
    """获取城市目录：返回全部城市名称及各自记录数量。"""
    total_records = db.query(func.count(StreetSign.id)).scalar() or 0

    city_counts_query = (
        db.query(
            StreetSign.city,
            func.count(StreetSign.id).label("record_count"),
        )
        .group_by(StreetSign.city)
        .order_by(StreetSign.city.asc())
        .all()
    )

    cities = [
        {"city": city, "record_count": count}
        for city, count in city_counts_query
    ]

    return CityDirectoryResponse(
        total_cities=len(cities),
        total_records=total_records,
        cities=cities,
    )
