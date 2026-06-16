import { Col, Row, Space, Tag, Typography } from 'antd';
import type { StreetSign } from '../types';
import StreetSignPreview from './StreetSignPreview';

const { Text } = Typography;

interface ComparisonDisplayProps {
  signA: StreetSign | null;
  signB: StreetSign | null;
}

interface FieldConfig {
  key: keyof StreetSign;
  label: string;
  render?: (value: StreetSign[keyof StreetSign]) => React.ReactNode;
}

const FIELD_CONFIGS: FieldConfig[] = [
  { key: 'city', label: '城市' },
  { key: 'font_description', label: '字体描述' },
  {
    key: 'background_color',
    label: '背景色',
    render: (value) => (
      <Space size="small">
        <span
          style={{
            display: 'inline-block',
            width: 16,
            height: 16,
            borderRadius: 3,
            backgroundColor: value as string,
            border: '1px solid #d9d9d9',
          }}
        />
        <code>{value as string}</code>
      </Space>
    ),
  },
  { key: 'material', label: '材质' },
  {
    key: 'discovery_decade',
    label: '发现年代',
    render: (value) =>
      value ? (
        <Tag color="purple">{value as string}</Tag>
      ) : (
        <span style={{ color: '#999' }}>-</span>
      ),
  },
  {
    key: 'is_unified_standard',
    label: '是否统一规范',
    render: (value) => (
      <Tag color={(value as boolean) ? 'green' : 'orange'}>
        {(value as boolean) ? '是' : '否'}
      </Tag>
    ),
  },
];

function isDifferent(
  a: StreetSign | null,
  b: StreetSign | null,
  key: keyof StreetSign,
): boolean {
  if (!a || !b) return false;
  return a[key] !== b[key];
}

function getDiffStyle(different: boolean): React.CSSProperties {
  if (!different) return {};
  return {
    backgroundColor: '#fff1f0',
    border: '1px solid #ffa39e',
    borderRadius: 4,
    padding: '4px 8px',
  };
}

function getDiffLabel(different: boolean): React.ReactNode {
  if (!different) return null;
  return <Tag color="red" style={{ marginLeft: 8 }}>有差异</Tag>;
}

export default function ComparisonDisplay({
  signA,
  signB,
}: ComparisonDisplayProps) {
  const hasBoth = signA && signB;

  return (
    <div>
      <Row gutter={24} style={{ marginBottom: 16 }}>
        <Col span={12}>
          <div
            style={{
              border: '1px solid #e8e8e8',
              borderRadius: 6,
              padding: 8,
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            {signA ? (
              <>
                <StreetSignPreview
                  backgroundColor={signA.background_color}
                  fontDescription={signA.font_description}
                  city={signA.city}
                  height={44}
                />
                <Text strong>
                  {signA.city} · #{signA.id}
                </Text>
              </>
            ) : (
              <Text type="secondary">请选择记录甲</Text>
            )}
          </div>
        </Col>
        <Col span={12}>
          <div
            style={{
              border: '1px solid #e8e8e8',
              borderRadius: 6,
              padding: 8,
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            {signB ? (
              <>
                <StreetSignPreview
                  backgroundColor={signB.background_color}
                  fontDescription={signB.font_description}
                  city={signB.city}
                  height={44}
                />
                <Text strong>
                  {signB.city} · #{signB.id}
                </Text>
              </>
            ) : (
              <Text type="secondary">请选择记录乙</Text>
            )}
          </div>
        </Col>
      </Row>

      <div
        style={{
          border: '1px solid #e8e8e8',
          borderRadius: 8,
          overflow: 'hidden',
        }}
      >
        <Row
          style={{
            backgroundColor: '#fafafa',
            fontWeight: 600,
            borderBottom: '1px solid #e8e8e8',
          }}
        >
          <Col
            span={8}
            style={{
              padding: '12px 16px',
              borderRight: '1px solid #e8e8e8',
            }}
          >
            字段
          </Col>
          <Col
            span={8}
            style={{
              padding: '12px 16px',
              borderRight: '1px solid #e8e8e8',
            }}
          >
            记录甲
          </Col>
          <Col span={8} style={{ padding: '12px 16px' }}>
            记录乙
          </Col>
        </Row>

        {FIELD_CONFIGS.map((config) => {
          const different = isDifferent(signA, signB, config.key);
          return (
            <Row
              key={config.key}
              style={{ borderBottom: '1px solid #f0f0f0' }}
            >
              <Col
                span={8}
                style={{
                  padding: '12px 16px',
                  borderRight: '1px solid #f0f0f0',
                  color: 'rgba(0,0,0,0.85)',
                  fontWeight: 500,
                }}
              >
                {config.label}
                {hasBoth && getDiffLabel(different)}
              </Col>
              <Col
                span={8}
                style={{
                  padding: '12px 16px',
                  borderRight: '1px solid #f0f0f0',
                }}
              >
                {signA ? (
                  <div style={getDiffStyle(different)}>
                    {config.render
                      ? config.render(signA[config.key])
                      : (signA[config.key] as React.ReactNode)}
                  </div>
                ) : (
                  <Text type="secondary">未选择</Text>
                )}
              </Col>
              <Col span={8} style={{ padding: '12px 16px' }}>
                {signB ? (
                  <div style={getDiffStyle(different)}>
                    {config.render
                      ? config.render(signB[config.key])
                      : (signB[config.key] as React.ReactNode)}
                  </div>
                ) : (
                  <Text type="secondary">未选择</Text>
                )}
              </Col>
            </Row>
          );
        })}
      </div>
    </div>
  );
}
