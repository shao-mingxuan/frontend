import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Button, Tag, Space, Input, Modal, Form, message, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { SearchTable } from '@/components/common';
import type { TableQueryParams, PaginatedData } from '@/types';
import { roleApi } from '@/services/api';

interface RoleRecord {
  id: string;
  name: string;
  label: string;
  description: string;
  userCount: number;
  [key: string]: unknown;
}

const RoleManagement: React.FC = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<RoleRecord | null>(null);
  const [form] = Form.useForm();

  const fetchData = useCallback(
    async (params: TableQueryParams): Promise<PaginatedData<RoleRecord>> => {
      const res = await roleApi.getList(params);
      if (res.success && res.data) {
        // 如果返回的是数组而非分页结构
        if (Array.isArray(res.data)) {
          const list = res.data as RoleRecord[];
          return { list, total: list.length, current: 1, pageSize: 20 };
        }
        return res.data as PaginatedData<RoleRecord>;
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

  const handleEdit = (record: RoleRecord) => {
    setEditingRecord(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleDelete = async (record: RoleRecord) => {
    try {
      const res = await roleApi.remove(record.id);
      if (res.success) message.success(`已删除角色: ${record.label}`);
    } catch {
      message.error('删除失败');
    }
  };

  const handleBatchDelete = async (keys: React.Key[]) => {
    try {
      for (const key of keys) await roleApi.remove(String(key));
      message.success(`已批量删除 ${keys.length} 条记录`);
    } catch {
      message.error('批量删除失败');
    }
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      if (editingRecord) {
        const res = await roleApi.update(editingRecord.id, values);
        if (res.success) message.success('更新成功');
      } else {
        const res = await roleApi.create(values);
        if (res.success) message.success('新增成功');
      }
      setModalVisible(false);
    } catch {}
  };

  const columns = useMemo(() => [
    { title: 'ID', dataIndex: 'id', width: 60 },
    { title: '角色标识', dataIndex: 'name', width: 120 },
    { title: '角色名称', dataIndex: 'label', width: 140 },
    { title: '描述', dataIndex: 'description', width: 200, ellipsis: true },
    { title: '用户数', dataIndex: 'userCount', width: 80 },
    {
      title: '操作',
      key: 'action',
      width: 160,
      fixed: 'right' as const,
      render: (_: unknown, record: RoleRecord) => (
        <Space>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>编辑</Button>
          <Popconfirm title="确定删除此角色?" onConfirm={() => handleDelete(record)} okText="确定" cancelText="取消">
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ], []);

  return (
    <>
      <SearchTable<RoleRecord>
        fetchData={fetchData}
        columns={columns}
        onAdd={handleAdd}
        onBatchDelete={handleBatchDelete}
        scroll={{ x: 800 }}
      />

      <Modal
        title={editingRecord ? '编辑角色' : '新增角色'}
        open={modalVisible}
        onOk={handleSave}
        onCancel={() => setModalVisible(false)}
        width={500}
        destroyOnClose
      >
        <Form form={form} labelCol={{ span: 6 }} wrapperCol={{ span: 16 }}>
          <Form.Item name="name" label="角色标识" rules={[{ required: true, message: '请输入角色标识' }]}>
            <Input placeholder="如: admin, editor" disabled={!!editingRecord} />
          </Form.Item>
          <Form.Item name="label" label="角色名称" rules={[{ required: true, message: '请输入角色名称' }]}>
            <Input placeholder="如: 管理员" />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea placeholder="请输入角色描述" rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default RoleManagement;
