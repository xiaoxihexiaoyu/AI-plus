# AI+电商增长引擎

AI+电商培训服务的官方落地页 - 一个交互式、内容驱动的全栈 Web 应用。

## ✨ 核心功能

- **动态内容配置**: 所有文案通过 `public/config.json` 动态加载，非技术人员也能轻松修改
- **安全 API 代理**: 后端代理所有 AI API 请求，敏感信息存储在服务器端 `.env` 文件
- **五维罗盘**: 交互式培训方案生成器，实时调用 AI 生成个性化建议并展示雷达图
- **AI 内容预览**: 课程模块支持实时 AI 生成内容示例
- **AI 需求优化**: 联系表单集成 AI 优化功能，将口语化需求转为专业商业语言

## 🛠️ 技术栈

- **前端**: HTML5, Tailwind CSS, Chart.js, 原生 JavaScript (ES6+ Modules)
- **后端**: Node.js, Express.js, Axios, dotenv
- **AI 接口**: 兼容 OpenAI API 格式（硅基流动、月之暗面等）

## 🚀 快速开始

```bash
# 克隆仓库
git clone https://github.com/xiaoxihexiaoyu/AI-plus.git
cd AI-plus

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑 .env 填入 API_KEY, API_ENDPOINT, API_MODEL

# 启动服务器
npm start
```

访问 `http://localhost:3000`

## 📂 项目结构

```
├── public/          # 前端静态资源
│   ├── index.html
│   ├── style.css
│   ├── script.js
│   └── config.json  # 网站内容配置
├── server.js        # Express 服务器
├── package.json
└── .env.example     # 环境变量示例
```

## 🔧 配置说明

- **修改文案**: 编辑 `public/config.json`
- **更换 AI 模型**: 修改 `.env` 中的 `API_KEY`, `API_ENDPOINT`, `API_MODEL`
