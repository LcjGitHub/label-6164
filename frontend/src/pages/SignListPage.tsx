import { Button, Space, Table, Tag, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { fetchSigns } from '../api/client';
import SignDetailDrawer from '../components/SignDetailDrawer';
import SignFormModal from '../components/SignFormModal';
import type { StreetSign } from '../types';

interface GroupedRow extends StreetSign {
  cityRowSpan: number;
}

/**
 * 计算城市列 rowSpan，实现按城市分组展示。
 */
function buildGroupedRows(signs: StreetSign[]): GroupedRow[] {
  const rows: GroupedRow[] = [];
  let index = 0;

  while (index < signs.length) {
    const city = signs[index].city;
    let span = 0;
    let cursor = index;

    while (cursor < signs.length && signs[cursor].city === city) {
      span += 1;
      cursor += 1;
    }

    for (let offset = 0; offset < span; offset += 1) {
      rows.push({
        ...signs[index + offset],
        cityRowSpan: offset === 0 ? span : 0,
      });
    }
    index += span;
  }

  return rows;
}

/**
 * 路名牌列表页：按城市分组的表格 + 详情抽屉 + 基础 CRUD。
 */
export default function SignListPage() {
  const [signs, setSigns] = useState<StreetSign[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSign, setSelectedSign] = useState<StreetSign | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingSign, setEditingSign] = useState<StreetSign | null>(null);

  const loadSigns = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchSigns();
      setSigns(data);
    } catch {
      message.error('加载数据失败，请确认后端已启动');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSigns();
  }, [loadSigns]);

  const tableData = useMemo(() => buildGroupedRows(signs), [signs]);

  const cityCount = useMemo(
    () => new Set(signs.map((item) => item.city)).size,
    [signs],
  );

  const columns: ColumnsType<GroupedRow> = [
    {
      title: '城市',
      dataIndex: 'city',
      width: 100,
      onCell: (record) => ({
        rowSpan: record.cityRowSpan,
      }),
      render: (city: string) => <Tag color="blue">{city}</Tag>,
    },
    {
      title: '字体描述',
      dataIndex: 'font_description',
      ellipsis: true,
    },
    {
      title: '背景色',
      dataIndex: 'background_color',
      width: 140,
      render: (color: string) => (
        <Space size="small">
          <span
            style={{
              display: 'inline-block',
              width: 16,
              height: 16,
              borderRadius: 3,
              backgroundColor: color,
              border: '1px solid #d9d9d9',
            }}
          />
          <span>{color}</span>
        </Space>
      ),
    },
    {
      title: '材质',
      dataIndex: 'material',
      width: 100,
    },
    {
      title: '统一规范',
      dataIndex: 'is_unified_standard',
      width: 100,
      render: (value: boolean) => (
        <Tag color={value ? 'green' : 'default'}>{value ? '是' : '否'}</Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_, record) => (
        <Button
          type="link"
          size="small"
          onClick={() => {
            setSelectedSign(record);
            setDrawerOpen(true);
          }}
        >
          详情
        </Button>
      ),
    },
  ];

  const openCreate = () => {
    setEditingSign(null);
    setFormOpen(true);
  };

  const openEdit = (sign: StreetSign) => {
    setEditingSign(sign);
    setFormOpen(true);
  };

  return (
    <>
      <Space style={{ marginBottom: 16 }} wrap>
        <Button type="primary" onClick={openCreate}>
          新增记录
        </Button>
        <Button onClick={loadSigns} loading={loading}>
          刷新
        </Button>
        <span style={{ color: 'rgba(0,0,0,0.45)' }}>
          共 {cityCount} 个城市 · {signs.length} 条记录
        </span>
      </Space>

      <Table<GroupedRow>
        rowKey="id"
        columns={columns}
        dataSource={tableData}
        loading={loading}
        pagination={false}
        bordered
        size="middle"
      />

      <SignDetailDrawer
        open={drawerOpen}
        sign={selectedSign}
        onClose={() => setDrawerOpen(false)}
        onEdit={(sign) => {
          setDrawerOpen(false);
          openEdit(sign);
        }}
        onDeleted={loadSigns}
      />

      <SignFormModal
        open={formOpen}
        sign={editingSign}
        onClose={() => setFormOpen(false)}
        onSaved={loadSigns}
      />
    </>
  );
}
