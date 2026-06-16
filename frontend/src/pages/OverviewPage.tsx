import { Card, Col, Progress, Row, Statistic, Table, Tag, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useCallback, useEffect, useState } from 'react';

import { fetchStatsOverview } from '../api/client';
import type { CityStats, StatsOverview } from '../types';

export default function OverviewPage() {
  const [stats, setStats] = useState<StatsOverview | null>(null);
  const [loading, setLoading] = useState(false);

  const loadStats = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchStatsOverview();
      setStats(data);
    } catch {
      message.error('加载统计数据失败，请确认后端已启动');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const columns: ColumnsType<CityStats> = [
    {
      title: '城市',
      dataIndex: 'city',
      width: 100,
      render: (city: string) => <Tag color="blue">{city}</Tag>,
    },
    {
      title: '记录数',
      dataIndex: 'total_count',
      width: 100,
      sorter: (a, b) => a.total_count - b.total_count,
    },
    {
      title: '规范数',
      dataIndex: 'unified_count',
      width: 100,
      sorter: (a, b) => a.unified_count - b.unified_count,
    },
    {
      title: '规范率',
      dataIndex: 'unified_rate',
      render: (rate: number) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Progress
            percent={rate * 100}
            size="small"
            style={{ flex: 1, minWidth: 120 }}
            strokeColor={rate >= 0.8 ? '#52c41a' : rate >= 0.5 ? '#faad14' : '#ff4d4f'}
          />
          <span style={{ minWidth: 50, textAlign: 'right' }}>
            {(rate * 100).toFixed(1)}%
          </span>
        </div>
      ),
      sorter: (a, b) => a.unified_rate - b.unified_rate,
    },
  ];

  return (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="总城市数"
              value={stats?.total_cities ?? 0}
              suffix="个"
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="总记录数"
              value={stats?.total_records ?? 0}
              suffix="条"
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="规范记录"
              value={stats?.total_unified ?? 0}
              suffix="条"
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="总体规范率"
              value={((stats?.overall_unified_rate ?? 0) * 100).toFixed(1)}
              suffix="%"
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
      </Row>

      <Card title="各城市明细" bordered={false}>
        <Table<CityStats>
          rowKey="city"
          columns={columns}
          dataSource={stats?.city_stats ?? []}
          loading={loading}
          pagination={false}
          bordered
          size="middle"
        />
      </Card>
    </div>
  );
}
