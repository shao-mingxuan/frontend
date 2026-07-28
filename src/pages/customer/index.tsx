import React, { useState, useCallback, useMemo } from 'react';
import { Button, Tag, Space, Input, Select, Modal, Form, message, Popconfirm, Descriptions } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { SearchTable } from '@/components/common';
import type { TableQueryParams, PaginatedData } from '@/types';
import { customerApi } from '@/services/api';

interface CustomerRecord {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  level: string;
  source: string;
  lastFollowUpAt: string;
  totalPurchase: number;
  remark: string;
  createdAt: string;
  [key: string]: unknown;
}

const levelMap: Record<string, { color: string; text: string }> = {
  vip: { color: 'gold', text: 'VIP' },
  normal: { color: 'blue', text: '普通' },
  potential: { color: 'cyan', text: '潜在' },
  inactive: { color: 'default', text: '不活跃' },
};

const sourceList = ['官网', '推荐', '广告', '社交媒体', '线下'];

const CustomerManagement: React.FC = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<CustomerRecord | null>(null);
  const [detailRecord, setDetailRecord] = useState<CustomerRecord | null>(null);
  const [form] = Form.useForm();

  const fetchData = useCallback(
    async (params: TableQueryParams): Promise<PaginatedData<CustomerRecord>> => {
      const res = await customerApi.getList(params);
      if (res.success && res.data) return res.data as PaginatedData<CustomerRecord>;
      return { list: [], total: 0, current: 1, pageSize: 20 };
    },
    []
  );

  const handleAdd = () => {
    setEditingRecord(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record: CustomerRecord) => {
    setEditingRecord(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleDetail = (record: CustomerRecord) => {
    setDetailRecord(record);
    setDetailVisible(true);
  };

  const handleDelete = async (record: CustomerRecord) => {
    try {
      const res = await customerApi.remove(record.id);
      if (res.success) message.success(`已删除客户: ${record.name}`);
    } catch {
      message.error('删除失败');
    }
  };

  const handleBatchDelete = async (keys: React.Key[]) => {
    try {
      for (const key of keys) await customerApi.remove(String(key));
      message.success(`已批量删除 ${keys.length} 条记录`);
    } catch {
      message.error('批量删除失败');
    }
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      if (editingRecord) {
        const res = await customerApi.update(editingRecord.id, values);
        if (res.success) message.success('更新成功');
      } else {
        const res = await customerApi.create(values);
        if (res.success) message.success('新增成功');
      }
      setModalVisible(false);
    } catch {}
  };

  const columns = useMemo(() => [
    { title: 'ID', dataIndex: 'id', width: 60 },
    { title: '客户名', dataIndex: 'name', width: 140 },
    { title: '公司', dataIndex: 'company', width: 150, ellipsis: true },
    { title: '邮箱', dataIndex: 'email', width: 200, ellipsis: true },
    { title: '手机号', dataIndex: 'phone', width: 140 },
    {
      title: '等级',
      dataIndex: 'level',
      width: 90,
      render: (level: string) => (
        <Tag color={levelMap[level]?.color}>{levelMap[level]?.text || level}</Tag>
      ),
    },
    { title: '来源', dataIndex: 'source', width: 90 },
    { title: '消费总额', dataIndex: 'totalPurchase', width: 110, render: (v: number) => `¥${v.toLocaleString()}`, sorter: true },
    { title: '最近跟进', dataIndex: 'lastFollowUpAt', width: 110 },
    { title: '创建时间', dataIndex: 'createdAt', width: 110 },
    {
      title: '操作',
      key: 'action',
      width: 220,
      fixed: 'right' as const,
      render: (_: unknown, record: CustomerRecord) => (
        <Space>
          <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => handleDetail(record)}>详情</Button>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>编辑</Button>
          <Popconfirm title="确定删除此客户?" onConfirm={() => handleDelete(record)} okText="确定" cancelText="取消">
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ], []);

  const searchFields = [
    { name: 'name', label: '客户名', render: <Input placeholder="请输入客户名" allowClear />, span: 6 },
    { name: 'company', label: '公司', render: <Input placeholder="请输入公司名" allowClear />, span: 6 },
    {
      name: 'level', label: '等级',
      render: (
        <Select placeholder="请选择" allowClear style={{ width: '100%' }}>
          {Object.entries(levelMap).map(([k, v]) => (
            <Select.Option key={k} value={k}>{v.text}</Select.Option>
          ))}
        </Select>
      ),
      span: 6,
    },
    {
      name: 'source', label: '来源',
      render: (
        <Select placeholder="请选择" allowClear style={{ width: '100%' }}>
          {sourceList.map((s) => (<Select.Option key={s} value={s}>{s}</Select.Option>))}
        </Select>
      ),
      span: 6,
    },
  ];

  return (
    <>
      <SearchTable<CustomerRecord>
        fetchData={fetchData}
        columns={columns}
        searchFields={searchFields}
        onAdd={handleAdd}
        onBatchDelete={handleBatchDelete}
        scroll={{ x: 1500 }}
      />

      {/* 新增/编辑弹窗 */}
      <Modal
        title={editingRecord ? '编辑客户' : '新增客户'}
        open={modalVisible}
        onOk={handleSave}
        onCancel={() => setModalVisible(false)}
        width={600}
        destroyOnClose
      >
        <Form form={form} labelCol={{ span: 6 }} wrapperCol={{ span: 16 }}>
          <Form.Item name="name" label="客户名" rules={[{ required: true, message: '请输入客户名' }]}>
            <Input placeholder="请输入客户名" />
          </Form.Item>
          <Form.Item name="company" label="公司" rules={[{ required: true, message: '请输入公司' }]}>
            <Input placeholder="请输入公司名" />
          </Form.Item>
          <Form.Item name="email" label="邮箱" rules={[{ required: true, message: '请输入邮箱' }, { type: 'email', message: '邮箱格式不正确' }]}>
            <Input placeholder="请输入邮箱" />
          </Form.Item>
          <Form.Item name="phone" label="手机号" rules={[{ required: true, message: '请输入手机号' }]}>
            <Input placeholder="请输入手机号" />
          </Form.Item>
          <Form.Item name="level" label="等级" rules={[{ required: true, message: '请选择等级' }]}>
            <Select placeholder="请选择等级">
              {Object.entries(levelMap).map(([k, v]) => (
                <Select.Option key={k} value={k}>{v.text}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="source" label="来源" rules={[{ required: true, message: '请选择来源' }]}>
            <Select placeholder="请选择来源">
              {sourceList.map((s) => (<Select.Option key={s} value={s}>{s}</Select.Option>))}
            </Select>
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea placeholder="请输入备注" rows={3} />
          </Form.Item>
        </Form>
      </Modal>

      {/* 详情弹窗 */}
      <Modal
        title="客户详情"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={null}
        width={700}
      >
        {detailRecord && (
          <Descriptions bordered column={2} size="small">
            <Descriptions.Item label="客户名">{detailRecord.name}</Descriptions.Item>
            <Descriptions.Item label="公司">{detailRecord.company}</Descriptions.Item>
            <Descriptions.Item label="邮箱">{detailRecord.email}</Descriptions.Item>
            <Descriptions.Item label="手机号">{detailRecord.phone}</Descriptions.Item>
            <Descriptions.Item label="等级">
              <Tag color={levelMap[detailRecord.level]?.color}>{levelMap[detailRecord.level]?.text}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="来源">{detailRecord.source}</Descriptions.Item>
            <Descriptions.Item label="消费总额">¥{detailRecord.totalPurchase.toLocaleString()}</Descriptions.Item>
            <Descriptions.Item label="最近跟进">{detailRecord.lastFollowUpAt}</Descriptions.Item>
            <Descriptions.Item label="备注" span={2}>{detailRecord.remark || '-'}</Descriptions.Item>
            <Descriptions.Item label="创建时间">{detailRecord.createdAt}</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </>
  );
};

export default CustomerManagement;
