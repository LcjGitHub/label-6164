import {
  Button,
  Descriptions,
  Drawer,
  Popconfirm,
  Space,
  Tag,
  message,
} from 'antd';
import dayjs from 'dayjs';

import { deleteSign } from '../api/client';
import type { StreetSign } from '../types';
import StreetSignPreview from './StreetSignPreview';

interface SignDetailDrawerProps {
  open: boolean;
  sign: StreetSign | null;
  onClose: () => void;
  onEdit: (sign: StreetSign) => void;
  onDeleted: () => void;
}

/**
 * 路名牌详情抽屉，展示完整字段并支持编辑/删除。
 */
export default function SignDetailDrawer({
  open,
  sign,
  onClose,
  onEdit,
  onDeleted,
}: SignDetailDrawerProps) {
  const handleDelete = async () => {
    if (!sign) return;
    try {
      await deleteSign(sign.id);
      message.success('已删除');
      onDeleted();
      onClose();
    } catch {
      message.error('删除失败');
    }
  };

  return (
    <Drawer
      title={sign ? `${sign.city} · 路名牌详情` : '路名牌详情'}
      width={480}
      open={open}
      onClose={onClose}
      extra={
        sign ? (
          <Space>
            <Button type="primary" onClick={() => onEdit(sign)}>
              编辑
            </Button>
            <Popconfirm title="确定删除此记录？" onConfirm={handleDelete}>
              <Button danger>删除</Button>
            </Popconfirm>
          </Space>
        ) : null
      }
    >
      {sign ? (
        <>
          <div style={{ marginBottom: 16 }}>
            <div style={{ marginBottom: 8, fontSize: 14, fontWeight: 500, color: '#666' }}>
              路名牌样例预览
            </div>
            <StreetSignPreview
              backgroundColor={sign.background_color}
              fontDescription={sign.font_description}
              city={sign.city}
              height={110}
            />
          </div>
          <Descriptions column={1} bordered size="small">
          <Descriptions.Item label="城市">{sign.city}</Descriptions.Item>
          <Descriptions.Item label="字体描述">{sign.font_description}</Descriptions.Item>
          <Descriptions.Item label="背景色">
            <Space>
              <span
                style={{
                  display: 'inline-block',
                  width: 20,
                  height: 20,
                  borderRadius: 4,
                  backgroundColor: sign.background_color,
                  border: '1px solid #d9d9d9',
                  verticalAlign: 'middle',
                }}
              />
              <code>{sign.background_color}</code>
            </Space>
          </Descriptions.Item>
          <Descriptions.Item label="材质">{sign.material}</Descriptions.Item>
          <Descriptions.Item label="是否统一规范">
            <Tag color={sign.is_unified_standard ? 'green' : 'orange'}>
              {sign.is_unified_standard ? '是' : '否'}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="记录编号">#{sign.id}</Descriptions.Item>
          <Descriptions.Item label="浏览时间">
            {dayjs().format('YYYY-MM-DD HH:mm')}
          </Descriptions.Item>
          </Descriptions>
        </>
      ) : null}
    </Drawer>
  );
}
