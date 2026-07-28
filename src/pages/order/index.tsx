import React, { useState, useCallback, useMemo } from 'react';
import { Button, Tag, Space, Input, Select, Modal, Form, InputNumber, message, Popconfirm, Descriptions } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { SearchTable } from '@/components/common';
import type { TableQueryParams, PaginatedData } from '@/types';
import { orderApi } from '@/services/api';

interface OrderRecord {
  id: string;
  orderNo: string;
  customerName: string;
  totalAmount: number;
  productCount: number;
  status: string;
  remark: string;
  createdAt: string;
  updatedAt: string;
  [key: string]: unknown;
}

const statusMap: Record<string, { color: string; text: string }> = {
  pending: { color: 'default', text: '待付款' },
  paid: { color: 'blue', text: '已付款' },
  shipped: { color: 'cyan', text: '已发货' },
  completed: { color: 'green', text: '已完成' },
  cancelled: { color: 'red', text: '已取消' },
  refunding: { color: 'orange', text: '退款中' },
};

const OrderManagement: React.FC = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<OrderRecord | null>(null);
  const [detailRecord, setDetailRecord] = useState<OrderRecord | null>(null);
  const [form] = Form.useForm();

  const fetchData = useCallback(
    async (params: TableQueryParams): Promise<PaginatedData<OrderRecord>> => {
      const res = await orderApi.getList(params);
      if (res.success && res.data) return res.data as PaginatedData<OrderRecord>;
      return { list: [], total: 0, current: 1, pageSize: 20 };
    },
    []
  );

  const handleAdd = () => {
    setEditingRecord(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record: OrderRecord) => {
    setEditingRecord(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleDetail = (record: OrderRecord) => {
    setDetailRecord(record);
    setDetailVisible(true);
  };

  const handleDelete = async (record: OrderRecord) => {
    try {
      const res = await orderApi.remove(record.id);
      if (res.success) message.success(`已删除订单: ${record.orderNo}`);
    } catch {
      message.error('删除失败');
    }
  };

  const handleBatchDelete = async (keys: React.Key[]) => {
    try {
      for (const key of keys) await orderApi.remove(String(key));
      message.success(`已批量删除 ${keys.length} 条记录`);
    } catch {
      message.error('批量删除失败');
    }
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      if (editingRecord) {
        const res = await orderApi.update(editingRecord.id, values);
        if (res.success) message.success('更新成功');
      } else {
        const res = await orderApi.create(values);
        if (res.success) message.success('新增成功');
      }
      setModalVisible(false);
    } catch {}
  };

  const columns = useMemo(() => [
    { title: 'ID', dataIndex: 'id', width: 60 },
    { title: '订单号', dataIndex: 'orderNo', width: 200 },
    { title: '客户名', dataIndex: 'customerName', width: 120 },
    {
      title: '金额',
      dataIndex: 'totalAmount',
      width: 120,
      render: (v: number) => `¥${v.toLocaleString()}`,
      sorter: true,
    },
    { title: '商品数', dataIndex: 'productCount', width: 80 },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (status: string) => (
        <Tag color={statusMap[status]?.color}>{statusMap[status]?.text || status}</Tag>
      ),
    },
    { title: '备注', dataIndex: 'remark', width: 150, ellipsis: true },
    { title: '创建时间', dataIndex: 'createdAt', width: 170 },
    {
      title: '操作',
      key: 'action',
      width: 220,
      fixed: 'right' as const,
      render: (_: unknown, record: OrderRecord) => (
        <Space>
          <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => handleDetail(record)}>
            详情
          </Button>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Popconfirm title="确定删除此订单?" onConfirm={() => handleDelete(record)} okText="确定" cancelText="取消">
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ], []);

  const searchFields = [
    { name: 'orderNo', label: '订单号', render: <Input placeholder="请输入订单号" allowClear />, span: 6 },
    { name: 'customerName', label: '客户名', render: <Input placeholder="请输入客户名" allowClear />, span: 6 },
    {
      name: 'status', label: '状态',
      render: (
        <Select placeholder="请选择" allowClear style={{ width: '100%' }}>
          {Object.entries(statusMap).map(([k, v]) => (
            <Select.Option key={k} value={k}>{v.text}</Select.Option>
          ))}
        </Select>
      ),
      span: 6,
    },
  ];

  return (
    <>
      <SearchTable<OrderRecord>
        fetchData={fetchData}
        columns={columns}
        searchFields={searchFields}
        onAdd={handleAdd}
        onBatchDelete={handleBatchDelete}
        scroll={{ x: 1400 }}
      />

      {/* 新增/编辑弹窗 */}
      <Modal
        title={editingRecord ? '编辑订单' : '新增订单'}
        open={modalVisible}
        onOk={handleSave}
        onCancel={() => setModalVisible(false)}
        width={600}
        destroyOnClose
      >
        <Form form={form} labelCol={{ span: 6 }} wrapperCol={{ span: 16 }}>
          <Form.Item name="customerName" label="客户名" rules={[{ required: true, message: '请输入客户名' }]}>
            <Input placeholder="请输入客户名" />
          </Form.Item>
          <Form.Item name="totalAmount" label="金额" rules={[{ required: true, message: '请输入金额' }]}>
            <InputNumber placeholder="请输入金额" style={{ width: '100%' }} min={0} />
          </Form.Item>
          <Form.Item name="productCount" label="商品数" rules={[{ required: true, message: '请输入商品数' }]}>
            <InputNumber placeholder="请输入商品数" style={{ width: '100%' }} min={1} />
          </Form.Item>
          <Form.Item name="status" label="状态" rules={[{ required: true, message: '请选择状态' }]}>
            <Select placeholder="请选择状态">
              {Object.entries(statusMap).map(([k, v]) => (
                <Select.Option key={k} value={k}>{v.text}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea placeholder="请输入备注" rows={3} />
          </Form.Item>
        </Form>
      </Modal>

      {/* 详情弹窗 */}
      <Modal
        title="订单详情"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={null}
        width={700}
      >
        {detailRecord && (
          <Descriptions bordered column={2} size="small">
            <Descriptions.Item label="订单号">{detailRecord.orderNo}</Descriptions.Item>
            <Descriptions.Item label="客户名">{detailRecord.customerName}</Descriptions.Item>
            <Descriptions.Item label="金额">¥{detailRecord.totalAmount.toLocaleString()}</Descriptions.Item>
            <Descriptions.Item label="商品数">{detailRecord.productCount}</Descriptions.Item>
            <Descriptions.Item label="状态">
              <Tag color={statusMap[detailRecord.status]?.color}>
                {statusMap[detailRecord.status]?.text || detailRecord.status}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="备注">{detailRecord.remark || '-'}</Descriptions.Item>
            <Descriptions.Item label="创建时间">{detailRecord.createdAt}</Descriptions.Item>
            <Descriptions.Item label="更新时间">{detailRecord.updatedAt}</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </>
  );
};

export default OrderManagement;
