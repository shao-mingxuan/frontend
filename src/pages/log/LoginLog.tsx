import React, { useState, useCallback, useMemo } from 'react';
import { Button, Tag, Space, Input, Select, message, Popconfirm } from 'antd';
import { ClearOutlined } from '@ant-design/icons';
import { SearchTable } from '@/components/common';
import type { TableQueryParams, PaginatedData } from '@/types';
import { logApi } from '@/services/api';

interface LoginLogRecord {
  id: string;
  username: string;
  ip: string;
  location: string;
  browser: string;
  os: string;
  status: string;
  message: string;
  createdAt: string;
  [key: string]: unknown;
}

const LoginLog: React.FC = () => {
  const fetchData = useCallback(
    async (params: TableQueryParams): Promise<PaginatedData<LoginLogRecord>> => {
      const res = await logApi.getLoginLogs(params);
      if (res.success && res.data) return res.data as PaginatedData<LoginLogRecord>;
      return { list: [], total: 0, current: 1, pageSize: 20 };
    },
    []
  );

  const handleClear = async () => {
    try {
      const res = await logApi.clearLoginLogs();
      if (res.success) message.success('清空成功');
    } catch {
      message.error('清空失败');
    }
  };

  const columns = useMemo(() => [
    { title: 'ID', dataIndex: 'id', width: 60 },
    { title: '用户名', dataIndex: 'username', width: 120 },
    { title: 'IP', dataIndex: 'ip', width: 140 },
    { title: '地点', dataIndex: 'location', width: 80 },
    { title: '浏览器', dataIndex: 'browser', width: 120 },
    { title: '系统', dataIndex: 'os', width: 100 },
    {
      title: '状态',
      dataIndex: 'status',
      width: 80,
      render: (status: string) => (
        <Tag color={status === 'success' ? 'green' : 'red'}>
          {status === 'success' ? '成功' : '失败'}
        </Tag>
      ),
    },
    { title: '消息', dataIndex: 'message', width: 120 },
    { title: '时间', dataIndex: 'createdAt', width: 170 },
  ], []);

  const searchFields = [
    { name: 'username', label: '用户名', render: <Input placeholder="请输入用户名" allowClear />, span: 6 },
    {
      name: 'status', label: '状态',
      render: (
        <Select placeholder="请选择" allowClear style={{ width: '100%' }}>
          <Select.Option value="success">成功</Select.Option>
          <Select.Option value="fail">失败</Select.Option>
        </Select>
      ),
      span: 6,
    },
  ];

  return (
    <SearchTable<LoginLogRecord>
      fetchData={fetchData}
      columns={columns}
      searchFields={searchFields}
      showAddButton={false}
      showBatchDelete={false}
      scroll={{ x: 1100 }}
      toolbarExtra={
        <Popconfirm title="确定清空所有登录日志？" onConfirm={handleClear} okText="确定" cancelText="取消">
          <Button danger icon={<ClearOutlined />}>清空日志</Button>
        </Popconfirm>
      }
    />
  );
};

export default LoginLog;
