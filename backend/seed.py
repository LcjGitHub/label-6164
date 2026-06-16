"""初始化种子数据。"""

from sqlalchemy.orm import Session

from models import Material, StreetSign

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

MATERIAL_SEED_DATA: list[dict] = [
    {
        "name": "搪瓷",
        "description": "传统工艺，色彩鲜艳耐久，常见于建国初期老式路牌",
    },
    {
        "name": "铝合金",
        "description": "轻质耐候金属，现代标准化路牌常用材质",
    },
    {
        "name": "亚克力",
        "description": "有机玻璃质感，透光性好，多用于商业街区标识",
    },
    {
        "name": "木质",
        "description": "自然纹理，历史文化街区特色路牌常用",
    },
    {
        "name": "不锈钢",
        "description": "高耐候性金属，沿海多雨城市广泛使用",
    },
    {
        "name": "塑料",
        "description": "成本低廉，临时性或社区路牌常见材质",
    },
]


def seed_database(db: Session) -> None:
    """
     * 若表为空则写入种子数据。
     * @param {Session} db 数据库会话
     """
    if db.query(Material).count() == 0:
        for item in MATERIAL_SEED_DATA:
            db.add(Material(**item))
        db.commit()

    if db.query(StreetSign).count() > 0:
        return
    for item in SEED_DATA:
        db.add(StreetSign(**item))
    db.commit()
