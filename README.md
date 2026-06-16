# 老式路名牌字体图鉴

按城市浏览各地老式路名牌的字体风格、背景色与材质规范。前后端分离 MVP，含基础 CRUD 与 5 条种子数据。

## 技术栈

| 层级 | 技术 | 端口 |
|------|------|------|
| 前端 | React + Ant Design + axios + dayjs | **6101** |
| 后端 | FastAPI + SQLite (`./data/street_sign.db`) | **6000** |

## 快速启动

### 1. 后端（一条命令）

在项目根目录执行：

```bash
cd backend && python -m venv .venv && .venv\Scripts\pip install -r requirements.txt && .venv\Scripts\uvicorn main:app --reload --host 0.0.0.0 --port 6000
```

> macOS / Linux 将 `.venv\Scripts\pip` 换为 `.venv/bin/pip`，`.venv\Scripts\uvicorn` 换为 `.venv/bin/uvicorn`。

启动后访问 API 文档：http://localhost:6000/docs

### 2. 前端

新开一个终端，在项目根目录执行：

```bash
cd frontend && npm install && npm run dev
```

浏览器打开：http://localhost:6101

## 功能说明

- **列表页**：按城市分组的路名牌表格（城市列合并单元格），支持从外部传入城市筛选条件
- **城市目录页**：以卡片网格展示全部城市及各自记录条数，点击城市卡片可跳转到列表页并自动筛选该城市记录
- **概览页**：各城市记录数量与统一规范占比统计
- **对比页**：两条记录并排对比，字段差异高亮显示
- **详情抽屉**：点击「详情」查看完整字段
- **CRUD**：支持新增、编辑、删除记录
- **种子数据**：首次启动自动写入 5 条示例（北京×2、上海、广州、成都）

## 数据字段

| 字段 | 说明 |
|------|------|
| 城市 | 所属城市 |
| 字体描述 | 字体风格与使用场景 |
| 背景色 | 色值或颜色名称 |
| 材质 | 路名牌材质 |
| 是否统一规范 | 是否遵循当地统一规范 |

## 目录结构

```
├── backend/          # FastAPI 后端
│   ├── main.py
│   ├── database.py
│   ├── models.py
│   ├── schemas.py
│   ├── seed.py
│   └── requirements.txt
├── frontend/         # React 前端
│   └── src/
├── data/             # SQLite 数据库（运行时生成）
└── README.md
```

## API 端点

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/health` | 健康检查 |
| GET | `/api/signs` | 获取全部记录 |
| GET | `/api/signs/{id}` | 获取单条 |
| POST | `/api/signs` | 创建 |
| PUT | `/api/signs/{id}` | 更新 |
| DELETE | `/api/signs/{id}` | 删除 |
| GET | `/api/materials` | 获取材质词典列表 |
| POST | `/api/materials` | 新增材质词典 |
