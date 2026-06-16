import { Form, Input, Modal, Switch, message } from 'antd';
import { useEffect } from 'react';

import { createSign, updateSign } from '../api/client';
import type { StreetSign, StreetSignPayload } from '../types';

interface SignFormModalProps {
  open: boolean;
  sign: StreetSign | null;
  onClose: () => void;
  onSaved: () => void;
}

/**
 * 新建/编辑路名牌记录的表单弹窗。
 */
export default function SignFormModal({
  open,
  sign,
  onClose,
  onSaved,
}: SignFormModalProps) {
  const [form] = Form.useForm<StreetSignPayload>();
  const isEdit = sign !== null;

  useEffect(() => {
    if (open) {
      if (sign) {
        form.setFieldsValue(sign);
      } else {
        form.resetFields();
        form.setFieldsValue({ is_unified_standard: false });
      }
    }
  }, [open, sign, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (isEdit && sign) {
        await updateSign(sign.id, values);
        message.success('已更新');
      } else {
        await createSign(values);
        message.success('已创建');
      }
      onSaved();
      onClose();
    } catch (error) {
      if (error && typeof error === 'object' && 'errorFields' in error) {
        return;
      }
      message.error(isEdit ? '更新失败' : '创建失败');
    }
  };

  return (
    <Modal
      title={isEdit ? '编辑路名牌' : '新增路名牌'}
      open={open}
      onCancel={onClose}
      onOk={handleSubmit}
      destroyOnClose
      okText="保存"
      cancelText="取消"
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        <Form.Item
          name="city"
          label="城市"
          rules={[{ required: true, message: '请输入城市' }]}
        >
          <Input placeholder="如：北京" maxLength={64} />
        </Form.Item>
        <Form.Item
          name="font_description"
          label="字体描述"
          rules={[{ required: true, message: '请输入字体描述' }]}
        >
          <Input.TextArea rows={3} placeholder="描述字体风格、使用场景等" />
        </Form.Item>
        <Form.Item
          name="background_color"
          label="背景色"
          rules={[{ required: true, message: '请输入背景色' }]}
        >
          <Input placeholder="如：#1E4D8C 或 蓝色" maxLength={32} />
        </Form.Item>
        <Form.Item
          name="material"
          label="材质"
          rules={[{ required: true, message: '请输入材质' }]}
        >
          <Input placeholder="如：搪瓷、铝合金" maxLength={64} />
        </Form.Item>
        <Form.Item
          name="is_unified_standard"
          label="是否统一规范"
          valuePropName="checked"
        >
          <Switch checkedChildren="是" unCheckedChildren="否" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
