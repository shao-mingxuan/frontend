import React, { useState, useEffect, useCallback } from 'react';
import { Card, Table, Button, Space, Modal, Form, Input, InputNumber, Select, message, Popconfirm, Tag, Switch } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons';
import { menuApi } from '@/services/api';

interface MenuRecord {
  id: string;
  name: string;
  path: string;
  icon: string;
  type: string;
  parentId: string | null;
  sort: number;
  visible: boolean;
  children?: MenuRecord[];
  [key: string]: unknown;
}

const typeMap: Record<string, { color: string; text: string }> = {
  directory: { color: 'blue', text: '目录' },
  menu: { color: 'green', text: '菜单' },
  button: { color: 'orange', text: '按钮' },
};

const iconOptions = [
  'DashboardOutlined', 'UserOutlined', 'SettingOutlined', 'LockOutlined',
  'TeamOutlined', 'ProfileOutlined', 'SafetyOutlined', 'AppstoreOutlined',
  'ShopOutlined', 'ShoppingCartOutlined', 'FileTextOutlined', 'MenuOutlined',
  'ApartmentOutlined', 'FileSearchOutlined', 'AuditOutlined', 'LoginOutlined',
];

const MenuManagement: React.FC = () => {
  const [dataSource, setDataSource] = useState<MenuRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<MenuRecord | null>(null);
  const [flatMenus, setFlatMenus] = useState<MenuRecord[]>([]);
  const [form] = Form.useForm();

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [treeRes, listRes] = await Promise.all([menuApi.getTree(), menuApi.getList()]);
      if (treeRes.success && treeRes.data) setDataSource(treeRes.data as MenuRecord[]);
      if (listRes.success && listRes.data) setFlatMenus(listRes.data as MenuRecord[]);
    } catch {
      message.error('加载菜单数据失败');
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
    form.setFieldsValue({ visible: true, sort: 1, type: 'menu' });
    if (parentId) form.setFieldsValue({ parentId });
    setModalVisible(true);
  };

  const handleEdit = (record: MenuRecord) => {
    setEditingRecord(record);
    form.setFieldsValue({ ...record, visible: record.visible });
    setModalVisible(true);
  };

  const handleDelete = async (record: MenuRecord) => {
    try {
      const res = await menuApi.remove(record.id);
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
        const res = await menuApi.update(editingRecord.id, values);
        if (res.success) message.success('更新成功');
      } else {
        const res = await menuApi.create(values);
        if (res.success) message.success('新增成功');
      }
      setModalVisible(false);
      loadData();
    } catch {}
  };

  const parentOptions = (menu: MenuRecord | null) => {
    const excludeIds = new Set<string>();
    if (menu) {
      const collectChildren = (id: string) => {
        excludeIds.add(id);
        flatMenus.filter((m) => m.parentId === id).forEach((m) => collectChildren(m.id));
      };
      collectChildren(menu.id);
    }
    return flatMenus
      .filter((m) => m.type !== 'button' && !excludeIds.has(m.id))
      .map((m) => ({ label: m.name, value: m.id }));
  };

  const columns = [
    { title: '菜单名称', dataIndex: 'name', key: 'name', width: 180 },
    {
      title: '图标',
      dataIndex: 'icon',
      key: 'icon',
      width: 100,
      render: (icon: string) => icon || '-',
    },
    { title: '路径', dataIndex: 'path', key: 'path', width: 200 },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 80,
      render: (type: string) => <Tag color={typeMap[type]?.color}>{typeMap[type]?.text || type}</Tag>,
    },
    { title: '排序', dataIndex: 'sort', key: 'sort', width: 70 },
    {
      title: '可见',
      dataIndex: 'visible',
      key: 'visible',
      width: 70,
      render: (visible: boolean) => <Tag color={visible ? 'green' : 'default'}>{visible ? '显示' : '隐藏'}</Tag>,
    },
    {
      title: '操作',
      key: 'action',
      width: 220,
      render: (_: unknown, record: MenuRecord) => (
        <Space>
          <Button type="link" size="small" onClick={() => handleAdd(record.id)}>
            <PlusOutlined /> 新增子菜单
          </Button>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Popconfirm title="确定删除此菜单?" onConfirm={() => handleDelete(record)} okText="确定" cancelText="取消">
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
          <Button type="primary" icon={<PlusOutlined />} onClick={() => handleAdd()}>新增菜单</Button>
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
        title={editingRecord ? '编辑菜单' : '新增菜单'}
        open={modalVisible}
        onOk={handleSave}
        onCancel={() => setModalVisible(false)}
        width={550}
        destroyOnClose
      >
        <Form form={form} labelCol={{ span: 5 }} wrapperCol={{ span: 18 }}>
          <Form.Item name="parentId" label="上级菜单">
            <Select placeholder="请选择上级菜单（留空为顶级）" allowClear options={parentOptions(editingRecord)} />
          </Form.Item>
          <Form.Item name="type" label="类型" rules={[{ required: true, message: '请选择类型' }]}>
            <Select placeholder="请选择菜单类型">
              <Select.Option value="directory">目录</Select.Option>
              <Select.Option value="menu">菜单</Select.Option>
              <Select.Option value="button">按钮</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="name" label="名称" rules={[{ required: true, message: '请输入名称' }]}>
            <Input placeholder="请输入菜单名称" />
          </Form.Item>
          <Form.Item name="path" label="路径">
            <Input placeholder="请输入路由路径，如 /system/role" />
          </Form.Item>
          <Form.Item name="icon" label="图标">
            <Select placeholder="请选择图标" allowClear showSearch>
              {iconOptions.map((icon) => (
                <Select.Option key={icon} value={icon}>{icon}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="sort" label="排序" initialValue={1}>
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="visible" label="是否可见" valuePropName="checked" initialValue={true}>
            <Switch checkedChildren="显示" unCheckedChildren="隐藏" />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default MenuManagement;
