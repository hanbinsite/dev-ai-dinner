import Request from './request';

export const get = async <T = any>(url: string, config?: RequestConfig): Promise<T> => {
  return Request.get(url, config);
};

export const post = async <T = any>(
  url: string,
  data?: any,
  config?: RequestConfig
): Promise<T> => {
  return Request.post(url, data, config);
};

export const put = async <T = any>(
  url: string,
  data?: any,
  config?: RequestConfig
): Promise<T> => {
  return Request.put(url, data, config);
};

export const deleteRequest = async <T = any>(
  url: string,
  config?: RequestConfig
): Promise<T> => {
  return Request.delete(url, config);
};

export type RequestConfig = import('./request').RequestConfig;