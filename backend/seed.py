"""初始化种子数据。"""

from sqlalchemy.orm import Session

from models import StreetSign

SEED_DATA: list[dict] = [
    {
        "city": "北京",
        "font_description": "长城牌变体宋体，笔画粗壮，字距紧凑，常见于胡同路牌",
        "background_color": "#1E4D8C",
        "material": "搪瓷",
        "is_unified_standard": True,
    },
    {
        "city": "北京",
        "font_description": "朝阳区老式手写风格黑体，边缘略带圆角",
        "background_color": "#2B5F3E",
        "material": "铝合金",
        "is_unified_standard": False,
    },
    {
        "city": "上海",
        "font_description": "海派黑体，横细竖粗，搭配白色描边",
        "background_color": "#006633",
        "material": "搪瓷",
        "is_unified_standard": True,
    },
    {
        "city": "广州",
        "font_description": "岭南楷体风格，字形舒展，多用于老城区巷牌",
        "background_color": "#F5F0E6",
        "material": "亚克力",
        "is_unified_standard": False,
    },
    {
        "city": "成都",
        "font_description": "巴蜀仿宋，竖排为主，底色偏赭石",
        "background_color": "#8B4513",
        "material": "木质",
        "is_unified_standard": False,
    },
]


def seed_database(db: Session) -> None:
    """
     * 若表为空则写入种子数据。
     * @param {Session} db 数据库会话
     """
    if db.query(StreetSign).count() > 0:
        return
    for item in SEED_DATA:
        db.add(StreetSign(**item))
    db.commit()
