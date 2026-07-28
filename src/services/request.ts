import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { message } from 'antd';
import { APP_CONFIG } from '@/config';
import type { ApiResponse } from '@/types';

/**
 * 创建 Axios 实例
 */
const service: AxiosInstance = axios.create({
  baseURL: APP_CONFIG.API_BASE_URL,
  timeout: APP_CONFIG.API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * 是否正在刷新 Token
 */
let isRefreshing = false;

/**
 * Token 刷新后的请求队列
 */
let refreshSubscribers: ((token: string) => void)[] = [];

/**
 * 将请求添加到刷新队列
 */
function subscribeTokenRefresh(cb: (token: string) => void) {
  refreshSubscribers.push(cb);
}

/**
 * 刷新完成后执行队列中的请求
 */
function onTokenRefreshed(newToken: string) {
  refreshSubscribers.forEach((cb) => cb(newToken));
  refreshSubscribers = [];
}

/**
 * 请求拦截器
 */
service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem(APP_CONFIG.TOKEN_KEY);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

/**
 * 响应拦截器
 */
service.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    const { code, message: msg, data, success } = response.data;

    // 成功
    if (success || code === 200 || code === 0) {
      return response;
    }

    // Token 过期，需要刷新
    if (code === 401) {
      const refreshToken = localStorage.getItem(APP_CONFIG.REFRESH_TOKEN_KEY);

      if (!isRefreshing && refreshToken) {
        isRefreshing = true;
        return axios
          .post(`${APP_CONFIG.API_BASE_URL}/auth/refresh`, { refreshToken })
          .then((res) => {
            const newToken = res.data.data.token;
            localStorage.setItem(APP_CONFIG.TOKEN_KEY, newToken);
            onTokenRefreshed(newToken);

            // 重试当前请求
            response.config.headers!.Authorization = `Bearer ${newToken}`;
            return service(response.config);
          })
          .catch(() => {
            // 刷新失败，清除信息，跳转登录
            localStorage.removeItem(APP_CONFIG.TOKEN_KEY);
            localStorage.removeItem(APP_CONFIG.REFRESH_TOKEN_KEY);
            localStorage.removeItem(APP_CONFIG.USER_INFO_KEY);
            window.location.href = APP_CONFIG.LOGIN_PATH;
            // ✅ 清空队列，避免 Promise 泄漏
            refreshSubscribers = [];
            return Promise.reject(response);
          })
          .finally(() => {
            isRefreshing = false;
          });
      }

      // 正在刷新时，将请求加入队列
      if (isRefreshing) {
        return new Promise((resolve) => {
          subscribeTokenRefresh((newToken: string) => {
            response.config.headers!.Authorization = `Bearer ${newToken}`;
            resolve(service(response.config));
          });
        });
      }

      // 无 refresh token，直接跳转登录
      localStorage.removeItem(APP_CONFIG.TOKEN_KEY);
      localStorage.removeItem(APP_CONFIG.REFRESH_TOKEN_KEY);
      localStorage.removeItem(APP_CONFIG.USER_INFO_KEY);
      window.location.href = APP_CONFIG.LOGIN_PATH;
      return Promise.reject(response);
    }

    // 无权限
    if (code === 403) {
      message.error('无权限访问');
      return Promise.reject(response);
    }

    // 其他错误
    message.error(msg || '请求失败');
    return Promise.reject(response);
  },
  (error) => {
    // 网络错误
    if (!error.response) {
      message.error('网络异常，请检查网络连接');
    } else {
      const status = error.response.status;
      const errorMessages: Record<number, string> = {
        400: '请求参数错误',
        401: '未授权，请登录',
        403: '拒绝访问',
        404: '请求地址不存在',
        408: '请求超时',
        500: '服务器内部错误',
        502: '网关错误',
        503: '服务不可用',
        504: '网关超时',
      };
      message.error(errorMessages[status] || `请求失败 (${status})`);
    }
    return Promise.reject(error);
  }
);

/**
 * 通用请求方法
 */
const request = {
  get<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return service.get(url, config).then((res) => res.data);
  },

  post<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return service.post(url, data, config).then((res) => res.data);
  },

  put<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return service.put(url, data, config).then((res) => res.data);
  },

  delete<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return service.delete(url, config).then((res) => res.data);
  },

  patch<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return service.patch(url, data, config).then((res) => res.data);
  },
};

export default request;
