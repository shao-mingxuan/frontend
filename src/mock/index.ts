/**
 * Mock 数据工厂
 * 开发环境使用，生产环境删除
 */

/** 生成指定范围的随机整数 */
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** 随机取数组中的一个值 */
function randomPick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/* =====================
   Dashboard Mock
   ===================== */
export const mockDashboardOverview = {
  totalUsers: randomInt(10000, 50000),
  totalOrders: randomInt(5000, 20000),
  totalRevenue: randomInt(100000, 500000),
  totalVisits: randomInt(20000, 100000),
  userGrowth: 12.5,
  orderGrowth: 8.3,
  revenueGrowth: 15.2,
  visitGrowth: -2.1,
};

export const mockDashboardTrends = (() => {
  const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
  return {
    months,
    visits: months.map(() => randomInt(1000, 5000)),
    orders: months.map(() => randomInt(200, 2000)),
    revenue: months.map(() => randomInt(10000, 80000)),
  };
})();

export const mockDashboardPie = [
  { name: '直接访问', value: randomInt(500, 2000) },
  { name: '邮件营销', value: randomInt(200, 800) },
  { name: '搜索引擎', value: randomInt(1000, 3000) },
  { name: '社交媒体', value: randomInt(300, 1500) },
  { name: '视频广告', value: randomInt(100, 500) },
];

/* =====================
   User Mock
   ===================== */
const roles = ['admin', 'editor', 'viewer'];
const statuses = ['active', 'inactive', 'locked'];

export const mockUserList = (() => {
  const list = [];
  for (let i = 1; i <= 86; i++) {
    list.push({
      id: String(i),
      username: `user_${String(i).padStart(3, '0')}`,
      nickname: `用户${i}`,
      email: `user${i}@example.com`,
      phone: `1${randomInt(30, 99)}${randomInt(10000000, 99999999)}`,
      role: randomPick(roles),
      status: randomPick(statuses),
      createdAt: `2024-${String(randomInt(1, 12)).padStart(2, '0')}-${String(randomInt(1, 28)).padStart(2, '0')}`,
    });
  }
  return list;
})();

export const mockUserInfo = {
  id: '1',
  username: 'admin',
  nickname: '超级管理员',
  avatar: '',
  email: 'admin@example.com',
  phone: '13800138000',
  role: 'admin',
  permissions: ['admin', 'user:read', 'user:write', 'role:read', 'role:write', 'system:config'],
};

export const mockLoginResult = {
  token: 'mock_token_' + Date.now(),
  refreshToken: 'mock_refresh_token_' + Date.now(),
  userInfo: mockUserInfo,
};

/* =====================
   Role Mock
   ===================== */
export const mockRoleList = [
  { id: '1', name: 'admin', label: '超级管理员', description: '拥有所有权限', userCount: 3 },
  { id: '2', name: 'editor', label: '编辑者', description: '可编辑内容', userCount: 15 },
  { id: '3', name: 'viewer', label: '查看者', description: '仅查看权限', userCount: 42 },
];

/* =====================
   Dict Mock
   ===================== */
export const mockDictList = [
  { id: '1', code: 'user_status', name: '用户状态', description: '用户状态枚举', items: ['active', 'inactive', 'locked'] },
  { id: '2', code: 'user_role', name: '用户角色', description: '系统角色枚举', items: ['admin', 'editor', 'viewer'] },
  { id: '3', code: 'yes_no', name: '是否', description: '布尔值枚举', items: ['是', '否'] },
];
