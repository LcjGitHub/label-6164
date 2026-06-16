import { Button, Input, Select, Space, Table, Tag, Typography, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { fetchCityDirectory, fetchSigns } from '../api/client';
import SignDetailDrawer from '../components/SignDetailDrawer';
import SignFormModal from '../components/SignFormModal';
import type { CityDirectoryItem, StreetSign } from '../types';

const { Text } = Typography;

interface SignListPageProps {
  initialCity?: string;
}

interface GroupedRow extends StreetSign {
  cityRowSpan: number;
}

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

export default function SignListPage({ initialCity }: SignListPageProps) {
  const [signs, setSigns] = useState<StreetSign[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [selectedSign, setSelectedSign] = useState<StreetSign | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingSign, setEditingSign] = useState<StreetSign | null>(null);

  const [filterCity, setFilterCity] = useState<string | undefined>(initialCity);
  const [materialInput, setMaterialInput] = useState<string>('');
  const [filterMaterial, setFilterMaterial] = useState<string>('');
  const [cityOptions, setCityOptions] = useState<CityDirectoryItem[]>([]);

  useEffect(() => {
    fetchCityDirectory()
      .then((res) => setCityOptions(res.cities))
      .catch(() => {});
  }, []);

  useEffect(() => {
    setFilterCity(initialCity);
  }, [initialCity]);

  const loadSigns = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchSigns(filterCity, filterMaterial || undefined, page, pageSize);
      setSigns(data.items);
      setTotal(data.total);
    } catch {
      message.error('加载数据失败，请确认后端已启动');
    } finally {
      setLoading(false);
    }
  }, [filterCity, filterMaterial, page, pageSize]);

  useEffect(() => {
    loadSigns();
  }, [loadSigns]);

  const hasFilter = Boolean(filterCity || filterMaterial);

  const clearFilters = () => {
    setFilterCity(undefined);
    setMaterialInput('');
    setFilterMaterial('');
    setPage(1);
  };

  useEffect(() => {
    setPage(1);
  }, [filterCity, filterMaterial]);

  const tableData = useMemo(() => buildGroupedRows(signs), [signs]);

  useEffect(() => {
    if (!drawerOpen || !selectedSign) return;
    const newIndex = tableData.findIndex((item) => item.id === selectedSign.id);
    if (newIndex >= 0) {
      setCurrentIndex(newIndex);
    } else {
      setDrawerOpen(false);
    }
  }, [tableData]);

  const displayCount = hasFilter ? signs.length : total;

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
      title: '发现年代',
      dataIndex: 'discovery_decade',
      width: 130,
      render: (value: string | null) =>
        value ? (
          <Tag color="purple">{value}</Tag>
        ) : (
          <span style={{ color: '#999' }}>-</span>
        ),
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
            const index = tableData.findIndex((item) => item.id === record.id);
            setCurrentIndex(index >= 0 ? index : 0);
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

  const handlePrev = () => {
    if (currentIndex <= 0) return;
    const newIndex = currentIndex - 1;
    setCurrentIndex(newIndex);
    setSelectedSign(tableData[newIndex]);
  };

  const handleNext = () => {
    if (currentIndex >= tableData.length - 1) return;
    const newIndex = currentIndex + 1;
    setCurrentIndex(newIndex);
    setSelectedSign(tableData[newIndex]);
  };

  return (
    <>
      <Space style={{ marginBottom: 16 }} wrap align="center">
        <Button type="primary" onClick={openCreate}>
          新增记录
        </Button>
        <Button onClick={loadSigns} loading={loading}>
          刷新
        </Button>

        <Select
          placeholder="选择城市"
          allowClear
          style={{ width: 160 }}
          value={filterCity}
          onChange={(value) => setFilterCity(value ?? undefined)}
          options={cityOptions.map((c) => ({ label: `${c.city} (${c.record_count})`, value: c.city }))}
        />

        <Input.Search
          placeholder="材质关键词"
          allowClear
          style={{ width: 180 }}
          value={materialInput}
          onChange={(e) => setMaterialInput(e.target.value)}
          onSearch={(value) => setFilterMaterial(value)}
        />

        {hasFilter && (
          <Button size="small" onClick={clearFilters}>
            清空筛选
          </Button>
        )}

        <Text type="secondary">
          {hasFilter
            ? `筛选结果：${displayCount} / ${total} 条记录`
            : `共 ${displayCount} 条记录`}
        </Text>
      </Space>

      <Table<GroupedRow>
        rowKey="id"
        columns={columns}
        dataSource={tableData}
        loading={loading}
        pagination={{
          current: page,
          pageSize,
          total,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (t) => `共 ${t} 条`,
          onChange: (p, ps) => {
            setPage(p);
            setPageSize(ps);
          },
        }}
        bordered
        size="middle"
      />

      <SignDetailDrawer
        open={drawerOpen}
        sign={selectedSign}
        signList={tableData}
        currentIndex={currentIndex}
        onClose={() => setDrawerOpen(false)}
        onEdit={(sign) => {
          setDrawerOpen(false);
          openEdit(sign);
        }}
        onDeleted={loadSigns}
        onPrev={handlePrev}
        onNext={handleNext}
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
