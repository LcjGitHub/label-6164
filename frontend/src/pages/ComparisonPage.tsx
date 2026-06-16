import { Col, Row, Select, Spin, Typography, message } from 'antd';
import { useCallback, useEffect, useState } from 'react';

import { fetchSign, fetchSigns } from '../api/client';
import ComparisonDisplay from '../components/ComparisonDisplay';
import type { StreetSign } from '../types';

const { Title } = Typography;
const { Option } = Select;

export default function ComparisonPage() {
  const [signList, setSignList] = useState<StreetSign[]>([]);
  const [listLoading, setListLoading] = useState(false);
  const [signA, setSignA] = useState<StreetSign | null>(null);
  const [signB, setSignB] = useState<StreetSign | null>(null);
  const [loadingA, setLoadingA] = useState(false);
  const [loadingB, setLoadingB] = useState(false);
  const [selectedA, setSelectedA] = useState<number | null>(null);
  const [selectedB, setSelectedB] = useState<number | null>(null);

  const loadSignList = useCallback(async () => {
    setListLoading(true);
    try {
      const data = await fetchSigns();
      setSignList(data);
    } catch {
      message.error('加载记录列表失败，请确认后端已启动');
    } finally {
      setListLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSignList();
  }, [loadSignList]);

  const handleSelectA = async (id: number | null) => {
    setSelectedA(id);
    if (!id) {
      setSignA(null);
      return;
    }
    setLoadingA(true);
    try {
      const data = await fetchSign(id);
      setSignA(data);
    } catch {
      message.error('加载记录详情失败');
    } finally {
      setLoadingA(false);
    }
  };

  const handleSelectB = async (id: number | null) => {
    setSelectedB(id);
    if (!id) {
      setSignB(null);
      return;
    }
    setLoadingB(true);
    try {
      const data = await fetchSign(id);
      setSignB(data);
    } catch {
      message.error('加载记录详情失败');
    } finally {
      setLoadingB(false);
    }
  };

  return (
    <div>
      <Title level={4} style={{ marginTop: 0, marginBottom: 16 }}>
        双条对比工作台
      </Title>

      <div
        style={{
          background: '#f5f5f5',
          borderRadius: 8,
          padding: 24,
          marginBottom: 24,
        }}
      >
        <Row gutter={24} align="middle">
          <Col span={12}>
            <div style={{ marginBottom: 8, fontWeight: 500 }}>
              选择记录 A
            </div>
            <Select
              style={{ width: '100%' }}
              placeholder="请选择第一条路名牌记录"
              loading={listLoading}
              value={selectedA}
              onChange={handleSelectA}
              allowClear
              showSearch
              optionFilterProp="children"
            >
              {signList.map((sign) => (
                <Option key={sign.id} value={sign.id}>
                  #{sign.id} · {sign.city} · {sign.font_description}
                </Option>
              ))}
            </Select>
          </Col>
          <Col span={12}>
            <div style={{ marginBottom: 8, fontWeight: 500 }}>
              选择记录 B
            </div>
            <Select
              style={{ width: '100%' }}
              placeholder="请选择第二条路名牌记录"
              loading={listLoading}
              value={selectedB}
              onChange={handleSelectB}
              allowClear
              showSearch
              optionFilterProp="children"
            >
              {signList.map((sign) => (
                <Option key={sign.id} value={sign.id}>
                  #{sign.id} · {sign.city} · {sign.font_description}
                </Option>
              ))}
            </Select>
          </Col>
        </Row>
      </div>

      <Spin spinning={loadingA || loadingB}>
        <ComparisonDisplay signA={signA} signB={signB} />
      </Spin>
    </div>
  );
}
