# XJPCNM 官网

[xjpcnm.com](https://xjpcnm.com) 的官方网站 —— **Technology that works for you.**

XJPCNM 是一家智能计算与数字生产力产品公司，旗下产品：

- **XJPCNM One** — AI 智能工作空间
- **XJPCNM Flow** — 可视化工作流自动化平台
- **XJPCNM Cloud** — 面向开发者的 AI Gateway 与 Serverless 平台

纯静态站点（HTML / CSS / 原生 JavaScript），无需构建。

## 目录结构

```
.
├── index.html          # 首页
├── privacy.html        # 隐私政策
├── terms.html          # 服务条款
├── styles.css          # 全站样式
├── main.js             # 全站交互
├── assets/
│   ├── favicon.svg
│   └── logos/          # 集成伙伴 logo（来自 Simple Icons，CC0）
├── Dockerfile
├── nginx.conf
└── docker-compose.yml
```

## 本地预览

直接双击 `index.html`，或启动一个本地服务器：

```bash
python -m http.server 8000
# 访问 http://localhost:8000
```

## Docker 部署（端口 8085）

使用 Docker Compose：

```bash
docker compose up -d --build
# 访问 http://localhost:8085
```

或使用 Docker 命令：

```bash
docker build -t xjpcnm-web .
docker run -d --name xjpcnm-web -p 8085:8085 --restart unless-stopped xjpcnm-web
```

常用命令：

```bash
docker compose logs -f      # 查看日志
docker compose down         # 停止并删除容器
docker compose up -d --build  # 修改代码后重新构建并启动
```

镜像基于 `nginxinc/nginx-unprivileged`（非 root 运行），已开启 gzip、基础安全响应头和静态资源缓存，并支持 `/privacy`、`/terms` 这类不带 `.html` 的地址。

## 上线前待办

- [ ] 在 `privacy.html` 和 `terms.html` 中填写黄色虚线标出的公司信息，并请律师审阅
- [ ] 接通联系表单后端（目前仅做前端校验）
- [ ] 开通 `sales@`、`support@`、`privacy@`、`legal@`、`security@` 邮箱
- [ ] 将价格、SLA 等占位内容替换为真实信息
- [ ] 生产环境建议在前面加 HTTPS 反向代理（如 Caddy、Nginx 或 Cloudflare）

## 许可

站点代码与内容 © XJPCNM，保留所有权利。第三方 logo 归各自商标所有者所有。
