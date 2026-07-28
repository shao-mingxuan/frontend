import React, { useState, useCallback, useMemo } from 'react';
import { Button, Tag, Space, Input, Modal, Form, Table, message, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { SearchTable } from '@/components/common';
import type { TableQueryParams, PaginatedData } from '@/types';
import { dictApi } from '@/services/api';

interface DictRecord {
  id: string;
  code: string;
  name: string;
  description: string;
  items: Array<{ label: string; value: string; sort: number }>;
  [key: string]: unknown;
}

const DictManagement: React.FC = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<DictRecord | null>(null);
  const [form] = Form.useForm();

  const fetchData = useCallback(
    async (params: TableQueryParams): Promise<PaginatedData<DictRecord>> => {
      const res = await dictApi.getList(params);
      if (res.success && res.data) return res.data as PaginatedData<DictRecord>;
      return { list: [], total: 0, current: 1, pageSize: 20 };
    },
    []
  );

  const handleAdd = () => {
    setEditingRecord(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record: DictRecord) => {
    setEditingRecord(record);
    form.setFieldsValue({
      ...record,
      itemsText: record.items?.map((i) => `${i.label}=${i.value}`).join('\n'),
    });
    setModalVisible(true);
  };

  const handleDelete = async (record: DictRecord) => {
    try {
      const res = await dictApi.remove(record.id);
      if (res.success) message.success(`已删除字典: ${record.name}`);
    } catch {
      message.error('删除失败');
    }
  };

  const handleBatchDelete = async (keys: React.Key[]) => {
    try {
      for (const key of keys) await dictApi.remove(String(key));
      message.success(`已批量删除 ${keys.length} 条记录`);
    } catch {
      message.error('批量删除失败');
    }
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      // 解析 items: "标签1=值1\n标签2=值2"
      const items = (values.itemsText || '')
        .split('\n')
        .filter((line: string) => line.trim())
        .map((line: string, idx: number) => {
          const [label, value] = line.split('=').map((s: string) => s.trim());
          return { label: label || '', value: value || '', sort: idx + 1 };
        });
      const data = { code: values.code, name: values.name, description: values.description, items };
      if (editingRecord) {
        const res = await dictApi.update(editingRecord.id, data);
        if (res.success) message.success('更新成功');
      } else {
        const res = await dictApi.create(data);
        if (res.success) message.success('新增成功');
      }
      setModalVisible(false);
    } catch {}
  };

  const columns = useMemo(() => [
    { title: 'ID', dataIndex: 'id', width: 60 },
    { title: '编码', dataIndex: 'code', width: 150 },
    { title: '名称', dataIndex: 'name', width: 150 },
    { title: '描述', dataIndex: 'description', width: 200, ellipsis: true },
    {
      title: '字典项',
      dataIndex: 'items',
      width: 200,
      render: (items: Array<{ label: string; value: string }>) =>
        items?.map((i) => <Tag key={i.value}>{i.label}({i.value})</Tag>),
    },
    {
      title: '操作',
      key: 'action',
      width: 160,
      fixed: 'right' as const,
      render: (_: unknown, record: DictRecord) => (
        <Space>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>编辑</Button>
          <Popconfirm title="确定删除此字典?" onConfirm={() => handleDelete(record)} okText="确定" cancelText="取消">
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ], []);

  const searchFields = [
    { name: 'code', label: '编码', render: <Input placeholder="请输入编码" allowClear />, span: 6 },
    { name: 'name', label: '名称', render: <Input placeholder="请输入名称" allowClear />, span: 6 },
  ];

  return (
    <>
      <SearchTable<DictRecord>
        fetchData={fetchData}
        columns={columns}
        searchFields={searchFields}
        onAdd={handleAdd}
        onBatchDelete={handleBatchDelete}
        scroll={{ x: 900 }}
      />

      <Modal
        title={editingRecord ? '编辑字典' : '新增字典'}
        open={modalVisible}
        onOk={handleSave}
        onCancel={() => setModalVisible(false)}
        width={550}
        destroyOnClose
      >
        <Form form={form} labelCol={{ span: 5 }} wrapperCol={{ span: 18 }}>
          <Form.Item name="code" label="编码" rules={[{ required: true, message: '请输入编码' }]}>
            <Input placeholder="如: user_status" disabled={!!editingRecord} />
          </Form.Item>
          <Form.Item name="name" label="名称" rules={[{ required: true, message: '请输入名称' }]}>
            <Input placeholder="如: 用户状态" />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input placeholder="请输入字典描述" />
          </Form.Item>
          <Form.Item name="itemsText" label="字典项" extra="每行一项，格式: 标签=值，如: 正常=active">
            <Input.TextArea placeholder="正常=active&#10;停用=inactive&#10;锁定=locked" rows={5} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default DictManagement;
