import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Table, Card, Input, Button, Space, Form, Row, Col, message, Modal } from 'antd';
import { PlusOutlined, SearchOutlined, ReloadOutlined, DeleteOutlined } from '@ant-design/icons';
import type { TableProps, TablePaginationConfig } from 'antd';
import type { FilterValue, SorterResult } from 'antd/es/table/interface';
import { useDebounceFn } from '@/hooks/useDebounceFn';
import type { TableQueryParams, PaginatedData } from '@/types';
import styles from './SearchTable.module.less';

interface SearchTableProps<T extends Record<string, unknown>>
  extends Omit<TableProps<T>, 'dataSource' | 'pagination'> {
  /** 请求列表数据的函数 */
  fetchData: (params: TableQueryParams) => Promise<PaginatedData<T>>;
  /** 搜索表单项配置 */
  searchFields?: Array<{
    name: string;
    label: string;
    render: React.ReactNode;
    span?: number;
  }>;
  /** 行选择的 key */
  rowKey?: string | ((record: T) => string);
  /** 是否显示新增按钮 */
  showAddButton?: boolean;
  /** 新增按钮点击事件 */
  onAdd?: () => void;
  /** 是否显示批量删除按钮 */
  showBatchDelete?: boolean;
  /** 批量删除点击事件 */
  onBatchDelete?: (keys: React.Key[]) => void;
  /** 操作列渲染 */
  toolbarExtra?: React.ReactNode;
}

/**
 * 搜索表格组件
 * - 自动集成搜索表单 + 表格 + 分页
 * - 支持刷新、重置、批量操作
 */
function SearchTable<T extends Record<string, unknown>>({
  fetchData,
  searchFields = [],
  rowKey = 'id',
  showAddButton = true,
  onAdd,
  showBatchDelete = true,
  onBatchDelete,
  toolbarExtra,
  columns,
  ...restProps
}: SearchTableProps<T>) {
  const [form] = Form.useForm();
  const [dataSource, setDataSource] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: 20,
    total: 0,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total) => `共 ${total} 条`,
  });
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [searchParams, setSearchParams] = useState<Record<string, unknown>>({});

  /** 获取列表数据 */
  const loadData = useCallback(
    async (params: TableQueryParams) => {
      setLoading(true);
      try {
        const result = await fetchData(params);
        setDataSource(result.list);
        setPagination((prev) => ({
          ...prev,
          current: result.current,
          pageSize: result.pageSize,
          total: result.total,
        }));
      } catch {
        message.error('数据加载失败');
      } finally {
        setLoading(false);
      }
    },
    [fetchData]
  );

  /** 搜索 */
  const handleSearch = useCallback(() => {
    const values = form.getFieldsValue();
    // 过滤空值
    const filtered: Record<string, unknown> = {};
    Object.entries(values).forEach(([key, val]) => {
      if (val !== undefined && val !== '') {
        filtered[key] = val;
      }
    });
    setSearchParams(filtered);
    loadData({ current: 1, pageSize: pagination.pageSize || 20, ...filtered });
  }, [form, pagination.pageSize, loadData]);

  /** 重置 */
  const handleReset = useCallback(() => {
    form.resetFields();
    setSearchParams({});
    loadData({ current: 1, pageSize: pagination.pageSize || 20 });
  }, [form, pagination.pageSize, loadData]);

  /** 分页变化 */
  const handleTableChange = useCallback(
    (
      pag: TablePaginationConfig,
      filters: Record<string, FilterValue | null>,
      sorter: SorterResult<T> | SorterResult<T>[]
    ) => {
      const params: TableQueryParams = {
        current: pag.current || 1,
        pageSize: pag.pageSize || 20,
        ...searchParams,
      };

      // 排序
      if (!Array.isArray(sorter) && sorter.field) {
        params.sortField = sorter.field as string;
        params.sortOrder = sorter.order === 'ascend' ? 'asc' : 'desc';
      }

      loadData(params);
    },
    [searchParams, loadData]
  );

  /** 批量删除 */
  const handleBatchDelete = useCallback(() => {
    if (selectedRowKeys.length === 0) {
      message.warning('请至少选择一条记录');
      return;
    }
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除选中的 ${selectedRowKeys.length} 条记录吗？`,
      okType: 'danger',
      onOk: () => {
        onBatchDelete?.(selectedRowKeys);
        setSelectedRowKeys([]);
      },
    });
  }, [selectedRowKeys, onBatchDelete]);

  // 防抖搜索
  const { run: debouncedSearch } = useDebounceFn(handleSearch, { wait: 300 });

  // 初始加载
  React.useEffect(() => {
    loadData({ current: 1, pageSize: 20 });
  }, []);

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys: React.Key[]) => setSelectedRowKeys(keys),
  };

  return (
    <div className={styles.searchTable}>
      {/* 搜索区域 */}
      {searchFields.length > 0 && (
        <Card className={styles.searchCard} size="small">
          <Form form={form} layout="inline">
            <Row gutter={16} style={{ width: '100%' }}>
              {searchFields.map((field) => (
                <Col key={field.name} span={field.span || 6}>
                  <Form.Item name={field.name} label={field.label}>
                    {field.render}
                  </Form.Item>
                </Col>
              ))}
              <Col span={6}>
                <Form.Item>
                  <Space>
                    <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
                      搜索
                    </Button>
                    <Button icon={<ReloadOutlined />} onClick={handleReset}>
                      重置
                    </Button>
                  </Space>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Card>
      )}

      {/* 表格区域 */}
      <Card className={styles.tableCard} size="small">
        {/* 工具栏 */}
        <div className={styles.toolbar}>
          <Space>
            {showAddButton && (
              <Button type="primary" icon={<PlusOutlined />} onClick={onAdd}>
                新增
              </Button>
            )}
            {showBatchDelete && selectedRowKeys.length > 0 && (
              <Button danger icon={<DeleteOutlined />} onClick={handleBatchDelete}>
                批量删除 ({selectedRowKeys.length})
              </Button>
            )}
            <Button icon={<ReloadOutlined />} onClick={() => loadData({ current: pagination.current || 1, pageSize: pagination.pageSize || 20, ...searchParams })}>
              刷新
            </Button>
            {toolbarExtra}
          </Space>
        </div>

        {/* 表格 */}
        <Table<T>
          rowKey={rowKey}
          columns={columns}
          dataSource={dataSource}
          loading={loading}
          pagination={pagination}
          rowSelection={rowSelection}
          onChange={handleTableChange}
          scroll={{ x: 'max-content' }}
          {...restProps}
        />
      </Card>
    </div>
  );
}

export default SearchTable;
