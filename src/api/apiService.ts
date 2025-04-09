import request from './request';

export const get = async <T = any>(url: string, config?: RequestConfig): Promise<T> => {
  return request.get(url, config);
};

export const post = async <T = any>(
  url: string,
  data?: any,
  config?: RequestConfig
): Promise<T> => {
  return request.post(url, data, config);
};

export const put = async <T = any>(
  url: string,
  data?: any,
  config?: RequestConfig
): Promise<T> => {
  return request.put(url, data, config);
};

export const deleteRequest = async <T = any>(
  url: string,
  config?: RequestConfig
): Promise<T> => {
  return request.delete(url, config);
};

export type RequestConfig = import('./request').RequestConfig;

// 验证桌号是否存在
export const verifyTable = (tableId: string) => {
  return request.post<{ exists: boolean }>('/table/verify', { tableId });
};

// 检查店铺营业状态
export const checkShopStatus = () => {
  return request.get<{ isOpen: boolean }>('/shop/status');
};

// 获取商品分类和商品信息
export const getGoodsCategories = () => {
  return request.get<{
    id: string
    name: string
    goods: {
      id: string
      name: string
      price: number
      image: string
      description: string
      options?: {
        name: string
        values: {
          name: string
          price: number
        }[]
      }[]
    }[]
  }[]>('/goods/categories');
};

// 提交订单
export const submitOrder = (data: {
  tableId: string
  items: {
    id: string
    name: string
    price: number
    quantity: number
    options?: {
      name: string
      value: string
      price: number
    }[]
  }[]
  totalPrice: number
}) => {
  return request.post<{ orderId: string }>('/order/submit', data);
};