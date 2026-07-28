import React, { useMemo, useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Typography, Spin, Segmented, Table } from 'antd';
import {
  UserOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  EyeOutlined,
  TeamOutlined,
  FileTextOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from '@ant-design/icons';
import { EChartsWrapper } from '@/components/common';
import type { EChartsOption } from 'echarts';
import { dashboardApi } from '@/services/api';
import styles from './index.module.less';

const { Title } = Typography;

interface OverviewData {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  totalVisits: number;
  totalCustomers: number;
  totalArticles: number;
  userGrowth: number;
  orderGrowth: number;
  revenueGrowth: number;
  visitGrowth: number;
  customerGrowth: number;
}

interface TrendData {
  labels: string[];
  visits: number[];
  orders: number[];
  revenue: number[];
}

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [trends, setTrends] = useState<TrendData | null>(null);
  const [pieData, setPieData] = useState<Array<{ name: string; value: number }>>([]);
  const [ranking, setRanking] = useState<any>(null);
  const [trendPeriod, setTrendPeriod] = useState<string>('month');

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [overviewRes, trendsRes, pieRes, rankingRes] = await Promise.all([
          dashboardApi.getOverview(),
          dashboardApi.getTrends({ period: trendPeriod }),
          dashboardApi.getPie(),
          dashboardApi.getRanking(),
        ]);
        if (overviewRes.success) setOverview(overviewRes.data as OverviewData);
        if (trendsRes.success) setTrends(trendsRes.data as TrendData);
        if (pieRes.success) setPieData(pieRes.data as Array<{ name: string; value: number }>);
        if (rankingRes.success) setRanking(rankingRes.data);
      } catch {
        // 使用 fallback 数据
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [trendPeriod]);

  /** 趋势图配置 */
  const trendOption: EChartsOption = useMemo(
    () => {
      if (!trends) return {};
      return {
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'cross' },
        },
        legend: {
          data: ['访问量', '订单量', '营收'],
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true,
        },
        xAxis: {
          type: 'category',
          data: trends.labels,
        },
        yAxis: [
          { type: 'value', name: '数量' },
          { type: 'value', name: '营收(元)', position: 'right' },
        ],
        series: [
          {
            name: '访问量',
            type: 'bar',
            data: trends.visits,
            itemStyle: { color: '#1890ff' },
          },
          {
            name: '订单量',
            type: 'bar',
            data: trends.orders,
            itemStyle: { color: '#52c41a' },
          },
          {
            name: '营收',
            type: 'line',
            yAxisIndex: 1,
            data: trends.revenue,
            smooth: true,
            itemStyle: { color: '#faad14' },
          },
        ],
      };
    },
    [trends]
  );

  /** 饼图配置 */
  const pieOption: EChartsOption = useMemo(
    () => {
      if (!pieData.length) return {};
      return {
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: {c} ({d}%)',
        },
        legend: {
          orient: 'vertical',
          left: 'left',
          data: pieData.map((d) => d.name),
        },
        series: [
          {
            name: '访问来源',
            type: 'pie',
            radius: ['40%', '70%'],
            avoidLabelOverlap: false,
            itemStyle: {
              borderRadius: 10,
              borderColor: '#fff',
              borderWidth: 2,
            },
            label: {
              show: false,
              position: 'center',
            },
            emphasis: {
              label: {
                show: true,
                fontSize: 20,
                fontWeight: 'bold',
              },
            },
            labelLine: {
              show: false,
            },
            data: pieData,
          },
        ],
      };
    },
    [pieData]
  );

  /** 排行榜列 */
  const productRankCols = [
    { title: '排名', key: 'rank', width: 60, render: (_: any, __: any, idx: number) => idx + 1 },
    { title: '商品名', dataIndex: 'name', key: 'name' },
    { title: '销量', dataIndex: 'sales', key: 'sales' },
    { title: '金额', dataIndex: 'amount', key: 'amount', render: (v: number) => `¥${v.toLocaleString()}` },
  ];

  const customerRankCols = [
    { title: '排名', key: 'rank', width: 60, render: (_: any, __: any, idx: number) => idx + 1 },
    { title: '客户名', dataIndex: 'name', key: 'name' },
    { title: '消费总额', dataIndex: 'amount', key: 'amount', render: (v: number) => `¥${v.toLocaleString()}` },
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <Spin size="large" tip="加载中..." />
      </div>
    );
  }

  const statsCards = overview ? [
    { title: '总用户数', value: overview.totalUsers, growth: overview.userGrowth, icon: <UserOutlined />, color: '#1890ff' },
    { title: '总订单数', value: overview.totalOrders, growth: overview.orderGrowth, icon: <ShoppingCartOutlined />, color: '#52c41a' },
    { title: '总收入(元)', value: overview.totalRevenue, growth: overview.revenueGrowth, icon: <DollarOutlined />, color: '#faad14', precision: 2 },
    { title: '总访问量', value: overview.totalVisits, growth: overview.visitGrowth, icon: <EyeOutlined />, color: '#722ed1' },
    { title: '客户总数', value: overview.totalCustomers, growth: overview.customerGrowth, icon: <TeamOutlined />, color: '#13c2c2' },
    { title: '文章总数', value: overview.totalArticles, growth: 0, icon: <FileTextOutlined />, color: '#eb2f96' },
  ] : [];

  return (
    <div className={styles.dashboard}>
      {/* 概览统计卡片 */}
      <Row gutter={[16, 16]} className={styles.statsRow}>
        {statsCards.map((stat, idx) => (
          <Col xs={24} sm={12} lg={8} xl={4} key={idx}>
            <Card hoverable>
              <Statistic
                title={stat.title}
                value={stat.value}
                prefix={stat.icon}
                precision={stat.precision}
                suffix={
                  stat.growth !== 0 ? (
                    <span className={styles.growth}>
                      {stat.growth > 0 ? (
                        <ArrowUpOutlined style={{ color: '#52c41a' }} />
                      ) : (
                        <ArrowDownOutlined style={{ color: '#ff4d4f' }} />
                      )}
                      {Math.abs(stat.growth)}%
                    </span>
                  ) : null
                }
              />
            </Card>
          </Col>
        ))}
      </Row>

      {/* 图表区域 */}
      <Row gutter={[16, 16]} className={styles.chartsRow}>
        <Col xs={24} lg={16}>
          <Card
            title="趋势分析"
            extra={
              <Segmented
                options={[
                  { label: '按月', value: 'month' },
                  { label: '按周', value: 'week' },
                ]}
                value={trendPeriod}
                onChange={setTrendPeriod}
              />
            }
          >
            <EChartsWrapper option={trendOption} height={400} />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="访问来源">
            <EChartsWrapper option={pieOption} height={400} />
          </Card>
        </Col>
      </Row>

      {/* 排行榜 */}
      {ranking && (
        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col xs={24} lg={12}>
            <Card title="热销商品排行" size="small">
              <Table
                dataSource={ranking.topProducts}
                columns={productRankCols}
                pagination={false}
                size="small"
                rowKey="name"
              />
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card title="高价值客户排行" size="small">
              <Table
                dataSource={ranking.topCustomers}
                columns={customerRankCols}
                pagination={false}
                size="small"
                rowKey="name"
              />
            </Card>
          </Col>
        </Row>
      )}
    </div>
  );
};

export default Dashboard;
