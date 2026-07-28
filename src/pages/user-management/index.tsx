import React, { useState, useCallback, useMemo } from 'react';
import { Button, Tag, Space, Input, Select, Modal, Form, message, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { SearchTable } from '@/components/common';
import type { TableQueryParams, PaginatedData } from '@/types';
import { userApi } from '@/services/api';

interface UserRecord {
  id: string;
  username: string;
  nickname: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  departmentId: string;
  createdAt: string;
  [key: string]: unknown;
}

const statusMap: Record<string, { color: string; text: string }> = {
  active: { color: 'green', text: '正常' },
  inactive: { color: 'orange', text: '停用' },
  locked: { color: 'red', text: '锁定' },
};

const roleMap: Record<string, { color: string; text: string }> = {
  admin: { color: 'red', text: '管理员' },
  editor: { color: 'blue', text: '编辑者' },
  viewer: { color: 'default', text: '查看者' },
  auditor: { color: 'purple', text: '审计员' },
};

const UserManagement: React.FC = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<UserRecord | null>(null);
  const [form] = Form.useForm();

  /** 从后端请求数据 */
  const fetchData = useCallback(
    async (params: TableQueryParams): Promise<PaginatedData<UserRecord>> => {
      const res = await userApi.getList(params);
      if (res.success && res.data) {
        return res.data as PaginatedData<UserRecord>;
      }
      return { list: [], total: 0, current: 1, pageSize: 20 };
    },
    []
  );

  /** 新增用户 */
  const handleAdd = () => {
    setEditingRecord(null);
    form.resetFields();
    setModalVisible(true);
  };

  /** 编辑用户 */
  const handleEdit = (record: UserRecord) => {
    setEditingRecord(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  /** 删除用户 */
  const handleDelete = async (record: UserRecord) => {
    try {
      const res = await userApi.remove(record.id);
      if (res.success) {
        message.success(`已删除用户: ${record.username}`);
      }
    } catch {
      message.error('删除失败');
    }
  };

  /** 批量删除 */
  const handleBatchDelete = async (keys: React.Key[]) => {
    try {
      for (const key of keys) {
        await userApi.remove(String(key));
      }
      message.success(`已批量删除 ${keys.length} 条记录`);
    } catch {
      message.error('批量删除失败');
    }
  };

  /** 保存 */
  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      if (editingRecord) {
        const res = await userApi.update(editingRecord.id, values);
        if (res.success) message.success(`更新成功: ${editingRecord.username}`);
      } else {
        const res = await userApi.create(values);
        if (res.success) message.success(`新增成功: ${values.username}`);
      }
      setModalVisible(false);
    } catch {
      // 表单验证失败
    }
  };

  const columns = useMemo(
    () => [
      {
        title: 'ID',
        dataIndex: 'id',
        width: 60,
      },
      {
        title: '用户名',
        dataIndex: 'username',
        width: 120,
      },
      {
        title: '昵称',
        dataIndex: 'nickname',
        width: 120,
      },
      {
        title: '邮箱',
        dataIndex: 'email',
        width: 200,
      },
      {
        title: '手机号',
        dataIndex: 'phone',
        width: 140,
      },
      {
        title: '角色',
        dataIndex: 'role',
        width: 100,
        render: (role: string) => (
          <Tag color={roleMap[role]?.color}>{roleMap[role]?.text || role}</Tag>
        ),
      },
      {
        title: '状态',
        dataIndex: 'status',
        width: 80,
        render: (status: string) => (
          <Tag color={statusMap[status]?.color}>{statusMap[status]?.text || status}</Tag>
        ),
      },
      {
        title: '创建时间',
        dataIndex: 'createdAt',
        width: 120,
      },
      {
        title: '操作',
        key: 'action',
        width: 180,
        fixed: 'right' as const,
        render: (_: unknown, record: UserRecord) => (
          <Space>
            <Button
              type="link"
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            >
              编辑
            </Button>
            <Popconfirm
              title="确定删除此用户?"
              onConfirm={() => handleDelete(record)}
              okText="确定"
              cancelText="取消"
            >
              <Button type="link" size="small" danger icon={<DeleteOutlined />}>
                删除
              </Button>
            </Popconfirm>
          </Space>
        ),
      },
    ],
    []
  );

  const searchFields = [
    {
      name: 'username',
      label: '用户名',
      render: <Input placeholder="请输入用户名" allowClear />,
      span: 6,
    },
    {
      name: 'status',
      label: '状态',
      render: (
        <Select placeholder="请选择" allowClear style={{ width: '100%' }}>
          <Select.Option value="active">正常</Select.Option>
          <Select.Option value="inactive">停用</Select.Option>
          <Select.Option value="locked">锁定</Select.Option>
        </Select>
      ),
      span: 6,
    },
    {
      name: 'role',
      label: '角色',
      render: (
        <Select placeholder="请选择" allowClear style={{ width: '100%' }}>
          <Select.Option value="admin">管理员</Select.Option>
          <Select.Option value="editor">编辑者</Select.Option>
          <Select.Option value="viewer">查看者</Select.Option>
          <Select.Option value="auditor">审计员</Select.Option>
        </Select>
      ),
      span: 6,
    },
  ];

  return (
    <>
      <SearchTable<UserRecord>
        fetchData={fetchData}
        columns={columns}
        searchFields={searchFields}
        onAdd={handleAdd}
        onBatchDelete={handleBatchDelete}
        scroll={{ x: 1200 }}
      />

      {/* 新增/编辑弹窗 */}
      <Modal
        title={editingRecord ? '编辑用户' : '新增用户'}
        open={modalVisible}
        onOk={handleSave}
        onCancel={() => setModalVisible(false)}
        width={600}
        destroyOnClose
      >
        <Form form={form} labelCol={{ span: 6 }} wrapperCol={{ span: 16 }}>
          <Form.Item
            name="username"
            label="用户名"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input placeholder="请输入用户名" disabled={!!editingRecord} />
          </Form.Item>
          <Form.Item
            name="nickname"
            label="昵称"
            rules={[{ required: true, message: '请输入昵称' }]}
          >
            <Input placeholder="请输入昵称" />
          </Form.Item>
          <Form.Item
            name="email"
            label="邮箱"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '邮箱格式不正确' },
            ]}
          >
            <Input placeholder="请输入邮箱" />
          </Form.Item>
          <Form.Item
            name="phone"
            label="手机号"
            rules={[{ required: true, message: '请输入手机号' }]}
          >
            <Input placeholder="请输入手机号" />
          </Form.Item>
          <Form.Item
            name="role"
            label="角色"
            rules={[{ required: true, message: '请选择角色' }]}
          >
            <Select placeholder="请选择角色">
              <Select.Option value="admin">管理员</Select.Option>
              <Select.Option value="editor">编辑者</Select.Option>
              <Select.Option value="viewer">查看者</Select.Option>
              <Select.Option value="auditor">审计员</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="status"
            label="状态"
            rules={[{ required: true, message: '请选择状态' }]}
          >
            <Select placeholder="请选择状态">
              <Select.Option value="active">正常</Select.Option>
              <Select.Option value="inactive">停用</Select.Option>
              <Select.Option value="locked">锁定</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default UserManagement;
