# 智能点餐系统

一个基于 Vue 3 + TypeScript + Vite 开发的现代化点餐系统，提供优雅的用户界面和流畅的交互体验。

## 技术栈

- Vue 3 - 渐进式 JavaScript 框架
- TypeScript - 类型安全的 JavaScript 超集
- Vite - 下一代前端构建工具
- Vue Router - 官方路由管理器
- Pinia - Vue 的状态管理库
- Vant UI - 轻量、可靠的移动端组件库
- SCSS - CSS 预处理器
- Docker - 容器化部署
- Nginx - Web 服务器

## 功能特性

### 1. 商品展示
- 分类展示商品列表
- 商品图片、名称、描述、价格展示
- 热销商品标识
- 支持商品搜索（名称、描述、规格）

### 2. 购物车功能
- 商品添加/删除
- 数量增减
- 规格选择
- 实时价格计算
- 购物车列表展示

### 3. 用户交互
- 分类导航联动
- 商品搜索
- 规格选择弹窗
- 购物车面板
- 平滑滚动效果

### 4. 数据管理
- 商品分类数据
- 商品规格数据
- 购物车状态管理
- 本地数据持久化

## 项目结构

```
src/
├── api/                # API 接口和数据
│   ├── categories/     # 商品分类数据
│   ├── dataLoader.js   # 数据加载器
│   └── request.ts      # 请求封装
├── assets/             # 静态资源
├── components/         # 公共组件
├── router/             # 路由配置
├── stores/             # 状态管理
├── views/              # 页面组件
└── App.vue             # 根组件
```

## 开发环境

- Node.js >= 16.0.0
- npm >= 7.0.0
- Docker >= 20.10.0
- Docker Compose >= 2.0.0

## 安装和运行

### 本地开发

1. 克隆项目
```bash
git clone git@github.com:hanbinsite/dev-ai-dinner.git
```

2. 安装依赖
```bash
npm install
```

3. 启动开发服务器
```bash
npm run dev
```

4. 构建生产版本
```bash
npm run build
```

### Docker 部署

1. 构建 Docker 镜像
```bash
docker build -t dining-app .
```

2. 运行容器
```bash
docker run -d -p 80:80 dining-app
```

3. 使用 Docker Compose（可选）
```bash
docker-compose up -d
```

### Docker 相关文件说明

- `Dockerfile`: 定义构建和运行环境
  - 使用多阶段构建
  - 构建阶段：Node.js 环境
  - 生产阶段：Nginx 环境

- `nginx.conf`: Nginx 配置文件
  - 处理 Vue 路由的 history 模式
  - 配置静态资源缓存
  - 安全限制配置

## 项目特点

- 采用 Vue 3 组合式 API，代码更简洁
- 使用 TypeScript 确保类型安全
- 响应式设计，适配移动端
- 模块化的数据管理
- 优雅的 UI 交互设计
- 支持 Docker 容器化部署

## 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

## 许可证

[MIT](https://choosealicense.com/licenses/mit/)
