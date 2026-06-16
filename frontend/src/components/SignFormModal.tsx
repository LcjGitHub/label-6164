import { Button, Form, Input, Modal, Select, Space, Switch, message } from 'antd';
import { useEffect, useMemo, useRef, useState } from 'react';

import { createMaterial, createSign, fetchMaterials, updateSign } from '../api/client';
import type { Material, StreetSign, StreetSignPayload } from '../types';
import StreetSignPreview from './StreetSignPreview';

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

  const [materials, setMaterials] = useState<Material[]>([]);
  const [searchValue, setSearchValue] = useState('');
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newMaterialDesc, setNewMaterialDesc] = useState('');
  const [addingMaterial, setAddingMaterial] = useState(false);
  const searchValueRef = useRef('');

  const bgColor = Form.useWatch('background_color', form);
  const fontDesc = Form.useWatch('font_description', form);
  const cityValue = Form.useWatch('city', form);

  const previewBgColor = useMemo(() => bgColor || sign?.background_color || '', [bgColor, sign]);
  const previewFontDesc = useMemo(() => fontDesc || sign?.font_description || '', [fontDesc, sign]);
  const previewCity = useMemo(() => cityValue || sign?.city || '', [cityValue, sign]);

  const loadMaterials = () => {
    fetchMaterials()
      .then(setMaterials)
      .catch(() => message.error('加载材质词典失败'));
  };

  useEffect(() => {
    if (open) {
      loadMaterials();
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

  const handleAddMaterial = async () => {
    const name = searchValueRef.current.trim();
    if (!name) {
      message.warning('请输入材质名称');
      return;
    }
    if (!newMaterialDesc.trim()) {
      message.warning('请输入材质说明');
      return;
    }
    setAddingMaterial(true);
    try {
      const newMaterial = await createMaterial({
        name,
        description: newMaterialDesc.trim(),
      });
      message.success(`已添加材质「${name}」`);
      setMaterials((prev) => [...prev, newMaterial]);
      form.setFieldsValue({ material: name });
      setAddModalOpen(false);
      setNewMaterialDesc('');
      setSearchValue('');
      searchValueRef.current = '';
    } catch (error) {
      const err = error as { response?: { data?: { detail?: string } } };
      message.error(err?.response?.data?.detail || '添加材质失败');
    } finally {
      setAddingMaterial(false);
    }
  };

  const openAddModal = () => {
    const name = searchValue.trim();
    if (!name) {
      message.warning('请先输入要添加的材质名称');
      return;
    }
    searchValueRef.current = name;
    setAddModalOpen(true);
  };

  const materialOptions = useMemo(() => {
    return materials.map((m) => ({
      value: m.name,
      label: (
        <Space>
          <span style={{ fontWeight: 500 }}>{m.name}</span>
          <span style={{ color: '#999', fontSize: 12 }}>{m.description}</span>
        </Space>
      ),
      searchLabel: m.name,
    }));
  }, [materials]);

  const filteredOptions = useMemo(() => {
    if (!searchValue.trim()) {
      return materialOptions;
    }
    const searchLower = searchValue.trim().toLowerCase();
    const filtered = materialOptions.filter((opt) =>
      (opt.searchLabel as string).toLowerCase().includes(searchLower)
    );
    return filtered;
  }, [materialOptions, searchValue]);

  const notFoundContent = (
    <div style={{ padding: '8px 12px' }}>
      <div style={{ marginBottom: 8, color: '#999', fontSize: 12 }}>
        未找到「{searchValue.trim() || '搜索内容'}」
      </div>
      <Button type="link" onClick={openAddModal} size="small">
        + 添加该材质
      </Button>
    </div>
  );

  return (
    <>
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
          <div style={{ marginBottom: 20 }}>
            <div style={{ marginBottom: 8, fontSize: 14, fontWeight: 500, color: '#666' }}>
              路名牌样例预览
            </div>
            <StreetSignPreview
              backgroundColor={previewBgColor}
              fontDescription={previewFontDesc}
              city={previewCity}
              height={100}
            />
          </div>
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
            rules={[
              { required: true, message: '请选择材质' },
              {
                validator: (_, value) => {
                  if (!value) return Promise.resolve();
                  const exists = materials.some((m) => m.name === value);
                  if (!exists) {
                    return Promise.reject(new Error('请从词典中选择材质，或添加新材质'));
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <Select
              showSearch
              placeholder="请搜索或选择材质"
              optionFilterProp="searchLabel"
              options={filteredOptions}
              onSearch={(value) => setSearchValue(value)}
              onClear={() => setSearchValue('')}
              notFoundContent={notFoundContent}
              allowClear
            />
          </Form.Item>
          <Form.Item
            name="discovery_decade"
            label="发现年代"
          >
            <Input placeholder="如：二十世纪八十年代（选填）" maxLength={64} allowClear />
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

      <Modal
        title="添加新材质"
        open={addModalOpen}
        onCancel={() => {
          setAddModalOpen(false);
          setNewMaterialDesc('');
        }}
        onOk={handleAddMaterial}
        confirmLoading={addingMaterial}
        okText="添加"
        cancelText="取消"
      >
        <div style={{ marginBottom: 16 }}>
          <div style={{ marginBottom: 8, color: '#666' }}>
            材质名称：<strong>{searchValueRef.current}</strong>
          </div>
          <div>
            <div style={{ marginBottom: 8 }}>材质说明：</div>
            <Input.TextArea
              value={newMaterialDesc}
              onChange={(e) => setNewMaterialDesc(e.target.value)}
              placeholder="请输入材质的简短说明"
              rows={3}
              maxLength={256}
              autoFocus
            />
          </div>
        </div>
      </Modal>
    </>
  );
}
