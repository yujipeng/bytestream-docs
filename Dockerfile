# syntax=docker/dockerfile:1

# ---- builder ----
# fumadocs-mdx 的 postinstall（bin.js）会用 existsSync 探测 next.config.*：
# 探到就走 Next 分支，探不到就 fallback 到 Vite 分支并 `import "vite"`。而 vite
# 只是可选 peer（未安装），所以在只 COPY 了 package*.json、next.config.mjs 还没
# 进来的时候跑 postinstall 必然报 ERR_MODULE_NOT_FOUND: Cannot find package 'vite'。
# 因此这里用 --ignore-scripts 先只装依赖、跳过过早的 postinstall；等 COPY . . 把
# next.config.mjs / source.config.ts / content 都带进来后，再显式跑 postinstall
# 生成 .source（此时能正确命中 Next 分支）供 next build 消费。
FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

COPY . .
RUN npm run postinstall && npm run build

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

EXPOSE 3000
CMD ["npm", "start"]
