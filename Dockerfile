# syntax=docker/dockerfile:1

# ---- builder ----
# npm ci 会触发 package.json 里的 postinstall（fumadocs-mdx），
# 生成 .source 供 next build 消费，因此必须在这一阶段装依赖，不能挪到运行阶段。
FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# 没有启用 output: 'standalone'，next start 直接跑标准 next build 产物，运行阶段
# 需要完整依赖树（node_modules），跟 serverExternalPackages 无关；public 目录当前仓库
# 还没有，用 mkdir -p 兜底，保证下面的 COPY --from=builder 无论目录是否存在都不会构建失败。
RUN mkdir -p public

# ---- runner ----
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
# lib/openapi.ts 在模块加载时会 readdirSync('./openapi/{text,video}')；缺这个目录会导致
# 未命中 generateStaticParams() 列表的 /docs/* 请求在按需渲染时抛出未捕获异常（500 而非 404）。
COPY --from=builder /app/openapi ./openapi

EXPOSE 3000
CMD ["npm", "start"]
