import { Button, Card, Col, Empty, Row, Skeleton, Space, Statistic, Typography, message } from 'antd';
import { EnvironmentOutlined, ReloadOutlined } from '@ant-design/icons';
import { useCallback, useEffect, useState } from 'react';

import { fetchCityDirectory } from '../api/client';
import type { CityDirectoryItem } from '../types';

const { Title } = Typography;

interface CityDirectoryPageProps {
  onCityClick: (city: string) => void;
}

export default function CityDirectoryPage({ onCityClick }: CityDirectoryPageProps) {
  const [cities, setCities] = useState<CityDirectoryItem[]>([]);
  const [totalCities, setTotalCities] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(false);

  const loadCities = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchCityDirectory();
      setCities(data.cities);
      setTotalCities(data.total_cities);
      setTotalRecords(data.total_records);
    } catch {
      message.error('加载城市目录失败，请确认后端已启动');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCities();
  }, [loadCities]);

  const isEmpty = !loading && cities.length === 0;

  return (
    <div>
      <Space direction="vertical" size="large" style={{ width: '100%', marginBottom: 24 }}>
        <Row gutter={16}>
          <Col span={12}>
            <Card>
              <Statistic title="城市总数" value={totalCities} prefix={<EnvironmentOutlined />} />
            </Card>
          </Col>
          <Col span={12}>
            <Card>
              <Statistic title="记录总数" value={totalRecords} />
            </Card>
          </Col>
        </Row>

        <Space style={{ marginBottom: 16 }}>
          <Title level={4} style={{ margin: 0 }}>
            按城市浏览
          </Title>
          <Button
            icon={<ReloadOutlined />}
            onClick={loadCities}
            loading={loading}
          >
            刷新
          </Button>
        </Space>

        <Skeleton loading={loading} active paragraph={{ rows: 4 }}>
          {isEmpty ? (
            <Empty
              description="暂无城市数据"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            >
              <Button type="primary" icon={<ReloadOutlined />} onClick={loadCities}>
                刷新重试
              </Button>
            </Empty>
          ) : (
            <Row gutter={[16, 16]}>
              {cities.map((item) => (
                <Col xs={24} sm={12} md={8} lg={6} key={item.city}>
                  <Card
                    hoverable
                    onClick={() => onCityClick(item.city)}
                    style={{ height: '100%' }}
                    bodyStyle={{ padding: '20px' }}
                  >
                    <Space direction="vertical" size="small" style={{ width: '100%' }}>
                      <div
                        style={{
                          fontSize: 18,
                          fontWeight: 600,
                          color: '#1890ff',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                        }}
                      >
                        <EnvironmentOutlined />
                        {item.city}
                      </div>
                      <div style={{ color: 'rgba(0,0,0,0.45)', fontSize: 14 }}>
                        {item.record_count} 条记录
                      </div>
                    </Space>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </Skeleton>
      </Space>
    </div>
  );
}
