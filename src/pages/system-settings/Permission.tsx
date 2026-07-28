import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Button, Tag, Space, Input, Modal, Form, Select, message, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { SearchTable } from '@/components/common';
import type { TableQueryParams, PaginatedData } from '@/types';
import { permissionApi } from '@/services/api';

interface PermissionRecord {
  id: string;
  code: string;
  name: string;
  type: string;
  parentId: string | null;
  [key: string]: unknown;
}

const typeMap: Record<string, { color: string; text: string }> = {
  menu: { color: 'blue', text: '菜单' },
  button: { color: 'orange', text: '按钮' },
};

const PermissionManagement: React.FC = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<PermissionRecord | null>(null);
  const [form] = Form.useForm();

  const fetchData = useCallback(
    async (params: TableQueryParams): Promise<PaginatedData<PermissionRecord>> => {
      const res = await permissionApi.getList();
      if (res.success && res.data) {
        const list = res.data as PermissionRecord[];
        const start = (params.current - 1) * params.pageSize;
        const end = start + params.pageSize;
        return { list: list.slice(start, end), total: list.length, current: params.current, pageSize: params.pageSize };
      }
      return { list: [], total: 0, current: 1, pageSize: 20 };
    },
    []
  );

  const handleAdd = () => {
    setEditingRecord(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record: PermissionRecord) => {
    setEditingRecord(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleDelete = async (record: PermissionRecord) => {
    try {
      const res = await permissionApi.remove(record.id);
      if (res.success) message.success(`已删除权限: ${record.name}`);
    } catch {
      message.error('删除失败');
    }
  };

  const handleBatchDelete = async (keys: React.Key[]) => {
    try {
      for (const key of keys) await permissionApi.remove(String(key));
      message.success(`已批量删除 ${keys.length} 条记录`);
    } catch {
      message.error('批量删除失败');
    }
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      if (editingRecord) {
        const res = await permissionApi.update(editingRecord.id, values);
        if (res.success) message.success('更新成功');
      } else {
        const res = await permissionApi.create(values);
        if (res.success) message.success('新增成功');
      }
      setModalVisible(false);
    } catch {}
  };

  const columns = useMemo(() => [
    { title: 'ID', dataIndex: 'id', width: 60 },
    { title: '权限码', dataIndex: 'code', width: 150 },
    { title: '名称', dataIndex: 'name', width: 150 },
    {
      title: '类型',
      dataIndex: 'type',
      width: 90,
      render: (type: string) => <Tag color={typeMap[type]?.color}>{typeMap[type]?.text || type}</Tag>,
    },
    { title: '父级ID', dataIndex: 'parentId', width: 100, render: (v: string | null) => v || '无' },
    {
      title: '操作',
      key: 'action',
      width: 160,
      fixed: 'right' as const,
      render: (_: unknown, record: PermissionRecord) => (
        <Space>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>编辑</Button>
          <Popconfirm title="确定删除此权限?" onConfirm={() => handleDelete(record)} okText="确定" cancelText="取消">
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ], []);

  return (
    <>
      <SearchTable<PermissionRecord>
        fetchData={fetchData}
        columns={columns}
        onAdd={handleAdd}
        onBatchDelete={handleBatchDelete}
        scroll={{ x: 700 }}
      />

      <Modal
        title={editingRecord ? '编辑权限' : '新增权限'}
        open={modalVisible}
        onOk={handleSave}
        onCancel={() => setModalVisible(false)}
        width={500}
        destroyOnClose
      >
        <Form form={form} labelCol={{ span: 6 }} wrapperCol={{ span: 16 }}>
          <Form.Item name="code" label="权限码" rules={[{ required: true, message: '请输入权限码' }]}>
            <Input placeholder="如: user:read, order:write" disabled={!!editingRecord} />
          </Form.Item>
          <Form.Item name="name" label="名称" rules={[{ required: true, message: '请输入名称' }]}>
            <Input placeholder="如: 用户查看" />
          </Form.Item>
          <Form.Item name="type" label="类型" rules={[{ required: true, message: '请选择类型' }]}>
            <Select placeholder="请选择类型">
              <Select.Option value="menu">菜单</Select.Option>
              <Select.Option value="button">按钮</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="parentId" label="父级ID">
            <Input placeholder="父级权限ID，留空为顶级" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default PermissionManagement;
