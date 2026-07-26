# 部署说明（自托管 Docker + Nginx）

站点是标准 Next.js 应用（非纯静态导出）：`app/api/search/route.ts` 提供全文搜索，依赖 Node.js
运行时响应，**不能**用纯静态文件服务器直接 serve，Nginx 只做反向代理。

## 目录结构

- `Dockerfile` —— 多阶段构建：`builder` 阶段 `npm ci && npm run build`（`npm ci` 会自动触发
  `postinstall: fumadocs-mdx`），运行阶段只拷贝 `.next`、`public`、`node_modules`、`package.json`。
- `docker-compose.yml` —— `app`（Next.js，容器内监听 3000，不直接对外暴露端口）+ `nginx`（反代 +
  静态资源缓存头，对外监听 80/443）+ `certbot`（按需手动运行的证书续期服务，默认不随 `up` 启动）。
- `deploy/nginx/app.conf` —— Nginx 配置模板，含 HTTPS 挂载点（默认注释，签发证书后启用）。
- `deploy/certbot/{conf,www}` —— Let's Encrypt 证书与 HTTP-01 校验目录，首次 `docker compose up`
  会自动创建（宿主机上为空目录，不需要预先手动建）。

## 构建与启动

```bash
# 首次使用前，把 deploy/nginx/app.conf 里的 server_name 换成实际域名
docker compose build
docker compose up -d
```

- 对外端口：`80`（HTTP）、`443`（HTTPS，证书签发后生效）。
- 站点验证：`curl http://<域名或服务器IP>/`；搜索接口验证：`curl http://<域名或服务器IP>/api/search?query=test`。
- 查看日志：`docker compose logs -f app` / `docker compose logs -f nginx`。

## 更新流程

内容或代码有变更后，在服务器上：

```bash
git pull
docker compose build app
docker compose up -d app
```

`nginx` 容器无需重建（配置文件通过 volume 挂载，改完 `deploy/nginx/app.conf` 后执行
`docker compose exec nginx nginx -s reload` 或 `docker compose restart nginx` 即可生效）。

## 重启 / 回滚

- 重启单个服务：`docker compose restart app`（或 `nginx`）。
- 整体重启：`docker compose down && docker compose up -d`。
- 回滚：`git checkout <上一个稳定 commit>` 后重新执行「更新流程」的两条构建/启动命令。

（本仓库以 `docker compose` 的容器重建/重启作为唯一的进程守护与重启方式，不额外引入 `pm2`。）

## HTTPS / 证书续期

首次签发（域名已解析到服务器、80 端口已放行的前提下）：

```bash
docker compose up -d nginx
docker compose --profile certbot run --rm certbot certonly \
  --webroot -w /var/www/certbot \
  -d docs.bytestream.example.com \
  --email you@example.com --agree-tos --no-eff-email
```

证书签发成功后，取消注释 `deploy/nginx/app.conf` 末尾的 HTTPS `server` 块，把 HTTP block 的
`location /` 改成到 HTTPS 的 301 跳转（文件内已有对应注释指引），然后：

```bash
docker compose exec nginx nginx -s reload
```

**续期**：Let's Encrypt 证书有效期 90 天，`docker-compose.yml` 里的 `certbot` 服务已配置为
每 12 小时自动尝试 `certbot renew`（证书未到续期窗口时是空操作），用下面的命令以后台方式常驻运行：

```bash
docker compose --profile certbot up -d certbot
```

或者不常驻，改用宿主机 cron 定期跑一次性续期任务：

```cron
0 3 * * * cd /path/to/bytestream-docs && docker compose --profile certbot run --rm certbot renew && docker compose exec nginx nginx -s reload
```

## 环境变量

当前代码未读取任何自定义 `process.env` 变量（纯内容型文档站，无后端密钥/API Key 依赖），
`docker-compose.yml` 里只设置了 `NODE_ENV=production`，无需额外配置。
