# AI+电商增长引擎 - 交互式全栈Web应用

这是一个交互式、内容驱动的全栈Web应用，旨在作为AI+电商培训服务的官方落地页。项目前端使用原生HTML/CSS/JS构建，后端使用Node.js + Express搭建了一个安全的API代理服务，实现了前后端分离，并将所有网站文案内容配置化。

[](https://placehold.co)

-----

## ✨ 核心功能

  - **动态内容配置**: 网站的所有文本内容（如标题、描述、按钮文字等）都由根目录下的 `public/config.json` 文件动态加载，非技术人员也能轻松修改文案。
  - **安全API代理**: 所有对外部AI大模型API的请求都通过后端服务器进行代理，用户的API密钥等敏感信息安全地存储在服务器的 `.env` 文件中，不会暴露在前端。
  - **交互式AI方案生成器**: “五维罗盘”功能允许用户通过点选，实时调用AI生成一份个性化的培训方案建议，并用Chart.js动态展示结果雷达图。
  - **AI内容预览**: “课程模块”部分提供“AI生成内容示例”功能，用户点击即可实时调用AI，获取具体课程的亮点介绍，提升用户体验。
  - **AI需求优化**: “联系我们”表单中集成了“AI优化描述”功能，可以帮助用户将口语化的需求描述一键优化为更专业、更清晰的商业语言。
  - **前后端分离**: 清晰的项目结构，将前端（HTML/CSS/JS）、后端（Node.js/Express）和配置（JSON）完全分离，易于维护和扩展。

-----

## 🛠️ 技术栈

  - **前端**:
      - HTML5
      - [Tailwind CSS](https://tailwindcss.com/): 用于快速构建UI的工具优先CSS框架。
      - [Chart.js](https://www.chartjs.org/): 用于数据可视化的JavaScript库。
      - 原生 JavaScript (ES6+ Modules)
  - **后端**:
      - [Node.js](https://nodejs.org/): JavaScript运行时环境。
      - [Express.js](https://expressjs.com/): Node.js的Web应用框架。
      - [Axios](https://axios-http.com/): 用于发送HTTP请求的Promise库。
      - `dotenv`: 用于管理环境变量。
  - **AI模型接口**: 兼容所有与OpenAI API格式一致的大模型服务商（如硅基流动、月之暗面等）。

-----

## 📂 项目结构

```
ai-ecommerce-webapp/
├── public/              # 存放所有前端静态资源
│   ├── index.html       # 前端主HTML文件
│   ├── style.css        # 前端样式文件
│   ├── script.js        # 前端核心逻辑
│   └── config.json      # 网站内容配置文件
├── .env                 # (本地配置，需手动创建) 存放API密钥等环境变量
├── .env.example         # 环境变量示例文件
├── .gitignore           # Git忽略配置文件
├── package.json         # 项目依赖与脚本配置
├── server.js            # 后端Express服务器
└── README.md            # 项目说明文档
```

-----

## 🚀 快速开始

请按照以下步骤在本地运行此项目。

### 1\. 克隆仓库

```bash
git clone <your-repository-url>
cd ai-ecommerce-webapp
```

### 2\. 安装依赖

此项目仅需安装后端依赖。

```bash
npm install
```

### 3\. 配置环境变量

将根目录下的 `.env.example` 文件复制并重命名为 `.env`。

```bash
cp .env.example .env
```

然后，编辑 `.env` 文件，填入您自己的API服务商提供的信息。

```dotenv
# .env

# 您的API密钥
API_KEY="sk-xxxxxxxxxxxxxxxxxxxxxxxx"

# 您的API接入点 (Endpoint)
API_ENDPOINT="https://api.siliconflow.cn/v1/chat/completions"

# 您希望使用的模型名称
API_MODEL="Qwen/Qwen3-8B"

# 服务器运行端口 (可选)
PORT=3000
```

### 4\. 启动服务器

```bash
npm start
```

服务器启动后，您将在终端看到以下输出：

```
Server is running on http://localhost:3000
```

### 5\. 访问应用

在您的浏览器中打开 `http://localhost:3000`，即可看到运行中的Web应用。

-----

## 🔧 自定义与配置

### 修改网站文案

若要修改网站上显示的任何文本，请直接编辑 `public/config.json` 文件。文件结构与网站内容的层级一一对应，修改后刷新浏览器即可看到变化。

### 更换AI模型

若要更换AI模型或API服务商，只需修改 `.env` 文件中的 `API_KEY`, `API_ENDPOINT` 和 `API_MODEL` 即可，无需改动任何代码。

-----

## 🤝 贡献

欢迎任何形式的贡献！如果您有好的想法或发现了Bug，请随时提交Pull Request或开启一个Issue。

1.  Fork 本仓库
2.  创建您的新分支 (`git checkout -b feature/AmazingFeature`)
3.  提交您的更改 (`git commit -m 'Add some AmazingFeature'`)
4.  将您的分支推送到远程 (`git push origin feature/AmazingFeature`)
5.  开启一个 Pull Request

