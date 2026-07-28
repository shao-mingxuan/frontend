import React, { useState, useCallback, useMemo } from 'react';
import { Button, Tag, Space, Input, Select, Modal, Form, message, Popconfirm, Descriptions } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { SearchTable } from '@/components/common';
import type { TableQueryParams, PaginatedData } from '@/types';
import { articleApi } from '@/services/api';

interface ArticleRecord {
  id: string;
  title: string;
  category: string;
  author: string;
  status: string;
  viewCount: number;
  likeCount: number;
  summary: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  [key: string]: unknown;
}

const statusMap: Record<string, { color: string; text: string }> = {
  draft: { color: 'default', text: '草稿' },
  published: { color: 'green', text: '已发布' },
  archived: { color: 'orange', text: '已下架' },
};

const categories = ['技术分享', '产品动态', '公司新闻', '行业资讯', '使用教程'];

const ContentManagement: React.FC = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<ArticleRecord | null>(null);
  const [detailRecord, setDetailRecord] = useState<ArticleRecord | null>(null);
  const [form] = Form.useForm();

  const fetchData = useCallback(
    async (params: TableQueryParams): Promise<PaginatedData<ArticleRecord>> => {
      const res = await articleApi.getList(params);
      if (res.success && res.data) return res.data as PaginatedData<ArticleRecord>;
      return { list: [], total: 0, current: 1, pageSize: 20 };
    },
    []
  );

  const handleAdd = () => {
    setEditingRecord(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record: ArticleRecord) => {
    setEditingRecord(record);
    form.setFieldsValue({ ...record, tags: record.tags?.join(', ') });
    setModalVisible(true);
  };

  const handleDetail = (record: ArticleRecord) => {
    setDetailRecord(record);
    setDetailVisible(true);
  };

  const handleDelete = async (record: ArticleRecord) => {
    try {
      const res = await articleApi.remove(record.id);
      if (res.success) message.success(`已删除文章`);
    } catch {
      message.error('删除失败');
    }
  };

  const handleBatchDelete = async (keys: React.Key[]) => {
    try {
      for (const key of keys) await articleApi.remove(String(key));
      message.success(`已批量删除 ${keys.length} 条记录`);
    } catch {
      message.error('批量删除失败');
    }
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      // 处理 tags 字符串 → 数组
      const data = {
        ...values,
        tags: values.tags ? values.tags.split(/[,，]/).map((t: string) => t.trim()).filter(Boolean) : [],
      };
      if (editingRecord) {
        const res = await articleApi.update(editingRecord.id, data);
        if (res.success) message.success('更新成功');
      } else {
        const res = await articleApi.create(data);
        if (res.success) message.success('新增成功');
      }
      setModalVisible(false);
    } catch {}
  };

  const columns = useMemo(() => [
    { title: 'ID', dataIndex: 'id', width: 60 },
    { title: '标题', dataIndex: 'title', width: 250, ellipsis: true },
    { title: '分类', dataIndex: 'category', width: 100 },
    { title: '作者', dataIndex: 'author', width: 100 },
    {
      title: '状态',
      dataIndex: 'status',
      width: 90,
      render: (status: string) => (
        <Tag color={statusMap[status]?.color}>{statusMap[status]?.text || status}</Tag>
      ),
    },
    { title: '浏览量', dataIndex: 'viewCount', width: 80, sorter: true },
    { title: '点赞', dataIndex: 'likeCount', width: 70 },
    {
      title: '标签',
      dataIndex: 'tags',
      width: 160,
      render: (tags: string[]) =>
        tags?.map((t) => <Tag key={t} color="blue">{t}</Tag>),
    },
    { title: '创建时间', dataIndex: 'createdAt', width: 170 },
    {
      title: '操作',
      key: 'action',
      width: 220,
      fixed: 'right' as const,
      render: (_: unknown, record: ArticleRecord) => (
        <Space>
          <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => handleDetail(record)}>
            详情
          </Button>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Popconfirm title="确定删除此文章?" onConfirm={() => handleDelete(record)} okText="确定" cancelText="取消">
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ], []);

  const searchFields = [
    { name: 'title', label: '标题', render: <Input placeholder="请输入标题" allowClear />, span: 6 },
    { name: 'author', label: '作者', render: <Input placeholder="请输入作者" allowClear />, span: 6 },
    {
      name: 'category', label: '分类',
      render: (
        <Select placeholder="请选择" allowClear style={{ width: '100%' }}>
          {categories.map((c) => (<Select.Option key={c} value={c}>{c}</Select.Option>))}
        </Select>
      ),
      span: 6,
    },
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
      <SearchTable<ArticleRecord>
        fetchData={fetchData}
        columns={columns}
        searchFields={searchFields}
        onAdd={handleAdd}
        onBatchDelete={handleBatchDelete}
        scroll={{ x: 1400 }}
      />

      {/* 新增/编辑弹窗 */}
      <Modal
        title={editingRecord ? '编辑文章' : '新增文章'}
        open={modalVisible}
        onOk={handleSave}
        onCancel={() => setModalVisible(false)}
        width={700}
        destroyOnClose
      >
        <Form form={form} labelCol={{ span: 5 }} wrapperCol={{ span: 18 }}>
          <Form.Item name="title" label="标题" rules={[{ required: true, message: '请输入标题' }]}>
            <Input placeholder="请输入文章标题" />
          </Form.Item>
          <Form.Item name="category" label="分类" rules={[{ required: true, message: '请选择分类' }]}>
            <Select placeholder="请选择分类">
              {categories.map((c) => (<Select.Option key={c} value={c}>{c}</Select.Option>))}
            </Select>
          </Form.Item>
          <Form.Item name="author" label="作者" rules={[{ required: true, message: '请输入作者' }]}>
            <Input placeholder="请输入作者" />
          </Form.Item>
          <Form.Item name="status" label="状态" rules={[{ required: true, message: '请选择状态' }]}>
            <Select placeholder="请选择状态">
              {Object.entries(statusMap).map(([k, v]) => (
                <Select.Option key={k} value={k}>{v.text}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="summary" label="摘要">
            <Input.TextArea placeholder="请输入摘要" rows={3} />
          </Form.Item>
          <Form.Item name="tags" label="标签">
            <Input placeholder="多个标签用逗号分隔，如: React, Vue" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 详情弹窗 */}
      <Modal
        title="文章详情"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={null}
        width={700}
      >
        {detailRecord && (
          <Descriptions bordered column={2} size="small">
            <Descriptions.Item label="标题" span={2}>{detailRecord.title}</Descriptions.Item>
            <Descriptions.Item label="分类">{detailRecord.category}</Descriptions.Item>
            <Descriptions.Item label="作者">{detailRecord.author}</Descriptions.Item>
            <Descriptions.Item label="状态">
              <Tag color={statusMap[detailRecord.status]?.color}>
                {statusMap[detailRecord.status]?.text}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="浏览量">{detailRecord.viewCount}</Descriptions.Item>
            <Descriptions.Item label="点赞">{detailRecord.likeCount}</Descriptions.Item>
            <Descriptions.Item label="标签">
              {detailRecord.tags?.map((t) => <Tag key={t} color="blue">{t}</Tag>)}
            </Descriptions.Item>
            <Descriptions.Item label="摘要" span={2}>{detailRecord.summary || '-'}</Descriptions.Item>
            <Descriptions.Item label="创建时间">{detailRecord.createdAt}</Descriptions.Item>
            <Descriptions.Item label="更新时间">{detailRecord.updatedAt}</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </>
  );
};

export default ContentManagement;
