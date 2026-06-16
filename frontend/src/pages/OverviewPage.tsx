import { Card, Col, Progress, Row, Statistic, Table, Tag, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useCallback, useEffect, useMemo, useState } from 'react';

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

  const maxCount = useMemo(() => {
    if (!stats?.city_stats.length) return 0;
    return Math.max(...stats.city_stats.map((item) => item.total_count));
  }, [stats]);

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
        <Progress
          percent={rate * 100}
          size="small"
          strokeColor={rate >= 0.8 ? '#52c41a' : rate >= 0.5 ? '#faad14' : '#ff4d4f'}
          format={(percent) => `${percent?.toFixed(1)}%`}
        />
      ),
      sorter: (a, b) => a.unified_rate - b.unified_rate,
    },
  ];

  const barChartData = useMemo(
    () =>
      [...(stats?.city_stats ?? [])].sort(
        (a, b) => b.total_count - a.total_count,
      ),
    [stats],
  );

  return (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={8}>
          <Card>
            <Statistic
              title="总城市数"
              value={stats?.total_cities ?? 0}
              suffix="个"
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8}>
          <Card>
            <Statistic
              title="总记录数"
              value={stats?.total_records ?? 0}
              suffix="条"
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      <Card title="各城市记录数对比" bordered={false} style={{ marginBottom: 24 }}>
        <Row gutter={[12, 12]}>
          {barChartData.map((item) => {
            const percent = maxCount > 0 ? (item.total_count / maxCount) * 100 : 0;
            return (
              <Col xs={24} sm={12} md={8} key={item.city}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                  }}
                >
                  <Tag color="blue" style={{ minWidth: 50 }}>
                    {item.city}
                  </Tag>
                  <div
                    style={{
                      flex: 1,
                      height: 20,
                      backgroundColor: '#f0f0f0',
                      borderRadius: 4,
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${percent}%`,
                        backgroundColor: '#1890ff',
                        borderRadius: 4,
                        transition: 'width 0.3s ease',
                      }}
                    />
                    <span
                      style={{
                        position: 'absolute',
                        right: 8,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        fontSize: 12,
                        color: 'rgba(0,0,0,0.65)',
                        fontWeight: 500,
                      }}
                    >
                      {item.total_count} 条
                    </span>
                  </div>
                </div>
              </Col>
            );
          })}
        </Row>
      </Card>

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
