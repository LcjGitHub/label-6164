import { Alert, Col, Row, Select, Spin, Typography, message } from 'antd';
import { useCallback, useEffect, useState } from 'react';

import { fetchAllSigns, fetchSignsForComparison } from '../api/client';
import ComparisonDisplay from '../components/ComparisonDisplay';
import type { StreetSign } from '../types';

const { Title } = Typography;
const { Option } = Select;

export default function ComparisonPage() {
  const [signList, setSignList] = useState<StreetSign[]>([]);
  const [listLoading, setListLoading] = useState(false);
  const [signA, setSignA] = useState<StreetSign | null>(null);
  const [signB, setSignB] = useState<StreetSign | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedA, setSelectedA] = useState<number | null>(null);
  const [selectedB, setSelectedB] = useState<number | null>(null);

  const loadSignList = useCallback(async () => {
    setListLoading(true);
    try {
      const data = await fetchAllSigns();
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

  const handleSelectA = (id: number | null) => {
    setSelectedA(id);
    if (!id) {
      setSignA(null);
    }
  };

  const handleSelectB = (id: number | null) => {
    setSelectedB(id);
    if (!id) {
      setSignB(null);
    }
  };

  useEffect(() => {
    if (!selectedA || !selectedB) {
      if (!selectedA) setSignA(null);
      if (!selectedB) setSignB(null);
      return;
    }

    if (selectedA === selectedB) {
      return;
    }

    let cancelled = false;
    setLoading(true);
    fetchSignsForComparison(selectedA, selectedB)
      .then(([a, b]) => {
        if (!cancelled) {
          setSignA(a);
          setSignB(b);
        }
      })
      .catch(() => {
        if (!cancelled) {
          message.error('加载记录详情失败');
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [selectedA, selectedB]);

  const isSameRecord = selectedA !== null && selectedB !== null && selectedA === selectedB;
  const canCompare = selectedA !== null && selectedB !== null && !isSameRecord;

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
              选择记录甲
            </div>
            <Select
              style={{ width: '100%' }}
              placeholder="请选择记录甲"
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
              选择记录乙
            </div>
            <Select
              style={{ width: '100%' }}
              placeholder="请选择记录乙"
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

      {isSameRecord && (
        <Alert
          type="warning"
          showIcon
          message="记录甲与记录乙不能为同一条记录，请重新选择。"
          style={{ marginBottom: 16 }}
        />
      )}

      <Spin spinning={loading}>
        {canCompare ? (
          <ComparisonDisplay signA={signA} signB={signB} />
        ) : (
          !isSameRecord && (
            <ComparisonDisplay signA={signA} signB={signB} />
          )
        )}
      </Spin>
    </div>
  );
}
