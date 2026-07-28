import React, { useState, useCallback, useMemo } from 'react';
import { Button, Tag, Space, Input, Select, message, Popconfirm } from 'antd';
import { DeleteOutlined, ClearOutlined } from '@ant-design/icons';
import { SearchTable } from '@/components/common';
import type { TableQueryParams, PaginatedData } from '@/types';
import { logApi } from '@/services/api';

interface OperationLogRecord {
  id: string;
  module: string;
  action: string;
  operator: string;
  method: string;
  url: string;
  ip: string;
  status: string;
  detail: string;
  createdAt: string;
  [key: string]: unknown;
}

const methodColorMap: Record<string, string> = {
  GET: 'blue',
  POST: 'green',
  PUT: 'orange',
  DELETE: 'red',
};

const OperationLog: React.FC = () => {
  const fetchData = useCallback(
    async (params: TableQueryParams): Promise<PaginatedData<OperationLogRecord>> => {
      const res = await logApi.getOperationLogs(params);
      if (res.success && res.data) return res.data as PaginatedData<OperationLogRecord>;
      return { list: [], total: 0, current: 1, pageSize: 20 };
    },
    []
  );

  const handleClear = async () => {
    try {
      const res = await logApi.clearOperationLogs();
      if (res.success) message.success('清空成功');
    } catch {
      message.error('清空失败');
    }
  };

  const columns = useMemo(() => [
    { title: 'ID', dataIndex: 'id', width: 60 },
    { title: '模块', dataIndex: 'module', width: 100 },
    { title: '操作', dataIndex: 'action', width: 120 },
    { title: '操作人', dataIndex: 'operator', width: 100 },
    {
      title: '方法',
      dataIndex: 'method',
      width: 80,
      render: (method: string) => <Tag color={methodColorMap[method]}>{method}</Tag>,
    },
    { title: 'URL', dataIndex: 'url', width: 200, ellipsis: true },
    { title: 'IP', dataIndex: 'ip', width: 140 },
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
    { title: '时间', dataIndex: 'createdAt', width: 170 },
  ], []);

  const searchFields = [
    { name: 'module', label: '模块', render: <Input placeholder="请输入模块" allowClear />, span: 6 },
    { name: 'operator', label: '操作人', render: <Input placeholder="请输入操作人" allowClear />, span: 6 },
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
    <SearchTable<OperationLogRecord>
      fetchData={fetchData}
      columns={columns}
      searchFields={searchFields}
      showAddButton={false}
      showBatchDelete={false}
      scroll={{ x: 1200 }}
      toolbarExtra={
        <Popconfirm title="确定清空所有操作日志？" onConfirm={handleClear} okText="确定" cancelText="取消">
          <Button danger icon={<ClearOutlined />}>清空日志</Button>
        </Popconfirm>
      }
    />
  );
};

export default OperationLog;
