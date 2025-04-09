import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

type RequestConfig = AxiosRequestConfig & {
  showLoading?: boolean;
  showError?: boolean;
};

export class Request {
  private instance: AxiosInstance;
  private baseConfig: RequestConfig = {
    baseURL: import.meta.env.VITE_API_BASE_URL || '',
    timeout: 10000,
    showLoading: true,
    showError: true
  };

  constructor(config?: RequestConfig) {
    this.instance = axios.create(Object.assign(this.baseConfig, config));
    this.setupInterceptors();
  }

  private setupInterceptors() {
    // 请求拦截
    this.instance.interceptors.request.use(
      (config) => {
        // 添加token
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // 响应拦截
    this.instance.interceptors.response.use(
      (response: AxiosResponse) => {
        const { data } = response;
        // 根据后端接口规范处理
        if (data.code !== 200) {
          // 可以在这里统一处理错误
          return Promise.reject(data);
        }
        return data;
      },
      (error) => {
        // 处理401未授权
        if (error.response?.status === 401) {
          alert('请先登录');
          // 这里可以添加跳转到登录页的逻辑
        }
        return Promise.reject(error);
      }
    );
  }


}

export default new Request();