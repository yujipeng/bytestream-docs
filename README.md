# bytestream-docs

bytestream AI 中转站的 API 对接文档站，基于 [new-api](https://github.com/QuantumNous/new-api) 项目对接能力编写，覆盖：

- **文本模型**：OpenAI、Claude、智谱、千问（Qwen）、MiniMax、Kimi、Deepseek 系列
- **视频模型**：Seedance、HappyHorse

每个模型/服务商提供一份手写的接入说明文档（`content/docs/**/*.mdx`）。

## 技术栈

- [Next.js](https://nextjs.org/) `^16.2.11`（App Router）+ React `^19.2.8`
- [Fumadocs](https://fumadocs.dev/)：`fumadocs-core` `^16.12.1` / `fumadocs-ui` `^16.12.1` / `fumadocs-mdx` `^15.2.0`
- Tailwind CSS `^4.3.3`（`@tailwindcss/postcss`）
- TypeScript `^5.7.0`

## 本地开发

```bash
npm install        # 会自动触发 postinstall: fumadocs-mdx，生成 .source 供 next build/dev 消费
npm run dev         # 本地开发服务器
npm run build        # 生产构建
```

## 部署

已提供基于 Docker + Nginx 的自托管部署方案（多阶段 Dockerfile、`docker-compose.yml`、Nginx 反代模板、Certbot HTTPS 续期），完整步骤见 [`DEPLOY.md`](./DEPLOY.md)。

## 目录结构

```
app/                    # Next.js App Router 页面与路由
  docs/[[...slug]]/     # 文档正文渲染入口
  api/search/           # 文档全文搜索接口
content/docs/           # 手写 MDX 文档
  text/                 # 文本模型接入文档
  video/                # 视频模型接入文档
lib/                    # Fumadocs source 等运行时配置
deploy/                 # Nginx 配置模板、Certbot 数据卷目录
```
