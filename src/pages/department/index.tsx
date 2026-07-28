import React, { useState, useEffect, useCallback } from 'react';
import { Card, Table, Button, Space, Modal, Form, Input, InputNumber, Select, message, Popconfirm, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons';
import { deptApi } from '@/services/api';

interface DeptRecord {
  id: string;
  name: string;
  parentId: string | null;
  leader: string;
  sort: number;
  status: string;
  children?: DeptRecord[];
  [key: string]: unknown;
}

const DepartmentManagement: React.FC = () => {
  const [dataSource, setDataSource] = useState<DeptRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<DeptRecord | null>(null);
  const [flatDepts, setFlatDepts] = useState<DeptRecord[]>([]);
  const [form] = Form.useForm();

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [treeRes, listRes] = await Promise.all([deptApi.getTree(), deptApi.getList()]);
      if (treeRes.success && treeRes.data) setDataSource(treeRes.data as DeptRecord[]);
      if (listRes.success && listRes.data) setFlatDepts(listRes.data as DeptRecord[]);
    } catch {
      message.error('加载部门数据失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAdd = (parentId?: string) => {
    setEditingRecord(null);
    form.resetFields();
    if (parentId) form.setFieldsValue({ parentId });
    setModalVisible(true);
  };

  const handleEdit = (record: DeptRecord) => {
    setEditingRecord(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleDelete = async (record: DeptRecord) => {
    try {
      const res = await deptApi.remove(record.id);
      if (res.success) {
        message.success('删除成功');
        loadData();
      } else {
        message.error(res.message || '删除失败');
      }
    } catch {
      message.error('删除失败');
    }
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      if (editingRecord) {
        const res = await deptApi.update(editingRecord.id, values);
        if (res.success) message.success('更新成功');
      } else {
        const res = await deptApi.create(values);
        if (res.success) message.success('新增成功');
      }
      setModalVisible(false);
      loadData();
    } catch {}
  };

  /** 构建上级部门选项（排除自身及子部门） */
  const parentOptions = (dept: DeptRecord | null) => {
    const excludeIds = new Set<string>();
    if (dept) {
      const collectChildren = (id: string) => {
        excludeIds.add(id);
        flatDepts.filter((d) => d.parentId === id).forEach((d) => collectChildren(d.id));
      };
      collectChildren(dept.id);
    }
    return flatDepts
      .filter((d) => !excludeIds.has(d.id))
      .map((d) => ({ label: d.name, value: d.id }));
  };

  const columns = [
    { title: '部门名称', dataIndex: 'name', key: 'name', width: 200 },
    { title: '负责人', dataIndex: 'leader', key: 'leader', width: 120 },
    { title: '排序', dataIndex: 'sort', key: 'sort', width: 80 },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status: string) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>{status === 'active' ? '启用' : '停用'}</Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 220,
      render: (_: unknown, record: DeptRecord) => (
        <Space>
          <Button type="link" size="small" onClick={() => handleAdd(record.id)}>
            <PlusOutlined /> 新增子部门
          </Button>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Popconfirm title="确定删除此部门?" onConfirm={() => handleDelete(record)} okText="确定" cancelText="取消">
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card size="small">
      <div style={{ marginBottom: 16 }}>
        <Space>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => handleAdd()}>新增部门</Button>
          <Button icon={<ReloadOutlined />} onClick={loadData}>刷新</Button>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={dataSource}
        rowKey="id"
        loading={loading}
        pagination={false}
        defaultExpandAllRows
      />

      <Modal
        title={editingRecord ? '编辑部门' : '新增部门'}
        open={modalVisible}
        onOk={handleSave}
        onCancel={() => setModalVisible(false)}
        width={500}
        destroyOnClose
      >
        <Form form={form} labelCol={{ span: 6 }} wrapperCol={{ span: 16 }}>
          <Form.Item name="parentId" label="上级部门">
            <Select placeholder="请选择上级部门（留空为顶级）" allowClear options={parentOptions(editingRecord)} />
          </Form.Item>
          <Form.Item name="name" label="部门名称" rules={[{ required: true, message: '请输入部门名称' }]}>
            <Input placeholder="请输入部门名称" />
          </Form.Item>
          <Form.Item name="leader" label="负责人" rules={[{ required: true, message: '请输入负责人' }]}>
            <Input placeholder="请输入负责人" />
          </Form.Item>
          <Form.Item name="sort" label="排序" initialValue={1}>
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="status" label="状态" initialValue="active">
            <Select>
              <Select.Option value="active">启用</Select.Option>
              <Select.Option value="inactive">停用</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default DepartmentManagement;
