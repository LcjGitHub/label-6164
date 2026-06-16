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

function buildGroupedRows(signs: StreetSign[], firstCityContinued: boolean = false): GroupedRow[] {
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

    const isFirstGroup = index === 0;
    for (let offset = 0; offset < span; offset += 1) {
      rows.push({
        ...signs[index + offset],
        cityRowSpan: isFirstGroup && firstCityContinued
          ? 0
          : offset === 0
            ? span
            : 0,
      });
    }
    index += span;
  }

  return rows;
}

export default function SignListPage({ initialCity }: SignListPageProps) {
  const [signs, setSigns] = useState<StreetSign[]>([]);
  const [total, setTotal] = useState(0);
  const [totalCities, setTotalCities] = useState(0);
  const [firstCityContinued, setFirstCityContinued] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [selectedSign, setSelectedSign] = useState<StreetSign | null>(null);
  const [globalIndex, setGlobalIndex] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingSign, setEditingSign] = useState<StreetSign | null>(null);

  const [allCitiesTotal, setAllCitiesTotal] = useState(0);
  const [allRecordsTotal, setAllRecordsTotal] = useState(0);

  const [filterCity, setFilterCity] = useState<string | undefined>(initialCity);
  const [materialInput, setMaterialInput] = useState<string>('');
  const [filterMaterial, setFilterMaterial] = useState<string>('');
  const [cityOptions, setCityOptions] = useState<CityDirectoryItem[]>([]);

  useEffect(() => {
    fetchCityDirectory()
      .then((res) => {
        setCityOptions(res.cities);
        setAllCitiesTotal(res.total_cities);
        setAllRecordsTotal(res.total_records);
      })
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
      setTotalCities(data.total_cities);
      setFirstCityContinued(data.first_city_continued);
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

  const tableData = useMemo(
    () => buildGroupedRows(signs, firstCityContinued),
    [signs, firstCityContinued],
  );

  useEffect(() => {
    if (!drawerOpen || !selectedSign) return;
    const idx = tableData.findIndex((item) => item.id === selectedSign.id);
    if (idx < 0) {
      setDrawerOpen(false);
    }
  }, [tableData, drawerOpen, selectedSign]);

  const displayRecords = hasFilter ? total : allRecordsTotal;
  const displayCities = hasFilter ? totalCities : allCitiesTotal;

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
            const idx = tableData.findIndex((item) => item.id === record.id);
            setGlobalIndex((page - 1) * pageSize + (idx >= 0 ? idx : 0));
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

  const handlePrev = useCallback(async () => {
    if (globalIndex <= 0) return;
    const newGlobalIndex = globalIndex - 1;
    const newPage = Math.floor(newGlobalIndex / pageSize) + 1;

    if (newPage !== page) {
      setPage(newPage);
      try {
        const data = await fetchSigns(filterCity, filterMaterial || undefined, newPage, pageSize);
        const localIdx = newGlobalIndex - (newPage - 1) * pageSize;
        setGlobalIndex(newGlobalIndex);
        setSelectedSign(data.items[localIdx] ?? null);
      } catch {
        message.error('加载数据失败');
      }
    } else {
      const localIdx = newGlobalIndex - (page - 1) * pageSize;
      setGlobalIndex(newGlobalIndex);
      setSelectedSign(tableData[localIdx] ?? null);
    }
  }, [globalIndex, page, pageSize, tableData, filterCity, filterMaterial]);

  const handleNext = useCallback(async () => {
    if (globalIndex >= total - 1) return;
    const newGlobalIndex = globalIndex + 1;
    const newPage = Math.floor(newGlobalIndex / pageSize) + 1;

    if (newPage !== page) {
      setPage(newPage);
      try {
        const data = await fetchSigns(filterCity, filterMaterial || undefined, newPage, pageSize);
        const localIdx = newGlobalIndex - (newPage - 1) * pageSize;
        setGlobalIndex(newGlobalIndex);
        setSelectedSign(data.items[localIdx] ?? null);
      } catch {
        message.error('加载数据失败');
      }
    } else {
      const localIdx = newGlobalIndex - (page - 1) * pageSize;
      setGlobalIndex(newGlobalIndex);
      setSelectedSign(tableData[localIdx] ?? null);
    }
  }, [globalIndex, total, page, pageSize, tableData, filterCity, filterMaterial]);

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
            ? `筛选结果：${displayRecords} 条记录 · ${displayCities} 个城市`
            : `共 ${displayRecords} 条记录 · ${displayCities} 个城市`}
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
        currentIndex={globalIndex}
        totalCount={total}
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
