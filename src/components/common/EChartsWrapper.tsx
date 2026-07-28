import React, { useRef, useEffect, useCallback } from 'react';
import * as echarts from 'echarts/core';
import { BarChart, LineChart, PieChart, RadarChart, GaugeChart, ScatterChart } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  DatasetComponent,
  TransformComponent,
  ToolboxComponent,
  DataZoomComponent,
  VisualMapComponent,
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import type { EChartsOption } from 'echarts';
import styles from './EChartsWrapper.module.less';

// 按需注册 ECharts 模块
echarts.use([
  BarChart,
  LineChart,
  PieChart,
  RadarChart,
  GaugeChart,
  ScatterChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  DatasetComponent,
  TransformComponent,
  ToolboxComponent,
  DataZoomComponent,
  VisualMapComponent,
  CanvasRenderer,
]);

interface EChartsWrapperProps {
  /** ECharts 配置项 */
  option: EChartsOption;
  /** 图表宽度 */
  width?: string | number;
  /** 图表高度 */
  height?: string | number;
  /** 是否自动 resize */
  autoResize?: boolean;
  /** 主题 */
  theme?: string | object;
  /** 样式类名 */
  className?: string;
}

/**
 * ECharts 封装组件
 * - 按需加载模块（减少包体积）
 * - 自适应 resize
 * - 支持 loading 状态
 */
const EChartsWrapper: React.FC<EChartsWrapperProps> = ({
  option,
  width = '100%',
  height = 400,
  autoResize = true,
  theme,
  className,
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  /** 初始化图表 */
  const initChart = useCallback(() => {
    if (!chartRef.current) return;

    // 销毁旧实例
    if (chartInstance.current) {
      chartInstance.current.dispose();
    }

    chartInstance.current = echarts.init(chartRef.current, theme);
    chartInstance.current.setOption(option);
  }, [theme]);

  /** 更新图表配置 */
  const updateChart = useCallback(() => {
    if (!chartInstance.current) return;
    chartInstance.current.setOption(option, true);
  }, [option]);

  /** resize */
  const resize = useCallback(() => {
    chartInstance.current?.resize();
  }, []);

  // 初始化
  useEffect(() => {
    initChart();
    return () => {
      chartInstance.current?.dispose();
    };
  }, [initChart]);

  // 更新配置
  useEffect(() => {
    updateChart();
  }, [updateChart]);

  // 自动 resize
  useEffect(() => {
    if (!autoResize) return;

    const handleResize = () => resize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [autoResize, resize]);

  return (
    <div
      ref={chartRef}
      className={`${styles.chartWrapper} ${className || ''}`}
      style={{ width, height }}
    />
  );
};

export default EChartsWrapper;
