"""老式路名牌字体图鉴 API。"""

from typing import Annotated

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from database import Base, engine, get_db
from models import StreetSign
from schemas import StreetSignCreate, StreetSignResponse, StreetSignUpdate
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
def list_signs(db: DbSession) -> list[StreetSign]:
    """获取全部路名牌记录，按城市、ID 排序。"""
    return (
        db.query(StreetSign)
        .order_by(StreetSign.city.asc(), StreetSign.id.asc())
        .all()
    )


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
